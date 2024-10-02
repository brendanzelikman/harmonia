import { addScale, removeScale, updateScale } from "./ScaleSlice";
import { getMidiDegree, getMidiScaleDegree, MidiValue } from "utils/midi";
import { EighthNoteTicks, getTickSubdivision } from "utils/durations";
import { getMidiPitch, getMidiPitchClass } from "utils/midi";
import { range } from "lodash";
import { getArrayByKey, getValueByKey } from "utils/objects";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument/InstrumentClass";
import { Thunk } from "types/Project/ProjectTypes";
import { TrackId, isScaleTrack } from "types/Track/TrackTypes";
import { convertTicksToSeconds } from "types/Transport/TransportFunctions";
import { getScaleNotes, getScaleNoteMidiValue } from "./ScaleFunctions";
import {
  getTransposedScale,
  getRotatedScale,
} from "types/Scale/ScaleTransformers";
import { resolveScaleToMidi, resolveScaleNoteToMidi } from "./ScaleResolvers";
import {
  ScaleObject,
  defaultScale,
  ScaleId,
  initializeScale,
  chromaticScale,
  chromaticNotes,
  isMidiNote,
  isNestedNote,
  ScaleNote,
} from "./ScaleTypes";
import {
  selectTrackMap,
  selectScaleTrackByScaleId,
  selectScaleTracks,
  selectTrackDescendantMap,
  selectTrackParentScales,
  selectTrackMidiScaleMap,
  selectMidiScale,
  selectTrackScaleMap,
  selectMidiScaleMap,
} from "types/Track/TrackSelectors";
import { selectTransport } from "types/Transport/TransportSelectors";
import { selectNewMotifName } from "types/Timeline/TimelineSelectors";
import { getClosestNestedNote } from "./ScaleUtils";
import { createUndoType, Payload, unpackUndoType } from "lib/redux";
import { mod } from "utils/math";
import { setSelectedScale } from "types/Media/MediaThunks";
import { deleteTrack } from "types/Track/TrackThunks";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { selectScaleName } from "types/Arrangement/ArrangementTrackSelectors";

/** Creates a scale and adds it to the store, resolving to the ID if successful. */
export const createScale =
  (
    payload: Payload<Partial<ScaleObject>> = { data: defaultScale }
  ): Thunk<ScaleId> =>
  (dispatch, getProject) => {
    const scale = payload.data;
    const undoType = unpackUndoType(payload, "createScale");
    const project = getProject();

    // Get the name of the new scale
    const newName = selectNewMotifName(project, "scale");
    const givenName = scale.name;
    const noName = !givenName || givenName === defaultScale.name;

    // Initialize the new scale
    const name = noName ? newName : givenName;
    const newScale = initializeScale({ ...scale, name });

    // Add the scale to the store and select it
    dispatch(addScale({ data: newScale, undoType }));
    dispatch(setSelectedScale({ data: newScale.id, undoType }));

    // Return the id
    return newScale.id;
  };

/** Deletes a scale from the store by ID and any scale tracks that are connected to it. */
export const deleteScale =
  (id: ScaleId): Thunk =>
  async (dispatch, getProject) => {
    const undoType = createUndoType("deleteScale", id);
    const project = getProject();

    // Remove all scale tracks that are connected to the scale
    const scaleTracks = selectScaleTracks(project);
    for (const track of scaleTracks) {
      if (track.scaleId === id) {
        dispatch(deleteTrack({ data: track.id }));
      }
    }

    // Remove the scale from the store
    dispatch(removeScale({ data: id, undoType }));
  };

/** Add a note to a scale using a MIDI value and its parent scale track. */
export const addNoteToScale =
  (scale?: ScaleObject, note: MidiValue = 60): Thunk =>
  (dispatch, getProject) => {
    if (!scale) return;
    const project = getProject();
    const midiMap = selectTrackMidiScaleMap(project);

    // Try to find a scale track
    const track = selectScaleTrackByScaleId(project, scale.id);
    const trackId = track?.id;
    const parentId = track?.parentId;

    // Get the midi of the scale and its parent
    const chain = selectTrackParentScales(project, trackId) ?? [chromaticScale];
    const midi = getValueByKey(midiMap, trackId) ?? resolveScaleToMidi(scale);
    const parentMidi = getValueByKey(midiMap, parentId) ?? chromaticNotes;

    // Get the degree and offset of a new nested note
    const { degree, offset } = getClosestNestedNote(midi, note, parentMidi);
    if (degree < 0) return;

    // Create a nested note if a track exists or a MIDI note otherwise
    const nestedNote: ScaleNote = { degree, offset, scaleId: scale.id };
    const newMIDI = resolveScaleNoteToMidi(nestedNote, chain);
    const midiNote: ScaleNote = { MIDI: newMIDI };
    const newNote = track ? nestedNote : midiNote;

    // Make sure the new note is not already in the scale
    const newPitch = getMidiPitchClass(newMIDI);
    if (midi.some((n) => getMidiPitchClass(n) === newPitch)) return;

    // Get new scale indices based on the sorted MIDI scale
    const midiScale = [...midi, newMIDI];
    const idx = range(0, midiScale.length);
    const midiIdx = idx.sort((a, b) => midiScale[a] - midiScale[b]);

    // Sort the new scale based on the sorted indices
    const newScale = [...scale.notes, newNote];
    const newNotes = newScale.map((_, i, arr) => arr[midiIdx[i]]);

    // Dispatch the update
    dispatch(updateScale({ data: { id: scale.id, notes: newNotes } }));
  };

