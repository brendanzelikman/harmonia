import { Thunk } from "types/Project";
import {
  chromaticScale,
  getMidiNoteAsValue,
  getScaleAsKey,
  getScaleNoteDegree,
  getScaleNoteOctaveOffset,
  initializeScaleTrackScale,
  isMidiNote,
  isNestedNote,
  nestedChromaticNotes,
  NestedNote,
  resolveScaleChainToMidi,
  resolveScaleNoteToMidi,
  ScaleArray,
  ScaleObject,
  sortScaleNotesByDegree,
} from "types/Scale";
import {
  getScaleTrackChain,
  initializeScaleTrack,
  isPatternTrack,
  ScaleTrack,
  TrackId,
} from "types/Track";
import { getValueByKey } from "utils/objects";
import {
  selectScaleMap,
  selectScaleTrackById,
  selectTrackById,
  selectTrackMap,
  selectTrackMidiScale,
  selectTrackScale,
  selectTrackScaleChain,
} from "redux/selectors";
import { addScale, updateScale } from "redux/Scale/ScaleSlice";
import { MIDI } from "types/units";
import { getMidiPitchClass } from "utils/midi";
import { getClosestPitchClass } from "utils/pitch";
import { random, range, sample, sampleSize } from "lodash";
import { PresetScaleList } from "presets/scales";
import { addTrack, moveTrack } from "./TrackSlice";
import { setPatternTrackScaleTrack } from "./PatternTrackThunks";

/** Create a `ScaleTrack` with an optional initial track. */
export const createScaleTrack =
  (initialTrack?: Partial<ScaleTrack>): Thunk<TrackId> =>
  (dispatch, getProject) => {
    const project = getProject();
    const scaleMap = selectScaleMap(project);

    // Get the parent track of the initial track to inherit the scale
    const parentTrack = selectScaleTrackById(project, initialTrack?.parentId);
    const parentScale = getValueByKey(scaleMap, parentTrack?.scaleId);
    const parentNotes = parentScale?.notes ?? nestedChromaticNotes;

    // Create a new scale for the track
    const notes: ScaleArray = parentNotes.map((_, i) => ({ degree: i }));
    const scale = initializeScaleTrackScale({ notes });

    // Create and add the scale track and scale
    const scaleTrack = initializeScaleTrack({
      ...initialTrack,
      scaleId: scale.id,
    });
    dispatch(addScale(scale));
    dispatch(addTrack({ track: scaleTrack }));

    // Return the ID of the scale track
    return scaleTrack.id;
  };

/** Create a random hierarchy of `ScaleTracks` */
export const createRandomHierarchy = (): Thunk => (dispatch) => {
  // Get a random size for the hierarchy
  const size = random(1, 3);
  const scales: ScaleObject[] = [];
  const scaleTracks: ScaleTrack[] = [];

  // Create a root scale by grabbing a preset
  const baseScale = sample(PresetScaleList) || chromaticScale;
  const baseNotes = sampleSize(baseScale.notes, random(8, 12));
  const sortedNotes = sortScaleNotesByDegree(baseNotes);
  const scale = initializeScaleTrackScale({ notes: sortedNotes });
  scales.push(scale);

  // Create a randomized scale for each level of the hierarchy
  for (let i = 2; i <= size; i++) {
    const maxLength = scales[i - 2].notes.length;
    const degrees = range(0, maxLength).map((degree) => ({ degree }));
    const scaleSize = Math.max(2, random(maxLength / 2, maxLength - 1));
    const notes = sampleSize(degrees, scaleSize);
    const sortedNotes = sortScaleNotesByDegree(notes);
    const scale = initializeScaleTrackScale({ notes: sortedNotes });
    scales.push(scale);
  }

  // Create a scale track for each scale and chain the parents
  for (let i = 0; i < size; i++) {
    const scale = scales[i];
    const parentId = i > 0 ? scaleTracks[i - 1].id : undefined;
    const scaleTrack = initializeScaleTrack({ parentId, scaleId: scale.id });
    dispatch(addScale(scale));
    dispatch(addTrack({ track: scaleTrack, callerId: "hierarchy" }));
    scaleTracks.push(scaleTrack);
  }
};

