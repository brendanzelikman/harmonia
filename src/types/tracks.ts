import { nanoid } from "@reduxjs/toolkit";
import { MixerId } from "./mixer";
import { chromaticScale, GenericScale } from "./scale";
import { InstrumentKey } from "./instrument";
import { Note } from "./units";
import { mod } from "utils";
import { MIDI } from "./midi";
import { Transposition, TranspositionId } from "./transposition";

export type TrackId = string;
export type TrackType = "scaleTrack" | "patternTrack" | "defaultTrack";
export interface GenericTrack {
  id: TrackId;
  parentId?: TrackId;
  name: string;
  type: TrackType;
}

export const createTrackTag = (track: GenericTrack): string => {
  return `${track.id}:${track.type}`;
};

// Scale Tracks
export interface ScaleTrackNote {
  degree: number;
  offset: number;
}
export const mapScaleTrackNote = (note: Note) => {
  const pitchClass = MIDI.toPitchClass(note);
  const chromaticPitchClasses = chromaticScale.notes.map((note) =>
    MIDI.toPitchClass(note)
  );
  const degree = chromaticPitchClasses.indexOf(pitchClass);
  if (degree === -1) throw new Error("Invalid note");
  const offset = MIDI.OctaveDistance(note, chromaticScale.notes[degree]) * 12;
  return { degree, offset };
};
export interface ScaleTrack extends GenericTrack {
  scaleNotes: ScaleTrackNote[];
}

export const defaultScaleTrack: ScaleTrack = {
  id: "default-scale-track",
  type: "scaleTrack",
  name: "",
  parentId: undefined,
  scaleNotes: [
    { degree: 0, offset: 0 },
    { degree: 1, offset: 0 },
    { degree: 2, offset: 0 },
    { degree: 3, offset: 0 },
    { degree: 4, offset: 0 },
    { degree: 5, offset: 0 },
    { degree: 6, offset: 0 },
    { degree: 7, offset: 0 },
    { degree: 8, offset: 0 },
    { degree: 9, offset: 0 },
    { degree: 10, offset: 0 },
    { degree: 11, offset: 0 },
  ],
};

export const getScaleTrackNotes = (
  scaleTrack?: ScaleTrack,
  dependencies?: {
    scaleTracks: Record<TrackId, ScaleTrack>;
  }
): Note[] => {
  if (!scaleTrack || !dependencies) return [];
  const { scaleTracks } = dependencies;

  let parent = scaleTrack.parentId;
  let notes = scaleTrack.scaleNotes;
  while (parent) {
    const parentScaleTrack = scaleTracks[parent];
    notes = notes.map(({ degree, offset }) => {
      const note = parentScaleTrack.scaleNotes[degree];
      return {
        degree: note?.degree || 0,
        offset: (note?.offset || 0) + offset,
      };
    });
    parent = parentScaleTrack.parentId;
  }
  return notes.map(({ degree, offset }) => {
    return chromaticScale.notes[degree] + offset;
  });
};

export const getScaleTrackScale = (
  scaleTrack?: ScaleTrack,
  dependencies?: {
    scaleTracks: Record<TrackId, ScaleTrack>;
    transpositions?: Record<TranspositionId, Transposition>;
    tick?: number;
  }
): GenericScale => {
  if (!scaleTrack || !dependencies) return chromaticScale;
  const notes = getScaleTrackNotes(scaleTrack, dependencies);
  return { notes };
};

export const getScaleTrackParentScale = (
  scaleTrack?: ScaleTrack,
  dependencies?: {
    scaleTracks: Record<TrackId, ScaleTrack>;
  }
): GenericScale => {
  if (!scaleTrack || !dependencies) return chromaticScale;
  const { scaleTracks } = dependencies;
  if (!scaleTrack.parentId) return chromaticScale;
  const parent = scaleTracks[scaleTrack.parentId];
  if (!parent) return chromaticScale;
  return getScaleTrackScale(parent, { scaleTracks });
};
// Pattern Tracks
export interface PatternTrack extends GenericTrack {
  mixerId: MixerId;
  instrument: InstrumentKey;
}

