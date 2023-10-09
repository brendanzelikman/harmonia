import { uniqBy } from "lodash";
import { AppThunk } from "redux/store";
import { chromaticScale, unpackScale } from "types/Scale";
import {
  isScaleTrack,
  getScaleTrackScale,
  getTrackNoteAsMidi,
  getChromaticallyTransposedTrackScale,
  getChordallyTransposedTrackScale,
  ScaleTrack,
  defaultScaleTrack,
  initializeScaleTrack,
} from "types/ScaleTrack";
import { TrackId } from "types/Track";
import { MIDI } from "types/midi";
import { addScaleTrack, updateScaleTrack } from "./ScaleTrackSlice";
import { Note } from "types/units";
import {
  selectScaleTrackById,
  selectScaleTrackMap,
} from "./ScaleTrackSelectors";
import { addScaleTrackToSession, moveTrackInSession } from "redux/Session";
import { getProperty } from "types/util";
import { setPatternTrackScaleTrack } from "redux/PatternTrack";
import { selectTrackById } from "redux/selectors";
import { isPatternTrack } from "types/PatternTrack";

/**
 * Create a `ScaleTrack` with an optional initial track.
 * @param initialTrack - The initial track to create.
 * @returns A Promise that resolves with the ID of the created track.
 */
export const createScaleTrack =
  (initialTrack?: Partial<ScaleTrack>): AppThunk<Promise<TrackId>> =>
  (dispatch, getState) => {
    const state = getState();

    // Get the parent track of the initial track to inherit the scale
    const parentTrack = selectScaleTrackById(state, initialTrack?.parentId);
    const parentNotes = parentTrack?.trackScale ?? defaultScaleTrack.trackScale;
    const trackScale = parentNotes.map((_, i) => ({ degree: i, offset: 0 }));

    // Create and add the scale track
    return new Promise(async (resolve) => {
      const scaleTrack = initializeScaleTrack({ ...initialTrack, trackScale });
      dispatch(addScaleTrack(scaleTrack));
      dispatch(addScaleTrackToSession(scaleTrack));
      resolve(scaleTrack.id);
    });
  };

/**
 * Add a note to a scale track using its parent track's scale.
 * @param scaleTrackId The ID of the scale track to add the note to.
 * @param note The note to add to the scale track.
 */
export const addNoteToScaleTrack =
  (scaleTrackId: TrackId, note: Note): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the scale track
    const scaleTrackMap = selectScaleTrackMap(state);
    const scaleTrack = scaleTrackMap[scaleTrackId];
    if (!scaleTrack || !isScaleTrack(scaleTrack)) return;

    // Get the scale of the parent track
    const parent = getProperty(scaleTrackMap, scaleTrack?.parentId);
    const scale = parent
      ? getScaleTrackScale(parent, scaleTrackMap)
      : chromaticScale;

    // Unpack the notes of the scale
    const notes = unpackScale(scale);
    if (!notes?.length) return;

    // Get the lowest note in the scale
    const low = scaleTrack.trackScale.at(0);
    const lowOffset = low?.offset || 0;
    const lowDegree = low?.degree || 0;
    const lowNote = getTrackNoteAsMidi(scale, low);

    // Get the highest note in the scale
    const high = scaleTrack.trackScale.at(-1);
    const highOffset = high?.offset || 0;
    const highDegree = high?.degree || 0;
    const highNote = getTrackNoteAsMidi(scale, high);

    // Find the closest pitch to the scale notes
    const pitch = MIDI.toPitchClass(note);
    const closestPitch = MIDI.closestPitchClass(pitch, notes);
    if (!closestPitch) return;

    // Get the degree of the closest pitch
    const degree = notes.findIndex(
      (note) => MIDI.toPitchClass(note) === closestPitch
    );
    if (degree < 0) return;

    // Get the offset of the note in the scale with the closest pitch
    const scaleNote = notes[degree];
    let offset = MIDI.OctaveDistance(scaleNote, note) * 12;

    // Check if the scale currently does or will overshoot an octave
    const overshootsOctave =
      highNote - lowNote > 12 || note - lowNote > 12 || highNote - note > 12;

    // If the scale overshoots an octave, adjust the offset
    if (overshootsOctave) {
      // If the note is lower than the scale, adjust the offset to be higher
      // only if the degree is less than the lowest degree in the scale
      if (highNote - note > 12) {
        if (degree < highDegree && degree < lowDegree) {
          offset = lowOffset + 12;
        } else {
          offset = lowOffset;
        }
      } else if (note - lowNote > 12) {
        // If the note is higher than the scale, adjust the offset to be lower
        // only if the degree is greater than the highest degree in the scale
        if (degree > lowDegree && degree > highDegree) {
          offset = highOffset - 12;
        } else {
          offset = highOffset;
        }
      }
    }
    // Create the scale track note
    const scaleTrackNote = { degree, offset };

    // Splice the note into the scale
    const newScale = [...scaleTrack.trackScale];
    newScale.splice(degree, 0, scaleTrackNote);

    // Remove duplicate notes and sort the scale
    const trackScale = uniqBy(newScale, "degree").sort(
      (a, b) => a.degree + a.offset * 12 - (b.degree + b.offset * 12)
    );

    // Dispatch the update
    dispatch(updateScaleTrack({ id: scaleTrackId, trackScale }));
  };

