import { nanoid } from "@reduxjs/toolkit";

import { Pattern, PatternId, PatternStream, getStreamTicks } from "./pattern";
import { rotateScale, Scale, transposeScale, chromaticScale } from "./scale";
import { TrackId } from "./tracks";
import { lastTransformAtTick, Transform, transformPattern } from "./transform";
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

  color?: string; // optional color for the clip
}

export const CLIP_COLORS = [
  "red",
  "orange",
  "brown",
  "yellow",
  "lime",
  "green",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "fuchsia",
  "pink",
  "slate",
  "gray",
  "zinc",
];
export type ClipColor = (typeof CLIP_COLORS)[number];
export interface ClipTheme {
  headerColor: string;
  bodyColor: string;
  noteColor: string;
  iconColor: string;
}

export const CLIP_THEMES: Record<ClipColor, ClipTheme> = {
  red: {
    headerColor: "bg-red-800",
    bodyColor: "bg-red-500/70",
    noteColor: "bg-red-800",
    iconColor: "bg-red-600",
  },
  orange: {
    headerColor: "bg-orange-700",
    bodyColor: "bg-orange-600/70",
    noteColor: "bg-orange-700",
    iconColor: "bg-orange-600",
  },
  brown: {
    headerColor: "bg-amber-900",
    bodyColor: "bg-amber-800/70",
    noteColor: "bg-amber-800",
    iconColor: "bg-amber-800",
  },
  yellow: {
    headerColor: "bg-yellow-600",
    bodyColor: "bg-yellow-400/70",
    noteColor: "bg-yellow-600/80",
    iconColor: "bg-yellow-500",
  },
  lime: {
    headerColor: "bg-lime-900",
    bodyColor: "bg-lime-500/70",
    noteColor: "bg-lime-800",
    iconColor: "bg-lime-600",
  },
  green: {
    headerColor: "bg-emerald-900",
    bodyColor: "bg-emerald-700/70",
    noteColor: "bg-emerald-900",
    iconColor: "bg-emerald-600",
  },
  cyan: {
    headerColor: "bg-cyan-900",
    bodyColor: "bg-cyan-600/70",
    noteColor: "bg-cyan-800",
    iconColor: "bg-cyan-600",
  },
  sky: {
    headerColor: "bg-sky-950",
    bodyColor: "bg-sky-800/70",
    noteColor: "bg-sky-900",
    iconColor: "bg-sky-600",
  },
  blue: {
    headerColor: "bg-blue-950",
    bodyColor: "bg-blue-600/70",
    noteColor: "bg-blue-800",
    iconColor: "bg-blue-600",
  },
  indigo: {
    headerColor: "bg-indigo-950",
    bodyColor: "bg-indigo-700/70",
    noteColor: "bg-indigo-900",
    iconColor: "bg-indigo-600",
  },
  fuchsia: {
    headerColor: "bg-fuchsia-950",
    bodyColor: "bg-fuchsia-700/70",
    noteColor: "bg-fuchsia-900",
    iconColor: "bg-fuchsia-700",
  },
  pink: {
    headerColor: "bg-pink-800",
    bodyColor: "bg-pink-400/70",
    noteColor: "bg-pink-800",
    iconColor: "bg-pink-500",
  },
  slate: {
    headerColor: "bg-slate-600",
    bodyColor: "bg-slate-400/70",
    noteColor: "bg-slate-500",
    iconColor: "bg-slate-400",
  },
  gray: {
    headerColor: "bg-gray-800",
    bodyColor: "bg-gray-500/70",
    noteColor: "bg-gray-800",
    iconColor: "bg-gray-700",
  },
  zinc: {
    headerColor: "bg-zinc-950",
    bodyColor: "bg-zinc-600/70",
    noteColor: "bg-zinc-900",
    iconColor: "bg-zinc-900",
  },
};

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
export const testClip = (tick = 0, offset = 0, duration = 0): Clip => ({
  ...defaultClip,
  tick,
  offset,
  duration,
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

    // Get the transforms at the current time
    const tick = startTick + i - clip.offset;
    const scaleTransform = lastTransformAtTick(scaleTransforms, tick, false);
    const transform = lastTransformAtTick(transforms, tick, false);

    let newScale = scale.notes.length ? scale : chromaticScale;
    // Transform the scale if there is a scale transformation
    if (scaleTransform) {
      // Get the offsets
      const scaleN = scaleTransform?.chromaticTranspose ?? 0;
      const scaleBigT = scaleTransform?.scalarTranspose ?? 0;
      const scaleLittleT = scaleTransform?.chordalTranspose ?? 0;

      const s1 = transposeScale(newScale, scaleBigT);
      const s2 = rotateScale(s1, scaleLittleT);
      const s3 = transposeScale(s2, scaleN);
      newScale = s3;
    }

    // Get the pattern stream
    const transformedPattern = transformPattern(
      pattern,
      {
        N: transform?.chromaticTranspose ?? 0,
        T: transform?.scalarTranspose ?? 0,
        t: transform?.chordalTranspose ?? 0,
      },
      newScale
    );
    const transformedStream = transformedPattern.stream;

    // Add the transformed stream to the stream
    const clipChord = transformedStream[chordCount - 1];
    if (!clipChord) {
      stream.push([]);
      continue;
    }
    stream.push(clipChord);
  }

  // Return the stream of the clip
  return getClipNotes(clip, stream);
};