export const defaultPatternTrack: PatternTrack = {
  id: "default-pattern-track",
  parentId: "default-scale-track",
  type: "patternTrack",
  mixerId: "default-mixer",
  name: "",
  instrument: "grand_piano",
};

export type Track = ScaleTrack | PatternTrack;
export const isScaleTrack = (track: Partial<Track>): track is ScaleTrack => {
  return (track as ScaleTrack).scaleNotes !== undefined;
};
export const isPatternTrack = (
  track: Partial<Track>
): track is PatternTrack => {
  return (track as PatternTrack).instrument !== undefined;
};

export type TrackNoId = Omit<Track, "id">;
export type ScaleTrackNoId = Omit<ScaleTrack, "id">;
export type PatternTrackNoId = Omit<PatternTrack, "id">;

export const initializeScaleTrack = (
  scaleTrack: ScaleTrackNoId
): ScaleTrack => {
  return {
    ...scaleTrack,
    id: nanoid(),
  };
};

export const initializePatternTrack = (
  patternTrack: PatternTrackNoId
): PatternTrack => {
  const id = nanoid();
  return {
    ...patternTrack,
    id,
  };
};

export type ScaleTrackNoteMap = Record<TrackId, GenericScale>;
export const createScaleTrackNoteMap = (tracks: ScaleTrack[]) => {
  const scaleTracks = tracks.reduce((acc, track) => {
    acc[track.id] = track;
    return acc;
  }, {} as Record<TrackId, ScaleTrack>);

  return tracks.reduce((acc, track) => {
    const scale = getScaleTrackScale(track, { scaleTracks });
    acc[track.id] = scale;
    return acc;
  }, {} as ScaleTrackNoteMap);
};

export const getTransposedScaleTrack = (
  scaleTrack: ScaleTrack,
  offset: number,
  dependencies: {
    scaleTracks: Record<TrackId, ScaleTrack>;
  }
): ScaleTrack => {
  const { scaleTracks } = dependencies;
  const scale = getScaleTrackParentScale(scaleTrack, { scaleTracks });
  if (!scale || !offset) return scaleTrack;
  const scaleNotes = scaleTrack.scaleNotes.map((note) => {
    const summedDegree = (note.degree || 0) + offset;
    const newDegree = mod(summedDegree, scale.notes.length);
    const octaveDistance = Math.floor(summedDegree / scale.notes.length);
    const newOffset = (note.offset || 0) + octaveDistance * 12;
    return { degree: newDegree, offset: newOffset };
  });
  return { ...scaleTrack, scaleNotes };
};

export const getRotatedScaleTrack = (
  scaleTrack: ScaleTrack,
  offset: number
): ScaleTrack => {
  if (!scaleTrack || !offset || !isScaleTrack(scaleTrack)) return scaleTrack;

  const scale = scaleTrack.scaleNotes;
  const scaleSize = scale.length;
  const scaleNotes = scale.map((note, i) => {
    const summedDegree = note.degree + i;
    const newIndex = mod(summedDegree, scaleSize);
    const octaveDistance =
      Math.floor(offset / scaleSize) +
      (scale[newIndex].degree < note.degree ? 1 : 0);
    const newOffset = note.offset + octaveDistance * 12;
    return { degree: scale[newIndex].degree, offset: newOffset };
  });
  return { ...scaleTrack, scaleNotes };
};

export const getTrackParents = (
  track: Track,
  dependencies: {
    scaleTracks: Record<TrackId, ScaleTrack>;
  }
): ScaleTrack[] => {
  const { scaleTracks } = dependencies;
  if (!track || !scaleTracks) return [];
  let parents: ScaleTrack[] = [];
  let parentId = track.parentId;
  while (parentId) {
    const parent = scaleTracks[parentId];
    if (!parent) break;
    parents = [parent, ...parents];
    parentId = parent.parentId;
  }
  if (isScaleTrack(track)) parents.push(track);
  return parents;
};