/** Remove a note from a scale track. */
export const removeNoteFromScale =
  (scale?: ScaleObject, midi: MidiValue = 60): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const midiScale = selectMidiScale(project, scale?.id);
    const index = getMidiScaleDegree(midi, midiScale);
    dispatch(removeNoteFromScaleByIndex(scale, index));
  };

/** Remove a note from a scale track by index. */
export const removeNoteFromScaleByIndex =
  (scale?: ScaleObject, index = 0): Thunk =>
  (dispatch, getProject) => {
    if (!scale || index < 0) return;
    const project = getProject();
    const trackMap = selectTrackMap(project);
    const trackScaleMap = selectTrackScaleMap(project);
    const track = selectScaleTrackByScaleId(project, scale.id);

    // Get the MIDI number of the note
    const midiScale = selectMidiScale(project, scale.id);
    const midi = midiScale[index];

    // Create an undo type to group actions
    const undoType = createUndoType(
      "removeNoteFromScaleByIndex",
      JSON.stringify({ scale, index })
    );

    // Remove the degrees from the track and recursively from the children
    const removeNoteFromTrack = (id: TrackId, degree: number) => {
      if (!isScaleTrackId(id)) return;
      const scale = trackScaleMap[id];
      if (!scale) return;
      const notes = [...scale.notes];

      // Find the index where the MIDI or degree occurs
      const index = notes.findIndex((n) => {
        if (isMidiNote(n)) {
          return getMidiDegree(n) === getMidiDegree(midi);
        }
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
      dispatch(updateScale({ data: { id: scale.id, notes }, undoType }));

      // Remove the affected indices from the children
      const childIds = trackMap[id]?.trackIds || [];
      for (const childId of childIds) {
        removeNoteFromTrack(childId, index);
      }
    };

    // Splice the note from the scale track
    const notes = [...scale.notes];
    notes.splice(index, 1);
    dispatch(updateScale({ data: { id: scale.id, notes }, undoType }));

    // Recursively remove the note from the children
    if (!track) return;
    for (const childId of track.trackIds) {
      removeNoteFromTrack(childId, index);
    }
  };

/** Transpose a scale by ID with the given offset. */
export const transposeScale =
  (scale?: ScaleObject, offset: number = 0): Thunk =>
  (dispatch) => {
    if (!scale || !offset) return;
    const transposedScale = getTransposedScale(scale, offset);
    const notes = getScaleNotes(transposedScale);
    dispatch(updateScale({ data: { id: scale.id, notes } }));
  };

/** Rotate a scale by ID with the given offset. */
export const rotateScale =
  (scale?: ScaleObject, offset?: number): Thunk =>
  (dispatch) => {
    if (!scale || !offset) return;
    const transposedScale = getRotatedScale(scale, offset);
    const notes = getScaleNotes(transposedScale);
    dispatch(updateScale({ data: { id: scale.id, notes } }));
  };

/** Clear the notes of a scale by ID. */
export const clearScale =
  (id?: ScaleId): Thunk =>
  (dispatch, getProject) => {
    if (!id) return;
    const project = getProject();
    const descendantMap = selectTrackDescendantMap(project);

    // Clear the scale
    dispatch(updateScale({ data: { id, notes: [] } }));

    // Clear the scale of all matching scale tracks and their descendants
    const scaleTrack = selectScaleTrackByScaleId(project);
    const descendants = getArrayByKey(descendantMap, scaleTrack?.id);
    for (const scaleTrack of descendants) {
      const descendants = getArrayByKey(descendantMap, scaleTrack?.id);
      for (const track of descendants) {
        if (!isScaleTrack(track)) continue;
        dispatch(updateScale({ data: { id: track.scaleId, notes: [] } }));
      }
    }
  };

/** Copy a scale */
export const copyScale =
  (scale: ScaleObject = defaultScale): Thunk<ScaleId> =>
  (dispatch, getProject) => {
    const project = getProject();
    return dispatch(
      createScale({
        data: {
          ...scale,
          name: `${selectScaleName(project, scale.id) ?? "Scale"} Copy`,
        },
      })
    );
  };

/** Play a scale using the global instrument if it is loaded. */
export const playScale =
  (scale: ScaleObject): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const transport = selectTransport(project);
    const midiScaleMap = selectMidiScaleMap(project);
    const midiScale = midiScaleMap[scale?.id];

    // Get the global instrument
    const instance = LIVE_AUDIO_INSTANCES.global;
    if (!instance.isLoaded()) return;

    // Make sure the global instrument is not muted
    instance.solo = true;

    // Unpack the scale
    const notes = getScaleNotes(midiScale);
    const noteCount = notes.length;

    // Iterate through the notes and play them
    let time = 0;
    for (let i = 0; i < noteCount; i++) {
      const note = notes[i];
      const duration = convertTicksToSeconds(transport, EighthNoteTicks);
      const subdivision = getTickSubdivision(EighthNoteTicks);
      const midi = getScaleNoteMidiValue(note);
      const pitch = getMidiPitch(midi);
      setTimeout(() => {
        if (!instance.isLoaded()) return;
        instance.sampler.triggerAttackRelease([pitch], subdivision);
      }, time * 1000);
      time += duration;
    }

    // Play the tonic on top to complete the scale
    setTimeout(() => {
      if (!scale || !instance.isLoaded()) return;
      const tonicOnTop = getScaleNoteMidiValue(notes[0]) + 12;
      const pitch = getMidiPitch(tonicOnTop);
      const subdivision = getTickSubdivision(EighthNoteTicks);
      const seconds = convertTicksToSeconds(transport, EighthNoteTicks);
      instance.sampler.triggerAttackRelease([pitch], subdivision);
      setTimeout(() => {
        instance.solo = false;
      }, seconds * 1000);
    }, time * 1000);
  };
