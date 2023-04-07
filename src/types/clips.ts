import { nanoid } from "@reduxjs/toolkit";

import {
  getStreamChordAtOffset,
  getStreamDuration,
  invertPatternStream,
  isRest,
  Pattern,
  PatternId,
  PatternStream,
  realizePattern,
  transposePatternStream,
} from "./patterns";
import { ChromaticScale } from "./presets/scales";
import { invertScale, Scale, transposeScale } from "./scales";
import { TrackId } from "./tracks";
import { lastTransformAtTime, Transform } from "./transform";

export type ClipId = string;

// A clip is a specific instance of a pattern that is played in a track.
// If the end time is not specified, the pattern is played once.
export interface Clip {
  id: ClipId;
  patternId: PatternId;
  trackId: TrackId;
  startTime: number;
  duration?: number;
  offset: number;
}

export type ClipNoId = Omit<Clip, "id">;

// Create a clip with a unique ID
export const initializeClip = (clip: ClipNoId = defaultClip): Clip => ({
  ...clip,
  id: nanoid(),
});

export const defaultClip: Clip = {
  id: "",
  patternId: "",
  trackId: "",
  startTime: 0,
  offset: 0,
};

export const getClipDuration = (clip?: Clip, pattern?: Pattern) => {
  if (!clip || !pattern) return 0;
  const duration = getStreamDuration(pattern.stream);
  return clip.duration || duration - clip.offset;
};

export const getClipNotes = (
  clip: Clip,
  stream: PatternStream
): PatternStream => {
  if (!clip.duration) return stream.slice(clip.offset);
  return stream.slice(clip.offset, clip.offset + clip.duration);
};

export const getClipStream = (
  clip: Clip,
  pattern: Pattern,
  scale: Scale,
  transforms: Transform[],
  scaleTransforms: Transform[]
): PatternStream => {
  const duration = getStreamDuration(pattern.stream);
  if (isNaN(duration)) return [];
  let chordCount = 0;

  const stream = new Array(duration).fill(0).map((_, index) => {
    // Get the chord at the current index
    const chord = getStreamChordAtOffset(pattern.stream, index);
    if (!chord || !chord.length) return [];
    chordCount += 1;

    // Check if the first note is a rest
    const firstNote = chord[0];
    if (isRest(firstNote)) return chord;

    // Get the current time
    const time = clip.startTime + index - clip.offset;

    // Get the current scale or the default scale
    let newScale = scale.notes.length ? scale : ChromaticScale;

    // Get the transforms at the current time
    const scaleTransform = lastTransformAtTime(scaleTransforms, time);
    const transform = lastTransformAtTime(transforms, time);

    // Transform the scale if there is a scale transformation
    if (scaleTransform) {
      const scaleBigT = Number(scaleTransform?.scalarTranspose ?? 0);
      const scaleLittleT = Number(scaleTransform?.chordalTranspose ?? 0);
      const transposedScale = transposeScale(newScale, scaleBigT);
      const invertedScale = invertScale(transposedScale, scaleLittleT);
      newScale = invertedScale;
    }

    // Get the stream of the transformed scale
    const stream = realizePattern(pattern, newScale);

    // Transform the stream if there is a transformation
    const bigT = Number(transform?.scalarTranspose ?? 0);
    const littleT = Number(transform?.chordalTranspose ?? 0);
    const transposedStream = transposePatternStream(stream, bigT, newScale);
    const invertedStream = invertPatternStream(transposedStream, littleT);
    return invertedStream[chordCount - 1];
  });

  // Return the stream of the clip
  return getClipNotes(clip, stream);
};
