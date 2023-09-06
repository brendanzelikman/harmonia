import { nanoid } from "@reduxjs/toolkit";

import {
  rotatePatternStream,
  Pattern,
  PatternId,
  PatternStream,
  realizePattern,
  transposePatternStream,
  getStreamTicks,
} from "./patterns";
import { rotateScale, Scale, transposeScale, chromaticScale } from "./scales";
import { TrackId } from "./tracks";
import {
  createTransformKey,
  lastTransformAtTick,
  Transform,
} from "./transform";
import { Tick } from "./units";
import { MIDI } from "./midi";

export type ClipId = string;

// A clip is a specific instance of a pattern that is played in a track.
export interface Clip {
  id: ClipId;
  patternId: PatternId;
  trackId: TrackId;
  tick: Tick; // time in ticks

  duration?: Tick; // optional duration in ticks for cut clips
  offset: Tick; // optional offset in ticks for cut clips
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
  id: "",
  patternId: "",
  trackId: "",
  tick: 0,
  offset: 0,
};

export const createClipTag = (clip: Clip) => {
  return `${clip.id}@${clip.patternId}@${clip.trackId}@${clip.tick}@${clip.offset}`;
};

export const getClipTicks = (clip?: Clip, pattern?: Pattern) => {
  if (!clip || !pattern) return 1;
  if (clip.duration) return clip.duration;
  const ticks = getStreamTicks(pattern.stream);
  return ticks - clip.offset;
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
  _transforms: Transform[],
  _scaleTransforms: Transform[]
): PatternStream => {
  const ticks = getStreamTicks(pattern.stream);
  if (isNaN(ticks) || ticks < 1) return [];

  const startTick = clip.tick;
  const scaleTransposeMap: Record<string, Scale> = {};
  const streamMap: Record<string, PatternStream> = {};
  const transposedStreamMap: Record<string, PatternStream> = {};
  let stream: PatternStream = [];
  let chordCount = 0;
  let streamDuration = 0;

  // Presort the transforms
  const transforms = _transforms.sort((a, b) => b.tick - a.tick);
  const scaleTransforms = _scaleTransforms.sort((a, b) => b.tick - a.tick);

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

    // Get the current tick
    const tick = startTick + i - clip.offset;

    // Get the current scale or the default scale
    let newScale = scale.notes.length ? scale : chromaticScale;

    // Get the transforms at the current time
    const scaleTransform = lastTransformAtTick(scaleTransforms, tick, false);
    const transform = lastTransformAtTick(transforms, tick, false);

    // Get the keys for the maps
    const stKey = createTransformKey(scaleTransform);

    // Transform the scale if there is a scale transformation
    if (scaleTransform) {
      // Get the offsets
      const scaleN = Number(scaleTransform?.chromaticTranspose ?? 0);
      const scaleBigT = Number(scaleTransform?.scalarTranspose ?? 0);
      const scaleLittleT = Number(scaleTransform?.chordalTranspose ?? 0);

      // Check the map for efficiency, otherwise transpose and add to map
      if (scaleTransposeMap[stKey]) {
        newScale = scaleTransposeMap[stKey];
      } else {
        const s1 = transposeScale(newScale, scaleBigT);
        const s2 = rotateScale(s1, scaleLittleT);
        const s3 = transposeScale(s2, scaleN);
        newScale = s3;
        scaleTransposeMap[stKey] = s3;
      }
    }

    // Get the pattern stream
    let patternStream: PatternStream = [];
    if (streamMap[stKey]) {
      patternStream = streamMap[stKey];
    } else {
      patternStream = realizePattern(pattern, newScale);
      streamMap[stKey] = patternStream;
    }

    // Get the offsets
    const N = Number(transform?.chromaticTranspose ?? 0);
    const T = Number(transform?.scalarTranspose ?? 0);
    const t = Number(transform?.chordalTranspose ?? 0);

    // Check the map for efficiency, otherwise transpose and add to map
    const tKey = createTransformKey(transform);
    let transposedStream: PatternStream;

    if (transposedStreamMap[`${tKey}@${stKey}`]) {
      transposedStream = transposedStreamMap[`${tKey}@${stKey}`];
    } else {
      const s1 = transposePatternStream(patternStream, T, newScale);
      const s2 = rotatePatternStream(s1, t);
      const s3 = transposePatternStream(s2, N, chromaticScale);
      transposedStream = s3;
      transposedStreamMap[`${tKey}@${stKey}`] = s3;
    }

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
