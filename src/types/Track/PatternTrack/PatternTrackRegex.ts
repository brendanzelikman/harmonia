import { getDatabase } from "app/database";
import { uploadSample } from "app/samples";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import { createInstrument } from "types/Instrument/InstrumentThunks";
import { Instrument, InstrumentKey } from "types/Instrument/InstrumentTypes";
import { Thunk } from "types/Project/ProjectTypes";
import { Payload, unpackData, unpackUndoType } from "types/redux";
import { readAudioBuffer, decodeAudioBuffer } from "utils/buffer";
import { SAMPLE_STORE } from "utils/constants";
import { promptUserForFile } from "utils/html";
import { Track, TrackId, isPatternTrack } from "../TrackTypes";
import { createPatternTrack } from "./PatternTrackThunks";
import { PatternTrack } from "./PatternTrackTypes";
import { getEventFile } from "utils/file";
import { selectSelectedTrack } from "types/Timeline/TimelineSelectors";

/** Prompt the user to input a scale for the selected track */
export const inputPatternTrackSample = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const track = selectSelectedTrack(project);
  if (isPatternTrack(track)) dispatch(promptUserForSample({ data: { track } }));
};

/** Prompt the user for an audio file and upload / create a track. */
export const promptUserForSample =
  (payload: Payload<{ track?: Track; parentId?: TrackId }, true>): Thunk =>
  (dispatch) => {
    const { track, parentId } = unpackData(payload);
    const undoType = unpackUndoType(payload, "promptUserForSample");
    promptUserForFile("audio/*", (e) => {
      const file = getEventFile(e);
      if (!file) return;

      // If no track data is provided, just upload the sample
      if (!track && !parentId) {
        uploadSample(file);
        return;
      }

      // Otherwise, use the data to create/update a track
      const data = { track, parentId, file };
      dispatch(uploadSampleToTrack({ data, undoType }));
    });
  };

/** Use a file to create a custom instrument for a track. */
export const uploadSampleToTrack =
  (
    payload: Payload<{ file: File; track?: Track; parentId?: TrackId }>
  ): Thunk =>
  async (dispatch, getProject) => {
    const data = unpackData(payload);
    const undoType = unpackUndoType(payload, "uploadSampleToTrack");
    const project = getProject();
    const db = await getDatabase();
    if (!db) return;

    // Convert the file to a safe buffer and save to IDB
    const { file, parentId } = data;
    const audioBuffer = await readAudioBuffer(file);
    const buffer = decodeAudioBuffer(audioBuffer);
    const id = `sample-${file.name}`;
    await db.put(SAMPLE_STORE, { id, buffer });

    // Use the provided track or create a new one from the parent
    let track: PatternTrack;
    let instrument: Instrument | undefined;
    if (isPatternTrack(data.track)) {
      track = data.track;
      instrument = selectInstrumentById(project, data.track.instrumentId);
    } else {
      const data = { track: { parentId } };
      const newPT = dispatch(createPatternTrack({ data, undoType }));
      track = newPT.track;
      instrument = newPT.instrument;
    }

    // Create a new instrument with the sample
    const urls = { C3: audioBuffer };
    let oldInstrument: Instrument | undefined = undefined;
    if (instrument) oldInstrument = { ...instrument, key: id as InstrumentKey };

    const options = { oldInstrument, urls };
    dispatch(createInstrument({ data: { track, options }, undoType }));
  };
