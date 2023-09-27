import { nanoid } from "@reduxjs/toolkit";
import {
  Pattern,
  PatternId,
  PatternMap,
  PatternStream,
  getStreamTicks,
} from "./pattern";
import {
  PatternTrackMap,
  ScaleTrackMap,
  TrackId,
  createScaleTrackMap,
  getTrackParents,
} from "./tracks";
import {
  getLastTransposition,
  TranspositionMap,
  transposeTracksAtTick,
  getTransposedPatternStream,
} from "./transposition";
import { Tick } from "./units";
import { MIDI } from "./midi";
import { CLIP_THEMES, ClipTheme } from "./clip.themes";
import { SessionMap, getTrackTranspositions } from "./session";
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

export const isClip = (obj: unknown): obj is Clip => {
  return (
    (obj as Clip).id !== undefined &&
    (obj as Clip).patternId !== undefined &&
    (obj as Clip).trackId !== undefined &&
    (obj as Clip).tick !== undefined
  );
};

export type ClipNoId = Omit<Clip, "id">;
export type ClipMap = Record<ClipId, Clip>;

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
    scaleTracks: ScaleTrackMap;
    patternTracks: PatternTrackMap;
    patterns: PatternMap;
    transpositions: TranspositionMap;
    sessionMap: SessionMap;
  }
) => {
  if (!clip) return [] as PatternStream;

  const { patterns, patternTracks, scaleTracks, transpositions, sessionMap } =
    dependencies;

  // Get the clip's pattern and pattern track
  const pattern = patterns[clip.patternId];
  const patternTrack = patternTracks[clip.trackId];
  if (!pattern || !patternTrack) return [] as PatternStream;

  // Make sure the pattern has a stream
  const ticks = getStreamTicks(pattern.stream);
  if (isNaN(ticks) || ticks < 1) return [];

  // Get all parent scale tracks and their transpositions
  const parents = getTrackParents(patternTrack, scaleTracks);
  const parentTranspositions = parents.map((parent) =>
    getTrackTranspositions(parent, transpositions, sessionMap)
  );

  // Get the clip's transpositions
  const clipTranspositions = getTrackTranspositions(
    patternTrack,
    transpositions,
    sessionMap
  );

  // Initialize the loop variables
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
      stream.push(chord);
      continue;
    }

    // Get the current tick
    const tick = startTick + i - clip.offset;

    // Transpose the parent tracks at the current tick
    const transposedParents = transposeTracksAtTick(
      parents,
      parentTranspositions,
      tick
    );
    const scaleTracks = createScaleTrackMap(transposedParents);
    const transposition = getLastTransposition(clipTranspositions, tick, false);
    const quantizations = parentTranspositions.map(
      (t) => !!getLastTransposition(t, tick, false)
    );

    // Get the transposed pattern stream
    const patternStream = getTransposedPatternStream({
      pattern,
      transposition,
      quantizations,
      tracks: transposedParents,
      scaleTracks,
    });

    // Add the transposed chord to the clip stream
    const clipChord = patternStream[chordCount - 1];
    if (!clipChord) {
      stream.push([]);
      continue;
    }
    stream.push(clipChord);
  }

  // Return the stream of the clip
  return getClipNotes(clip, stream);
};
