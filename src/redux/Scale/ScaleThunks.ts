import { ticksToToneSubdivision } from "utils";
import { selectTransport } from "redux/selectors";
import { convertTicksToSeconds } from "types/Transport";
import { AppThunk } from "redux/store";
import { MIDI } from "types/midi";
import {
  Scale,
  ScaleId,
  defaultScale,
  getScaleName,
  initializeScale,
  unpackScale,
} from "types/Scale";
import { Midi } from "@tonejs/midi";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { addScale, removeScale } from "./ScaleSlice";

/**
 * Creates a scale and adds it to the store.
 * @param scale Optional. `Partial<Scale>` to override default values.
 * @returns A promise that resolves to the scale ID.
 */
export const createScale =
  (scale: Partial<Scale> = defaultScale): AppThunk<Promise<ScaleId>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      const newScale = initializeScale(scale);
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
  (id: ScaleId): AppThunk<Promise<void>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      dispatch(removeScale(id));
      resolve();
    });
  };

/**
 * Plays a scale using the global instrument.
 * @param scale The scale to play.
 */
export const playScale =
  (scale: Scale): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);

    // Get the global instrument
    const instance = LIVE_AUDIO_INSTANCES.global;
    if (!instance.isLoaded()) return;

    // Make sure the global instrument is not muted
    instance.solo = true;

    // Unpack the scale
    const notes = unpackScale(scale);
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
  (scale: Scale): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);

    // Create a new MIDI file with a single track
    const midi = new Midi();
    const track = midi.addTrack();

    // Get the scale notes and name
    const notes = unpackScale(scale);
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