/** Add a note to a scale track using its parent track's scale. */
export const addNoteToScaleTrack =
  (scaleTrackId?: TrackId, note: MIDI = 60): Thunk =>
  (dispatch, getProject) => {
    if (!scaleTrackId) return;
    const project = getProject();

    // Get the scale track
    const trackMap = selectTrackMap(project);
    const scaleTrack = selectScaleTrackById(project, scaleTrackId);
    if (!scaleTrack) return;

    // Get the scale
    const scaleMap = selectScaleMap(project);
    const scale = getValueByKey(scaleMap, scaleTrack.scaleId);

    if (!scale) return;

    // Get the track's scale chain => MIDI notes
    const trackChain = getScaleTrackChain(scaleTrackId, trackMap);
    const scaleChain = selectTrackScaleChain(project, scaleTrackId);
    const scaleNotes = resolveScaleChainToMidi(scaleChain);
    const scaleLength = scaleNotes.length;

    // Get the parent track's scale chain => MIDI notes
    const parent = getValueByKey(trackMap, scaleTrack.parentId);
    const parentScaleChain = parent
      ? selectTrackScaleChain(project, parent.id)
      : [chromaticScale];
    const parentNotes = resolveScaleChainToMidi(parentScaleChain);
    const parentKey = getScaleAsKey(parentNotes);

    // Find the closest pitch to the parent notes
    const pitch = getMidiPitchClass(note);
    const closestPitch = getClosestPitchClass(pitch, parentNotes);
    if (!closestPitch) return;
    if (!parentKey.includes(pitch)) return;

    // Get the lowest note in the scale
    const low = scaleNotes[0];
    const lowOctave = getScaleNoteOctaveOffset(low);
    const lowDegree = getScaleNoteDegree(low);

    // Get the highest note in the scale
    const high = scaleNotes[scaleLength - 1];
    const highOctave = getScaleNoteOctaveOffset(high);
    const highDegree = getScaleNoteDegree(high);

    // Get the degree of the closest pitch in the parent
    const degree = parentKey.findIndex((pitch) => pitch === closestPitch);
    if (degree < 0) return;

    // Get the offset of the note in the scale with the closest pitch
    const scaleNote = parentNotes[degree];
    let octave = Math.floor((note - scaleNote) / 12);

    // Check if the scale currently does or will overshoot an octave
    const overshootsOctave =
      high - low > 12 || note - low > 12 || high - note > 12;

    // If the scale overshoots an octave, adjust the offset
    if (overshootsOctave && !!scaleNotes.length) {
      // If the note is lower than the scale, adjust the offset to be higher
      // only if the degree is less than the lowest degree in the scale
      if (note - low > 12) {
        if (degree > highDegree && degree < lowDegree) {
          octave = lowOctave + 1;
        } else {
          octave = lowOctave;
        }
      } else if (high - note > 12) {
        // If the note is higher than the scale, adjust the offset to be lower
        // only if the degree is greater than the highest degree in the scale
        if (degree < lowDegree && degree > highDegree) {
          octave = highOctave - 1;
        } else {
          octave = highOctave;
        }
      }
    }
    // Create the scale track note
    const newNote: NestedNote = {
      degree,
      offset: { octave },
      scaleId: scale.id,
    };

    // Do nothing if the note exists by pitch class
    const parentScales = trackChain
      .map((p) => scaleMap[p.scaleId])
      .slice(0, -1);
    const newMIDI = resolveScaleNoteToMidi(newNote, parentScales);
    const newPitch = getMidiPitchClass(newMIDI);
    const key = scaleNotes.map((n) => getMidiPitchClass(n));
    if (key.includes(newPitch)) return;

    // Find the index where the MIDI is in between the values
    let index = scaleNotes.findIndex((n, i) =>
      newMIDI > n && i + 1 in scaleNotes ? newMIDI < scaleNotes[i + 1] : true
    );
    if (scaleNotes.length < 2) index = newMIDI > scaleNotes[0] ? 1 : 0;
    else if (index < 0) index = scaleNotes.length - 1;
    else index++;

    // Splice the new note into the original scale
    const newNotes = [...scale.notes];
    newNotes.splice(index, 0, newNote);

    // Dispatch the update
    dispatch(updateScale({ id: scale.id, notes: newNotes }));
  };