/**
 * Remove a note from a scale track.
 * @param scaleTrackId The ID of the scale track to remove the note from.
 * @param note The note to remove from the scale track.
 */
export const removeNoteFromScaleTrack =
  (scaleTrackId: TrackId, note: Note): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the scale track
    const scaleTrackMap = selectScaleTrackMap(state);
    const scaleTrack = scaleTrackMap[scaleTrackId];
    if (!scaleTrack || !isScaleTrack(scaleTrack)) return;

    // Get the scale track scale
    const trackScale = [...scaleTrack.trackScale];
    const scale = getScaleTrackScale(scaleTrack, scaleTrackMap);
    if (!scale) return;

    // Unpack the notes of the scale
    const notes = unpackScale(scale);
    if (!notes?.length) return;

    // Find the index of the pitch in the scale
    const pitch = MIDI.toPitchClass(note);
    const index = notes.findIndex((p) => MIDI.toPitchClass(p) === pitch);
    if (index < 0) return;

    // Splice the note from the scale track
    trackScale.splice(index, 1);

    // Dispatch the update
    dispatch(updateScaleTrack({ id: scaleTrackId, trackScale }));
  };

/**
 * Transpose a scale track by the given offset.
 * @param id The ID of the scale track to transpose.
 * @param offset The offset to transpose the scale track by.
 */
export const transposeScaleTrack =
  (id: TrackId, offset: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the scale track
    const scaleTrack = selectScaleTrackById(state, id);
    if (!scaleTrack) return;

    // Transpose the scale track scale
    const trackScale = getChromaticallyTransposedTrackScale(
      scaleTrack.trackScale,
      offset
    );
    // Dispatch the update
    dispatch(updateScaleTrack({ id, trackScale }));
  };

/**
 * Rotate a scale track by the given offset.
 * @param scaleTrackId The ID of the scale track to rotate.
 * @param offset The offset to rotate the scale track by.
 */
export const rotateScaleTrack =
  (scaleTrackId: TrackId, offset: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the scale track
    const scaleTrack = selectScaleTrackById(state, scaleTrackId);
    if (!scaleTrack) return;

    // Rotate the scale track scale
    const trackScale = getChordallyTransposedTrackScale(
      scaleTrack.trackScale,
      offset
    );
    if (!trackScale) return;

    // Dispatch the update
    dispatch(updateScaleTrack({ id: scaleTrackId, trackScale }));
  };

/**
 * Clear all notes from a scale track.
 * @param scaleTrackId The ID of the scale track to clear.
 */
export const clearNotesFromScaleTrack =
  (scaleTrackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the scale track
    const scaleTrack = selectScaleTrackById(state, scaleTrackId);
    if (!scaleTrack) return;

    // Dispatch the update
    dispatch(updateScaleTrack({ id: scaleTrackId, trackScale: [] }));
  };

/**
 * Move the scale track to the index of the given track ID.
 * @param props The drag and hover IDs.
 */
export const moveScaleTrack =
  (props: { dragId: TrackId; hoverId: TrackId }): AppThunk<boolean> =>
  (dispatch, getState) => {
    const { dragId, hoverId } = props;
    const state = getState();

    // Get the corresponding scale tracks
    const thisTrack = selectTrackById(state, dragId);
    const otherTrack = selectTrackById(state, hoverId);
    if (!thisTrack || !otherTrack) return false;

    // If the dragged track is a pattern track, move the pattern track
    const isThisPatternTrack = isPatternTrack(thisTrack);
    const isOtherPatternTrack = isPatternTrack(otherTrack);

    if (isThisPatternTrack && !isOtherPatternTrack) {
      const patternTrackId = thisTrack.id;
      const scaleTrackId = otherTrack.id;
      dispatch(setPatternTrackScaleTrack(patternTrackId, scaleTrackId));
      return true;
    }

    // Move the scale track
    dispatch(moveTrackInSession({ id: thisTrack.id, index: 0 }));
    return true;
  };
