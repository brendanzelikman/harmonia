import * as Pattern from "types/Pattern";
import * as PatternTrack from "types/PatternTrack";
import * as ScaleTrack from "types/ScaleTrack";
import * as Track from "types/Track";
import * as Transposition from "types/Transposition";
import * as TrackHierarchy from "types/TrackHierarchy";
import { MIDI } from "types/midi";
import { createMap } from "types/util";
import { Clip, ClipId, isClip } from "./ClipTypes";
import {
  ClipTheme,
  DEFAULT_CLIP_THEME,
  DEFAULT_CLIP_COLOR,
  CLIP_THEMES,
} from "./ClipThemes";
import { NestedScaleMap } from "types/Scale";

/**
 * Get the unique tag of a given Clip.
 * @param clip Optional. The Clip object.
 * @returns Unique tag string. If the Clip is invalid, return the error tag.
 */
export const getClipTag = (clip: Partial<Clip>) => {
  const { id, patternId, trackId, tick, offset } = clip;
  return `${id}@${patternId}@${trackId}@${tick}@${offset}`;
};

/**
 * Get the total duration of the Clip in ticks. If the Clip has a duration, return it. Otherwise, return the duration of the Pattern.
 * @param clip Optional. The Clip object.
 * @param pattern Optional. The Pattern object.
 * @returns Duration in ticks. If the Clip or Pattern is invalid, return 1.
 */
export const getClipDuration = (clip?: Clip, pattern?: Pattern.Pattern) => {
  if (!isClip(clip) || !Pattern.isPattern(pattern)) return 1;

  // If the clip has a duration, return it
  if (clip.duration !== undefined) return clip.duration ?? 1;

  // Otherwise, return the pattern's duration
  const ticks = Pattern.getPatternStreamTicks(pattern.stream);
  return ticks - clip.offset;
};

/**
 * Get the theme of the clip.
 * @param clip The Clip object.
 * @returns The ClipTheme object. If the Clip is invalid, return the default ClipTheme.
 */
export const getClipTheme = (clip?: Clip): ClipTheme => {
  if (!isClip(clip)) return DEFAULT_CLIP_THEME;
  const color = clip.color ?? DEFAULT_CLIP_COLOR;
  return CLIP_THEMES[color] ?? DEFAULT_CLIP_THEME;
};

/**
 * Get the notes of a Clip based on its offset and duration.
 * @param clip The Clip object.
 * @param stream The PatternStream.
 * @returns A sliced PatternStream. If the Clip or PatternStream is invalid, return an empty array.
 */
export const getClipNotes = (
  clip: Clip,
  stream: Pattern.PatternStream
): Pattern.PatternStream => {
  if (!isClip(clip) || !Pattern.isPatternStream(stream)) return [];
  if (clip.duration === undefined) return stream.slice(clip.offset);
  return stream.slice(clip.offset, clip.offset + clip.duration);
};

interface StreamDependencies {
  patternMap: Pattern.PatternMap;
  scaleMap: NestedScaleMap;
  scaleTrackMap: ScaleTrack.ScaleTrackMap;
  patternTrackMap: PatternTrack.PatternTrackMap;
  transpositionMap: Transposition.TranspositionMap;
  trackNodeMap: TrackHierarchy.TrackNodeMap;
}

interface ClipStreamDependencies extends StreamDependencies {
  clip: Clip;
}

/**
 * Get the fully transposed stream of a clip using information from the Redux store.
 * @param clip  The Clip object.
 * @param dependencies The dependencies of the clip
 * @returns The fully transposed PatternStream of the clip. If any of the dependencies are invalid, return an empty array.
 */
export const getClipStream = (props: ClipStreamDependencies) => {
  const clip = props.clip;
  if (!isClip(clip)) return [] as Pattern.PatternStream;

  // Get the clip's pattern
  const pattern = props.patternMap?.[clip.patternId];
  if (!Pattern.isPattern(pattern)) return [] as Pattern.PatternStream;

  // Make sure the pattern has a stream
  const patternStream = pattern.stream;
  const ticks = Pattern.getPatternStreamTicks(patternStream);
  if (isNaN(ticks) || ticks < 1) return [];

  // Get the clip's pattern track
  const patternTrack = props.patternTrackMap?.[clip.trackId];
  if (!PatternTrack.isPatternTrack(patternTrack))
    return [] as Pattern.PatternStream;

  // Get all parent scale tracks and their transpositions
  const { scaleMap, scaleTrackMap, transpositionMap, trackNodeMap } = props;
  const parents = Track.getTrackParents(patternTrack, scaleTrackMap);
  const parentTranspositions = parents.map((parent) =>
    TrackHierarchy.getTrackTranspositions(
      parent,
      transpositionMap,
      trackNodeMap
    )
  );

  // Get the clip's transpositions
  const clipTranspositions = TrackHierarchy.getTrackTranspositions(
    patternTrack,
    transpositionMap,
    trackNodeMap
  );

  // Initialize the loop variables
  const startTick = clip.tick;
  let stream: Pattern.PatternStream = [];
  let chordCount = 0;
  let streamDuration = 0;

  // Create a stream of chords for every tick
  for (let i = 0; i < ticks; i++) {
    // If a chord is being played, continue
    if (streamDuration > i) {
      stream.push([]);
      continue;
    }

    // Get the chord at the current index
    const chord = patternStream[chordCount];
    if (!Pattern.isPatternChord(chord)) {
      stream.push([]);
      continue;
    }
    const firstNote = chord[0];
    if (!chord || !firstNote) {
      stream.push([]);
      continue;
    }

    // Increment the stream duration when the chord is reached
    if (streamDuration === i) streamDuration += firstNote.duration;

    // Increment the chord count and continue if rest
    chordCount += 1;
    if (MIDI.isRest(chord)) {
      stream.push(chord);
      continue;
    }

    // Get the current tick
    const tick = startTick + i - clip.offset;

    // Transpose the parent tracks at the current tick
    const transposedParents = Track.getTransposedScaleTrackScalesAtTick(
      parents,
      parentTranspositions,
      scaleMap,
      tick
    );
    const transposedScaleMap = createMap<NestedScaleMap>(transposedParents);
    const transposition = Transposition.getLastTransposition(
      clipTranspositions,
      tick,
      false
    );
    const quantizations = parentTranspositions.map(
      (t) => !!Transposition.getLastTransposition(t, tick, false)
    );

    // Get the transposed pattern stream
    const transposedStream = Track.getTransposedPatternStream({
      pattern,
      transposition,
      tracks: parents,
      scaleMap: transposedScaleMap,
      scaleTrackMap,
      quantizations,
    });

    // Add the transposed chord to the clip stream
    const clipChord = transposedStream[chordCount - 1];
    if (!clipChord) {
      stream.push([]);
      continue;
    }
    stream.push(clipChord);
  }

  // Return the stream of the clip
  return getClipNotes(clip, stream);
};

interface ClipsStreamDependencies extends StreamDependencies {
  clips: Clip[];
}

/**
 * Get the fully transposed streams of an array of clips using information from the Redux store.
 * @param clips The array of Clip objects.
 * @param dependencies The dependencies of the clips
 * @returns A map of clip IDs to fully transposed PatternStreams. If any of the dependencies are invalid, return an empty object.
 */
export const getClipStreams = (props: ClipsStreamDependencies) => {
  if (!props.clips) return {};
  return props.clips.reduce((acc, cur) => {
    const stream = getClipStream({ ...props, clip: cur });
    return { ...acc, [cur.id]: stream };
  }, {} as Record<ClipId, Pattern.PatternStream>);
};
