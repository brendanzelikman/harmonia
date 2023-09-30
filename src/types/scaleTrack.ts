import { nanoid } from "@reduxjs/toolkit";
import { Note, MIDI } from "types";
import { Scale, chromaticScale } from "./scale";
import { TrackInterface } from "./tracks";
import { mod } from "utils";

export interface ScaleTrack extends TrackInterface {
  scaleNotes: ScaleTrackNote[];
}

// A scale track note uses a degree to index the parent scale and a MIDI offset
// No parent scale = chromatic scale
export type ScaleTrackNote = {
  degree: number;
  offset: number;
};

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

type ScaleTrackNoId = Omit<ScaleTrack, "id">;

export const initializeScaleTrack = (
  scaleTrack: ScaleTrackNoId
): ScaleTrack => {
  return { ...scaleTrack, id: nanoid() };
};

export const isScaleTrack = (track: unknown): track is ScaleTrack => {
  return (track as ScaleTrack)?.scaleNotes !== undefined;
};

export type ScaleTrackMap = Record<string, ScaleTrack>;

// Create a scale track map from an array of scale tracks
export const createScaleTrackMap = (tracks: ScaleTrack[]) => {
  return tracks.reduce((acc, track) => {
    acc[track.id] = track;
    return acc;
  }, {} as ScaleTrackMap);
};

// Map a MIDI note to a scale track note
export const mapScaleTrackNote = (note: Note): ScaleTrackNote => {
  // Get the pitch class of the note
  const pitch = MIDI.toPitchClass(note);
  const chromaticNotes = chromaticScale.notes;
  const chromaticPitches = chromaticNotes.map((n) => MIDI.toPitchClass(n));

  // Get the degree and offset of the note
  const degree = chromaticPitches.indexOf(pitch);
  if (degree < 0) return { degree: 0, offset: 0 };
  const offset = MIDI.OctaveDistance(chromaticScale.notes[degree], note) * 12;

  // Return the scale track note
  return { degree, offset };
};

// Get the scale of a scale track by recursing up the parent scale tracks
export const getScaleTrackScale = (
  scaleTrack?: ScaleTrack,
  scaleTracks?: ScaleTrackMap
): Scale => {
  if (!scaleTrack || !scaleTracks) return chromaticScale;

  let parent = scaleTrack.parentId;
  let notes = scaleTrack.scaleNotes;

  // Keep going up parents while there is a parent scale track
  while (parent) {
    // Get the parent scale track from the id
    const parentScaleTrack = scaleTracks[parent];
    if (!parentScaleTrack) break;

    // Get the scale notes of the parent track
    const parentScaleNotes = parentScaleTrack.scaleNotes;

    // Map the scale track's notes to its parents
    notes = notes.map(({ degree, offset }) => {
      const note = parentScaleNotes[degree];
      return {
        degree: note?.degree || 0,
        offset: (note?.offset || 0) + offset,
      };
    });
    // Set the parent to the parent's parent
    parent = parentScaleTrack.parentId;
  }
  // Once there is no parent, return the notes relative to the chromatic scale
  return {
    notes: notes.map((note) => {
      return chromaticScale.notes[note.degree] + note.offset;
    }),
  };
};

// Transpose the scale track along the parent scale
export const getScalarlyTransposedScaleTrack = (
  scaleTrack: ScaleTrack,
  offset: number,
  parentScale?: ScaleTrack | Scale
): ScaleTrack => {
  const modulus = isScaleTrack(parentScale)
    ? parentScale.scaleNotes.length
    : (parentScale?.notes?.length ? parentScale : chromaticScale).notes.length;
  const scaleNotes = scaleTrack.scaleNotes.map((note) => {
    const summedDegree = (note.degree || 0) + offset;
    const newDegree = mod(summedDegree, modulus);
    const octaveDistance = Math.floor(summedDegree / modulus);
    const newOffset = (note.offset || 0) + octaveDistance * 12;
    return { degree: newDegree, offset: newOffset };
  });
  return { ...scaleTrack, scaleNotes };
};

// Transpose the scale track chromatically
export const getChromaticallyTransposedScaleTrack = (
  scaleTrack: ScaleTrack,
  offset = 0
) => {
  if (!scaleTrack || !offset) return scaleTrack;
  return {
    ...scaleTrack,
    scaleNotes: scaleTrack.scaleNotes.map((note) => {
      const newOffset = (note.offset || 0) + offset;
      return { ...note, offset: newOffset };
    }),
  };
};

// Transpose the scale track chordally
export const getChordallyTransposedScaleTrack = (
  scaleTrack: ScaleTrack,
  offset = 0
) => {
  if (!scaleTrack || !offset) return scaleTrack;

  const scale = scaleTrack.scaleNotes;
  const scaleSize = scale.length;
  const scaleNotes = scale.map((note, i) => {
    const summedIndex = i + offset;
    const newIndex = mod(summedIndex, scaleSize);
    const octaveDistance =
      Math.floor(offset / scaleSize) +
      (scale[newIndex].degree < note.degree ? 1 : 0);
    const newOffset = note.offset + octaveDistance * 12;
    return { degree: scale[newIndex].degree, offset: newOffset };
  });
  return { ...scaleTrack, scaleNotes };
};