/** Remove a note from a scale track. */
export const removeNoteFromScaleTrack =
  (scaleTrackId?: TrackId, note: MIDI = 60): Thunk =>
  (dispatch, getProject) => {
    if (!scaleTrackId) return;
    const project = getProject();
    const midiScale = selectTrackMidiScale(project, scaleTrackId);
    const index = midiScale.findIndex((n) => n % 12 === note % 12);
    if (index < 0) return;
    dispatch(removeNoteFromScaleTrackByIndex(scaleTrackId, index));
  };

/** Remove a note from a scale track by index. */
export const removeNoteFromScaleTrackByIndex =
  (scaleTrackId?: TrackId, index = 0): Thunk =>
  (dispatch, getProject) => {
    if (!scaleTrackId) return;
    const project = getProject();
    const trackMap = selectTrackMap(project);
    const scale = selectTrackScale(project, scaleTrackId);
    const midiScale = selectTrackMidiScale(project, scaleTrackId);
    if (!scale || !midiScale) return;

    // Get the MIDI number of the note
    const midi = midiScale[index];

    // Remove the degrees from the track and recursively from the children
    const removeNoteFromTrack = (id: TrackId, degree: number) => {
      const scale = selectTrackScale(project, id);
      if (!scale) return;
      const notes = [...scale.notes];

      // Find the index where the MIDI or degree occurs
      const index = notes.findIndex((n) => {
        if (isMidiNote(n)) return getMidiNoteAsValue(n) % 12 === midi % 12;
        return n.degree === degree;
      });
      if (index < 0) return;

      // Remove the index from the scale
      notes.splice(index, 1);

      // Lower all the degrees above the removed degree
      const length = notes.length;
      for (let i = index; i < length; i++) {
        const note = notes[i];
        if (isNestedNote(note)) {
          notes[i] = { ...note, degree: note.degree - 1 };
        }
      }

      // Update the scale
      dispatch(updateScale({ id: scale.id, notes }));

      // Remove the affected indices from the children
      const childIds = trackMap[id]?.trackIds || [];
      for (const childId of childIds) {
        removeNoteFromTrack(childId, index);
      }
    };

    // Get the hierarchy node
    let node = trackMap[scaleTrackId];
    if (!node) return;

    // Splice the note from the scale track
    const notes = [...scale.notes];
    notes.splice(index, 1);
    dispatch(updateScale({ id: scale.id, notes }));

    // Recursively remove the note from the children
    for (const childId of node.trackIds) {
      removeNoteFromTrack(childId, index);
    }
  };

/** Move the scale track to the index of the given track ID. */
export const moveScaleTrack =
  (props: { dragId: TrackId; hoverId: TrackId }): Thunk<boolean> =>
  (dispatch, getProject) => {
    const { dragId, hoverId } = props;
    const project = getProject();

    // Get the corresponding scale tracks
    const thisTrack = selectTrackById(project, dragId);
    const otherTrack = selectTrackById(project, hoverId);
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

    // If both tracks are scale tracks, migrate the scale
    if (!isThisPatternTrack && !isOtherPatternTrack) {
      return true;
    }

    // Move the scale track
    dispatch(moveTrack({ id: thisTrack.id, index: 0 }));
    return true;
  };
