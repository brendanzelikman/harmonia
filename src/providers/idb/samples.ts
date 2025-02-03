import { SAMPLE_STORE } from "utils/constants";
import { getContext } from "tone";
import { Thunk } from "types/Project/ProjectTypes";
import { createInstrument } from "types/Instrument/InstrumentThunks";
import {
  isPatternTrackId,
  PatternTrack,
} from "types/Track/PatternTrack/PatternTrackTypes";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import { Instrument, InstrumentKey } from "types/Instrument/InstrumentTypes";
import { fetchUser } from "providers/auth";
import { createPatternTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import { createUndoType } from "lib/redux";
import { selectSelectedTrackId } from "types/Timeline/TimelineSelectors";
import { isPatternTrack, Track, TrackId } from "types/Track/TrackTypes";

// Function to handle file input
export const handleFileInput =
  (
    file: File,
    _track?: Track,
    parentId?: TrackId,
    undo?: string
  ): Thunk<Promise<void>> =>
  (dispatch, getProject) => {
    return new Promise(async (resolve, reject) => {
      const undoType = undo ?? createUndoType("handleFileInput", file);
      const { db } = await fetchUser();
      if (!db) return reject();

      const audioBuffer = await fileToAudioBuffer(file);
      const buffer = audioBufferToObject(audioBuffer);

      // Save the audio buffer in IndexedDB
      const id = `sample-${file.name}`;
      await db.put(SAMPLE_STORE, { id, buffer });

      const project = getProject();
      const selectedTrackId = selectSelectedTrackId(project);
      const { track, instrument } = isPatternTrack(_track)
        ? {
            track: _track,
            instrument: selectInstrumentById(project, _track.instrumentId),
          }
        : dispatch(
            createPatternTrack(
              { parentId: parentId ?? selectedTrackId },
              undefined,
              undoType
            )
          );
      const urls = { C3: audioBuffer };
      const oldInstrument: Instrument | undefined = instrument
        ? { ...instrument, key: id as InstrumentKey }
        : undefined;

      dispatch(
        createInstrument({
          data: { track, options: { oldInstrument, urls } },
          undoType,
        })
      );
      return resolve();
    });
  };

// Convert file to AudioBuffer using Tone.js
const fileToAudioBuffer = async (file: File): Promise<AudioBuffer> => {
  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await getContext().rawContext.decodeAudioData(
    arrayBuffer
  );
  return audioBuffer;
};

const audioBufferToObject = (audioBuffer: AudioBuffer) => {
  const channels = [];
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }
  return {
    sampleRate: audioBuffer.sampleRate,
    length: audioBuffer.length,
    duration: audioBuffer.duration,
    numberOfChannels: audioBuffer.numberOfChannels,
    channels,
  };
};

// Deserialize object to AudioBuffer
const objectToAudioBuffer = async (obj: any): Promise<AudioBuffer> => {
  const audioContext = getContext().rawContext;
  const audioBuffer = audioContext.createBuffer(
    obj.numberOfChannels,
    obj.length,
    obj.sampleRate
  );

  // Rebuild the audio buffer channel by channel
  for (let i = 0; i < obj.numberOfChannels; i++) {
    audioBuffer.getChannelData(i).set(obj.channels[i]);
  }

  return audioBuffer;
};

// Fetch audio from IndexedDB
export const getSampleFromIDB = async (
  id: string
): Promise<AudioBuffer | undefined> => {
  const { db } = await fetchUser();
  if (!db) return;
  const sample = await db.get(SAMPLE_STORE, id);
  if (!sample) return;
  return objectToAudioBuffer(sample.buffer);
};

// Attach file input handling to an HTML element
export const setupFileInput =
  (track?: Track, parentId?: TrackId, undo?: string): Thunk<Promise<void>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*";
      input.onchange = async (e) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          const file = target.files[0];
          await dispatch(handleFileInput(file, track, parentId, undo)); // Store in IDB
          resolve();
        }
      };
      input.onblur = () => {
        resolve();
      };
      document.body.appendChild(input);
      input.click();
      input.remove();
    });
  };
