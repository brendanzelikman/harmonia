import { Clip, ClipUpdate, isClip } from "./ClipTypes";
import {
  ClipTheme,
  DEFAULT_CLIP_THEME,
  DEFAULT_CLIP_COLOR,
  CLIP_THEMES,
} from "./ClipThemes";
import {
  Pattern,
  isPattern,
  getPatternStreamDuration,
  getPatternBlockDuration,
  resolvePatternStreamToMidi,
  PatternMidiStream,
  getTransposedPatternStream,
  isPatternRest,
} from "types/Pattern";
import { TrackArrangement } from "types/Arrangement";
import { ScaleMap } from "types/Scale";
import { getTrackScaleChain } from "types/Track";
import { getValuesByKeys } from "utils/objects";
import {
  getCurrentTransposition,
  getTranspositionScaleVector,
} from "types/Transposition";
import { parsePortalChunkId } from "types/Portal";

// ------------------------------------------------------------
// Clip Serializers
// ------------------------------------------------------------

/** Get a `Clip` as a string. */
export const getClipAsString = (clip: Clip) => {
  const { id, trackId, patternId, tick, offset } = clip;
  return `${id},${trackId},${patternId},${tick},${offset}`;
};

/** Get a `ClipUpdate` as a string. */
export const getClipUpdateAsString = (clip: ClipUpdate) => {
  return JSON.stringify(clip);
};

// ------------------------------------------------------------
// Clip Properties
// ------------------------------------------------------------

/** Get the theme of a `Clip`. */
export const getClipTheme = (clip?: Clip): ClipTheme => {
  if (!isClip(clip)) return DEFAULT_CLIP_THEME;
  const color = clip.color ?? DEFAULT_CLIP_COLOR;
  return CLIP_THEMES[color] ?? DEFAULT_CLIP_THEME;
};

/** Get the total duration of a `Clip` in ticks */
export const getClipDuration = (clip?: Clip, pattern?: Pattern) => {
  if (!isClip(clip) || !isPattern(pattern)) return 1;

  // If the clip has a duration, return it
  if (clip.duration !== undefined) return clip.duration ?? 1;

  // Otherwise, return the pattern's duration
  const ticks = getPatternStreamDuration(pattern.stream);
  return ticks - clip.offset;
};

// ------------------------------------------------------------
// Clip Stream
// ------------------------------------------------------------

/** A `Clip` can require the entire arrangement to compute its stream. */
export interface ClipStreamDependencies extends Partial<TrackArrangement> {
  pattern: Pattern;
  scales?: ScaleMap;
}

/** Get the stream of a `Clip` */
export const getClipStream = (
  clip: Clip,
  deps: ClipStreamDependencies
): PatternMidiStream => {
  const { trackId } = clip;
  const { pattern, scales, ...arrangement } = deps;
  const scaleTracks = arrangement?.scaleTracks ?? {};
  const poseMap = arrangement?.transpositions ?? {};
  if (!pattern) return [];

  // Initialize the loop variables
  const stream = [] as PatternMidiStream;
  let blockCount = 0;
  let streamDuration = 0;
  const totalTicks = getPatternStreamDuration(pattern.stream);

  // Get the offset of the clip
  let storedOffset = 0;
  for (let i = 0; i < pattern.stream.length; i++) {
    if (storedOffset >= clip.offset) break;
    const duration = getPatternBlockDuration(pattern.stream[i]);
    storedOffset += duration;
    blockCount += 1;
  }

  // Try to find the transpositions of the clip's track
  const trackNode = arrangement?.tracks?.[trackId];
  const poseIds = Object.keys(poseMap).filter((id) =>
    trackNode?.transpositionIds?.includes(parsePortalChunkId(id))
  );
  const poses = getValuesByKeys(poseMap, poseIds);

  // Create a stream of blocks for every tick
  for (let i = 0; i < totalTicks; i++) {
    const block = pattern.stream[blockCount];

    // If a block is being played or there's no block, continue
    if (streamDuration > i || !block) {
      stream.push([]);
      continue;
    }

    // Increment the stream duration when the block is reached
    const blockDuration = getPatternBlockDuration(block);
    if (streamDuration === i) streamDuration += blockDuration;
    blockCount += 1;

    // If the block is a rest, add it and skip to the next block
    if (isPatternRest(block)) {
      stream.push({ duration: blockDuration });
      continue;
    }

    // Otherwise, transpose the pattern stream using the clip's current transposition
    const tick = clip.tick + i;
    const pose = getCurrentTransposition(poses, tick);
    const vector = getTranspositionScaleVector(pose, scaleTracks);
    const currentStream = getTransposedPatternStream(pattern.stream, vector);

    // Get the transposed scale chain using the arrangement at the current tick
    const chainDeps = { ...arrangement, scales, tick };
    const chain = getTrackScaleChain(trackId, chainDeps);

    // Get the resolved MIDI stream using the current stream and scale chain.
    // The transposition is provided to apply chromatic/chordal offsets at the end.
    const newStream = resolvePatternStreamToMidi(currentStream, chain, pose);
    const newChord = newStream[blockCount - 1];
    stream.push(newChord);
  }

  // Return the stream of the clip
  if (clip.duration === undefined) return stream;
  return stream.slice(0, clip.duration);
};
