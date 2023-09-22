import { nanoid } from "@reduxjs/toolkit";
import { Pattern, PatternId, PatternStream, getStreamTicks } from "./pattern";
import {
  PatternTrack,
  ScaleTrack,
  ScaleTrackNoteMap,
  TrackId,
  createScaleTrackNoteMap,
  getScaleTrackScale,
  getTrackParents,
} from "./tracks";
import {
  getLastTransposition,
  Transposition,
  applyTranspositionsToPattern,
  applyTranspositionsToScale,
  TranspositionId,
} from "./transposition";
import { Tick } from "./units";
import { MIDI } from "./midi";
import { CLIP_THEMES, ClipTheme } from "./clip.themes";
import { SessionMapState } from "redux/slices/sessionMap";
export * from "./clip.themes";

export type ClipId = string;

// A clip is a specific instance of a pattern that is played in a track.
export interface Clip {
  id: ClipId;
  patternId: PatternId;
  trackId: TrackId;
  tick: Tick; // time in ticks

  duration?: Tick; // optional duration in ticks for cut clips
  offset: Tick; // optional offset in ticks for cut clips

  color?: string; // optional color for the clip
}

export const isClip = (obj: any): obj is Clip => {
  const { id, patternId, trackId, tick, offset } = obj;
  return (
    id !== undefined &&
    patternId !== undefined &&
    trackId !== undefined &&
    tick !== undefined &&
    offset !== undefined
  );
};

export type ClipNoId = Omit<Clip, "id">;

// Create a clip with a unique ID
export const initializeClip = (clip: ClipNoId = defaultClip): Clip => ({
  ...clip,
  id: nanoid(),
});

export const defaultClip: Clip = {
  id: "default-clip",
  patternId: "default-pattern",
  trackId: "default-track",
  tick: 0,
  offset: 0,
};
export const testClip = (clip: Partial<Clip>): Clip => ({
  ...defaultClip,
  ...clip,
});

export const createClipTag = (clip: Clip) => {
  return `${clip.id}@${clip.patternId}@${clip.trackId}@${clip.tick}@${clip.offset}`;
};

export const getClipTicks = (clip?: Clip, pattern?: Pattern) => {
  if (!clip || !pattern) return 1;
  if (clip.duration) return clip.duration;
  const ticks = getStreamTicks(pattern.stream);
  return ticks - clip.offset;
};

export const getClipTheme = (clip: Clip): ClipTheme => {
  const color = clip.color ?? "sky";
  return CLIP_THEMES[color] ?? CLIP_THEMES["sky"];
};

export const getClipNotes = (
  clip: Clip,
  stream: PatternStream
): PatternStream => {
  const clipStream = clip.duration
    ? stream.slice(clip.offset, clip.offset + clip.duration)
    : stream.slice(clip.offset);

  return clipStream.map((chord) => {
    return chord.map((note) => {
      return { ...note, MIDI: MIDI.clampNote(note.MIDI) };
    });
  }) as PatternStream;
};

export const getClipStream = (
  clip: Clip,
  dependencies: {
    scaleTracks: Record<TrackId, ScaleTrack>;
    patternTracks: Record<TrackId, PatternTrack>;
    patterns: Record<PatternId, Pattern>;
    transpositions: Record<TranspositionId, Transposition>;
    sessionMap: SessionMapState;
  }
) => {
  if (!clip) return [] as PatternStream;

  const { patterns, patternTracks, scaleTracks, transpositions, sessionMap } =
    dependencies;

  // Get the pattern
  const pattern = patterns[clip.patternId];
  if (!pattern) return [] as PatternStream;

  // Make sure the pattern has a stream
  const ticks = getStreamTicks(pattern.stream);
  if (isNaN(ticks) || ticks < 1) return [];

  // Get the pattern track
  const patternTrack = patternTracks[clip.trackId];
  if (!patternTrack?.parentId) return [] as PatternStream;

  // Get the scale track
  const scaleTrack = scaleTracks[patternTrack.parentId];
  if (!scaleTrack) return [] as PatternStream;

  // Get the parent scales
  const parents = getTrackParents(scaleTrack, { scaleTracks });

  // Get all transpositions of each parent
  const scaleTranspositionIds = parents.map(
    (scaleTrack) => sessionMap.byId[scaleTrack.id]?.transpositionIds ?? []
  );
  const scaleTranspositions = scaleTranspositionIds
    .map((ids) => ids.map((id) => transpositions[id]))
    .map((transpositions) => transpositions.sort((a, b) => b.tick - a.tick));

  // Get all transpositions of the clip
  const clipTranspositionIds =
    sessionMap.byId[clip.trackId]?.transpositionIds ?? [];
  const clipTranspositions = clipTranspositionIds
    .map((id) => transpositions[id])
    .filter(Boolean)
    .sort((a, b) => b.tick - a.tick);

  const startTick = clip.tick;
  let stream: PatternStream = [];
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
    const chord = pattern.stream[chordCount];
    const firstNote = chord?.[0];
    if (!chord || !firstNote) {
      stream.push([]);
      continue;
    }

    // Increment the stream duration when the chord is reached
    if (streamDuration === i) streamDuration += firstNote.duration;

    // Increment the chord count and continue if rest
    chordCount += 1;
    if (MIDI.isRest(chord)) {
      stream.push([]);
      continue;
    }

    // Get the transpositions at the current time
    const tick = startTick + i - clip.offset;
    let clipScale = getScaleTrackScale(parents[0], { scaleTracks });
    const transposedScales = [];
    // Apply all transpositions
    for (let i = 0; i < scaleTranspositions.length; i++) {
      const scale = getScaleTrackScale(parents[i], { scaleTracks });
      const transpositions = scaleTranspositions[i];
      const scaleTransposition = getLastTransposition(
        transpositions,
        tick,
        false
      );
      const currentScale = applyTranspositionsToScale(scale, {
        transpositions: scaleTransposition?.offsets,
        scaleTracks,
        sessionMap,
      });
      transposedScales.push(currentScale);
      clipScale = currentScale;
    }

    // Get the pattern stream
    const scaleTrackScaleMap = createScaleTrackNoteMap(parents);
    const scaleMap: ScaleTrackNoteMap = transposedScales.reduce(
      (acc, scale, i) => {
        const scaleTrack = parents[i];
        acc[scaleTrack.id] = scale;
        return acc;
      },
      scaleTrackScaleMap
    );
    // Apply the clip's transpositions
    const transposition = getLastTransposition(clipTranspositions, tick, false);
    const transposedPattern = applyTranspositionsToPattern(pattern, {
      transpositions: transposition?.offsets,
      scaleMap,
    });
    const transposedStream = transposedPattern.stream;

    // Add the transposed stream to the stream
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
