import { MIDI } from "types/midi";
import {
  Scale,
  ScaleArray,
  chromaticNotes,
  chromaticScale,
  unpackScale,
} from "types/Scale";
import { mod } from "utils";
import {
  ScaleTrack,
  ScaleTrackMap,
  isScaleTrack,
  isScaleTrackMap,
} from "./ScaleTrackTypes";
import { ERROR_TAG, Note } from "types/units";
import { TrackNote, TrackScale, isTrackScale } from "types/Track";

/**
 * Get the unique tag of a given ScaleTrack.
 * @param clip Optional. The ScaleTrack object.
 * @returns Unique tag string. If the ScaleTrack is invalid, return the error tag.
 */
export const getScaleTrackTag = (track: Partial<ScaleTrack>) => {
  if (!isScaleTrack(track)) return ERROR_TAG;
  const { id, parentId, name, type, trackScale } = track;
  const scaleTag = trackScale.map((note) => `${note.degree},${note.offset}`);
  return `${id}@${parentId}@${name}@${type}@${scaleTag.join(",")}`;
};

/**
 * Maps a MIDI note to a corresponding ScaleTrackNote within the chromatic scale.
 * @param Note The MIDI note.
 * @returns The mapped ScaleTrackNote.
 * */
export const mapScaleTrackNote = (note: Note): TrackNote => {
  // Get the pitch class of the note
  const pitch = MIDI.toPitchClass(note);
  const chromaticNotes = unpackScale(chromaticScale);
  const chromaticPitches = chromaticNotes.map((n) => MIDI.toPitchClass(n));

  // Get the degree and offset of the note
  const degree = chromaticPitches.indexOf(pitch);
  if (degree < 0) return { degree: 0, offset: 0 };
  const offset = MIDI.OctaveDistance(chromaticNotes[degree], note) * 12;

  // Return the scale track note
  return { degree, offset };
};

/**
 * Uses a Scale to map a ScaleTrackNote to a corresponding MIDI note.
 * @param scale - The array of notes.
 * @param trackNote - Optional. The ScaleTrackNote. If undefined, return the root note of the scale.
 * @returns The mapped MIDI note.
 */
export const getTrackNoteAsMidi = (
  scale: Scale,
  trackNote?: TrackNote
): Note => {
  const notes = unpackScale(scale);
  return notes[trackNote?.degree || 0] + (trackNote?.offset || 0);
};

/**
 * Gets the scale of a scale track by recursing up the parent scale tracks.
 * @param scaleTrack The ScaleTrack object.
 * @param scaleTracks The ScaleTrackMap.
 * @returns A realized Scale. If the ScaleTrack or ScaleTrackMap is invalid, return the chromatic scale.
 */
export const getScaleTrackScale = (
  scaleTrack?: ScaleTrack,
  scaleTrackMap?: ScaleTrackMap
): Scale => {
  // If any parameter is invalid, return the chromatic scale
  if (!isScaleTrack(scaleTrack)) return chromaticScale;
  if (!isScaleTrackMap(scaleTrackMap)) return chromaticScale;

  // Get the parent and scale of the scale track
  let parent = scaleTrack.parentId;
  let notes = scaleTrack.trackScale;

  // Keep going up parents while there is a parent scale track
  while (parent) {
    // Get the parent scale track from the id
    const parentScaleTrack = scaleTrackMap[parent];
    if (!parentScaleTrack) break;

    // Get the scale notes of the parent track
    const parentTrackScale = parentScaleTrack.trackScale;

    // Map the scale track's notes to its parents
    notes = notes.map(({ degree, offset }) => {
      const note = parentTrackScale[degree];
      return {
        degree: note?.degree || 0,
        offset: (note?.offset || 0) + offset,
      };
    });
    // Set the parent to the parent's parent
    parent = parentScaleTrack.parentId;
  }
  // Once there is no parent, return the notes relative to the chromatic scale
  return notes.map((note) => chromaticNotes[note.degree] + note.offset);
};

/**
 * Get the chromatically transposed track scale using the given offset.
 * @param trackScale The TrackScale.
 * @param chromaticOffset The offset to transpose the scale track by.
 * @returns The chromatically transposed TrackScale. If the TrackScale is invalid, return the TrackScale.
 */
export const getChromaticallyTransposedTrackScale = (
  trackScale: TrackScale,
  chromaticOffset = 0
) => {
  // If any parameter is invalid, return the track scale
  if (!isTrackScale(trackScale)) return trackScale;

  // Avoid unnecessary work
  if (chromaticOffset === 0) return trackScale;

  // Transpose the track scale by adding the offset to each note
  const transposedScale = trackScale.map((note) => ({
    ...note,
    offset: note.offset + chromaticOffset,
  }));

  // Return the transposed track scale
  return transposedScale;
};

/**
 * Get the chordally transposed track scale using the given offset.
 * @param trackScale The TrackScale.
 * @param chordalOffset The offset to transpose the track scale by.
 * @returns The chordally transposed TrackScale. If the TrackScale is invalid, return the TrackScale.
 */
export const getChordallyTransposedTrackScale = (
  trackScale: TrackScale,
  chordalOffset = 0
) => {
  // If any parameter is invalid, return the track scale
  if (!isTrackScale(trackScale)) return trackScale;

  // Avoid unnecessary work
  if (chordalOffset === 0) return trackScale;

  // Rotate the track scale
  const modulus = trackScale.length;
  const transposedScale = trackScale.map((note, i) => {
    // Get the new degree
    const summedIndex = i + chordalOffset;
    const newIndex = mod(summedIndex, modulus);
    const degree = trackScale[newIndex].degree;

    // Get the new offset
    const octaveWrap = trackScale[newIndex].degree < note.degree ? 1 : 0;
    const octaveDistance = octaveWrap + Math.floor(chordalOffset / modulus);
    const offset = note.offset + octaveDistance * 12;

    // Return the new note
    return { degree, offset };
  });

  // Return the transposed track scale
  return transposedScale;
};

// Transpose the track scale along the parent track scale
/**
 * Get the scalarly transposed scale track using the given offset.
 * @param trackScale The TrackScale.
 * @param offset The offset to transpose the scale track by.
 * @param parentScale The parent TrackScale to transpose the TrackScale along.
 * @returns The scalarly transposed TrackScale. If the TrackScale or parent TrackScale is invalid, return the TrackScale.
 */
export const getScalarlyTransposedTrackScale = (
  trackScale: TrackScale,
  scalarOffset: number,
  parentScale: TrackScale
) => {
  // If any parameter is invalid, return the track scale
  if (!isTrackScale(trackScale)) return trackScale;
  if (!isTrackScale(parentScale)) return trackScale;

  // Avoid unnecessary work
  if (scalarOffset === 0) return trackScale;

  // Transpose the track scale along the parent scale
  const modulus = parentScale.length;
  const transposedScale = trackScale.map((note) => {
    // Get the new degree
    const summedDegree = note.degree + scalarOffset;
    const degree = mod(summedDegree, modulus);

    // Get the new offset
    const octaveDistance = Math.floor(summedDegree / modulus);
    const offset = note.offset + octaveDistance * 12;

    // Return the new note
    return { degree, offset };
  });

  // Return the transposed track scale
  return transposedScale;
};
