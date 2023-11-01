import { selectScaleById, selectTransport } from "redux/selectors";
import { convertTicksToSeconds } from "types/Transport";
import { Thunk } from "types/Project";
import {
  Scale,
  ScaleId,
  getScaleName,
  getScaleAsArray,
  defaultScale,
  getRotatedScale,
  getScaleNoteAsMidiValue,
  isScale,
  ScaleObject,
  initializeScale,
  getTransposedScale,
  getScaleNoteAsPitchClass,
} from "types/Scale";
import { Midi } from "@tonejs/midi";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { addScale, removeScale, updateScale } from "./ScaleSlice";
import { DemoXML } from "assets/demoXML";
import { getScaleKey } from "utils/key";
import { MusicXML } from "lib/musicxml";
import { XML } from "types/units";
import {
  EighthNoteTicks,
  getDurationTicks,
  getTickSubdivision,
} from "utils/durations";
import { getMidiPitch } from "utils/midi";
import { downloadBlob } from "utils/html";

/** Creates a scale and adds it to the store, resolving to the ID if successful. */
export const createScale =
  (scale: Partial<ScaleObject> = defaultScale): Thunk<Promise<ScaleId>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      const newScale = initializeScale(scale);
      dispatch(addScale(newScale));
      resolve(newScale.id);
    });
  };

/** Deletes a scale from the store by ID, resolving when complete. */
export const deleteScale =
  (id: ScaleId): Thunk<Promise<void>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      dispatch(removeScale(id));
      resolve();
    });
  };

/** Transpose a scale by ID with the given offset. */
export const transposeScale =
  (id?: ScaleId, offset: number = 0): Thunk =>
  (dispatch, getProject) => {
    if (!id || !offset) return;
    const project = getProject();
    const scale = selectScaleById(project, id);
    if (!scale) return;
    const transposedScale = getTransposedScale(scale, offset);
    const notes = getScaleAsArray(transposedScale);
    dispatch(updateScale({ id, notes }));
  };

/** Rotate a scale by ID with the given offset. */
export const rotateScale =
  (id?: ScaleId, offset?: number): Thunk =>
  (dispatch, getProject) => {
    if (!id || !offset) return;
    const project = getProject();
    const scale = selectScaleById(project, id);
    if (!scale) return;
    const transposedScale = getRotatedScale(scale, offset);
    const notes = getScaleAsArray(transposedScale);
    dispatch(updateScale({ id, notes }));
  };

/** Clear the notes of a scale by ID. */
export const clearScale =
  (id?: ScaleId): Thunk =>
  (dispatch) => {
    if (!id) return;
    dispatch(updateScale({ id, notes: [] }));
  };

/** Play a scale using the global instrument if it is loaded. */
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
    const notes = getScaleAsArray(scale);
    const noteCount = notes.length;

    // Iterate through the notes and play them
    let time = 0;
    for (let i = 0; i < noteCount; i++) {
      const note = notes[i];
      const duration = convertTicksToSeconds(transport, EighthNoteTicks);
      const subdivision = getTickSubdivision(EighthNoteTicks);
      const midi = getScaleNoteAsMidiValue(note);
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
      const tonicOnTop = getScaleNoteAsMidiValue(notes[0]) + 12;
      const pitch = getMidiPitch(tonicOnTop);
      const subdivision = getTickSubdivision(EighthNoteTicks);
      const seconds = convertTicksToSeconds(transport, EighthNoteTicks);
      instance.sampler.triggerAttackRelease([pitch], subdivision);
      setTimeout(() => {
        instance.solo = false;
      }, seconds * 1000);
    }, time * 1000);
  };

/** Export a scale to MIDI and download it as a file. */
export const exportScaleToMIDI =
  (scale?: Scale): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const transport = selectTransport(project);

    // Create a new MIDI file with a single track
    const midi = new Midi();
    const track = midi.addTrack();

    // Get the scale notes and name
    const notes = getScaleAsArray(scale);
    const name = getScaleName(scale);

    // Add the notes to the track
    notes.forEach((note, i) => {
      track.addNote({
        midi: getScaleNoteAsMidiValue(note),
        time: convertTicksToSeconds(transport, i * EighthNoteTicks),
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

/** Export a Scale to XML and return the XML string, downloading if specified. */
export const exportScaleToXML =
  (scale?: Scale, download = false): Thunk<XML> =>
  (dispatch, getProject) => {
    // Return the demo XML if the scale is invalid
    if (!isScale(scale)) return DemoXML;

    // Unpack the scale
    const notes = getScaleAsArray(scale);
    const key = getScaleKey(scale);

    // Create the XML notes
    const xmlNotes = notes.map((note) => {
      const midi = getScaleNoteAsMidiValue(note);
      const quarterTicks = getDurationTicks("quarter");
      return MusicXML.createBlock(
        [{ MIDI: midi, duration: quarterTicks, velocity: 60 }],
        {
          type: "quarter",
          duration: getDurationTicks("quarter"),
          voice: 1,
          staff: midi >= 58 ? 1 : 2,
          key,
        }
      );
    });

    // Create the measure
    const measure = MusicXML.createMeasure(xmlNotes);

    // Create the part
    const id = `scale`;
    const part = MusicXML.createPart(id, [measure]);
    const scorePart = MusicXML.createScorePart(id);
    const partList = MusicXML.createPartList([scorePart]);

    // Create the score
    const score = MusicXML.createScore(partList, [part]);
    const xml = MusicXML.serialize(score);

    // Download the blob if specified
    if (download) {
      const blob = new Blob([xml], { type: MusicXML.MIME_TYPE });
      downloadBlob(blob, `${key || "scale"}.xml`);
    }

    // Return the XML string
    return xml;
  };
