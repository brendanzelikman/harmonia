import { ticksToToneSubdivision } from "utils";
import { selectScaleById, selectTransport } from "redux/selectors";
import { convertTicksToSeconds } from "types/Transport";
import { Thunk } from "types/Project";
import { MIDI } from "types/midi";
import {
  Scale,
  ScaleId,
  getScaleName,
  getScaleNotes,
  NestedScaleObject,
  defaultNestedScale,
  NestedScaleId,
  initializeNestedScale,
  getOffsettedNestedScale,
  getNestedScaleNotes,
  getRotatedNestedScale,
} from "types/Scale";
import { Midi } from "@tonejs/midi";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { addScale, removeScale, updateScale } from "./ScaleSlice";
import { TrackId } from "types/Track";

/**
 * Creates a scale and adds it to the store.
 * @param scale Optional. `Partial<Scale>` to override default values.
 * @returns A promise that resolves to the scale ID.
 */
export const createScale =
  (
    scale: Partial<NestedScaleObject> = defaultNestedScale
  ): Thunk<Promise<NestedScaleId>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      const newScale = initializeNestedScale(scale);
      dispatch(addScale(newScale));
      resolve(newScale.id);
    });
  };

/**
 * Deletes a scale from the store by ID.
 * @param id The ID of the scale to delete.
 * @returns A promise that resolves when the scale is deleted.
 */
export const deleteScale =
  (id: ScaleId): Thunk<Promise<void>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      dispatch(removeScale(id));
      resolve();
    });
  };

/**
 * Transpose a scale by the given offset.
 * @param id The ID of the scale to transpose.
 * @param offset The offset to transpose the track by.
 */
export const transposeScale =
  (id: ScaleId, offset: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();

    // Get the scale track
    const scale = selectScaleById(project, id);
    if (!scale) return;

    // Transpose the scale track scale
    const transposedScale = getOffsettedNestedScale(scale, offset);
    const notes = getNestedScaleNotes(transposedScale);

    // Dispatch the update
    dispatch(updateScale({ id, notes }));
  };

/**
 * Rotate a scale by the given offset.
 * @param id The ID of the scale to rotate.
 * @param offset The offset to rotate the scale by.
 */
export const rotateScale =
  (id: ScaleId, offset: number): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();

    // Get the scale track
    const scale = selectScaleById(project, id);
    if (!scale) return;

    // Transpose the scale track scale
    const transposedScale = getRotatedNestedScale(scale, offset);
    const notes = getNestedScaleNotes(transposedScale);

    // Dispatch the update
    dispatch(updateScale({ id, notes }));
  };

/**
 * Clear all notes from a scale.
 * @param id The ID of the scale track to clear.
 */
export const clearNotesFromScale =
  (id: TrackId): Thunk =>
  (dispatch) => {
    dispatch(updateScale({ id, notes: [] }));
  };

/**
 * Plays a scale using the global instrument.
 * @param scale The scale to play.
 */
export const playScale =
  (scale: Scale): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const transport = selectTransport(project);

    // Get the global instrument
    const instance = LIVE_AUDIO_INSTANCES.global;
    if (!instance.isLoaded()) return;

    // Make sure the global instrument is not muted
    instance.solo = true;

    // Unpack the scale
    const notes = getScaleNotes(scale);
    const noteCount = notes.length;

    // Iterate through the notes and play them
    let time = 0;
    for (let i = 0; i < noteCount; i++) {
      const note = notes[i];
      const duration = convertTicksToSeconds(transport, MIDI.EighthNoteTicks);
      const subdivision = ticksToToneSubdivision(MIDI.EighthNoteTicks);
      const pitch = MIDI.toPitch(note);
      setTimeout(() => {
        if (!instance.isLoaded()) return;
        instance.sampler.triggerAttackRelease([pitch], subdivision);
      }, time * 1000);
      time += duration;
    }

    // Play the tonic on top to complete the scale
    setTimeout(() => {
      if (!scale || !instance.isLoaded()) return;
      const tonicOnTop = notes[0] + 12;
      const pitch = MIDI.toPitch(tonicOnTop);
      const subdivision = ticksToToneSubdivision(MIDI.EighthNoteTicks);
      const seconds = convertTicksToSeconds(transport, MIDI.EighthNoteTicks);
      instance.sampler.triggerAttackRelease([pitch], subdivision);
      setTimeout(() => {
        instance.solo = false;
      }, seconds * 1000);
    }, time * 1000);
  };

/**
 * Exports a scale to a MIDI file.
 * @param scale The scale to export.
 */
export const exportScaleToMIDI =
  (scale: Scale): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const transport = selectTransport(project);

    // Create a new MIDI file with a single track
    const midi = new Midi();
    const track = midi.addTrack();

    // Get the scale notes and name
    const notes = getScaleNotes(scale);
    const name = getScaleName(scale);

    // Add the notes to the track
    notes.forEach((note, i) => {
      track.addNote({
        midi: note,
        time: convertTicksToSeconds(transport, i * MIDI.EighthNoteTicks),
      });
    });

    // Export the MIDI file
    const blob = new Blob([midi.toArray()], {
      type: "audio/midi",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${name || "scale"}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };
