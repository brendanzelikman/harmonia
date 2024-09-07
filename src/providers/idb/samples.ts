import { SAMPLE_STORE } from "utils/constants";
import { getDatabase } from "./database";
import { getContext } from "tone";
import { Thunk } from "types/Project/ProjectTypes";
import { createInstrument } from "types/Instrument/InstrumentThunks";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import { Instrument, InstrumentKey } from "types/Instrument/InstrumentTypes";

// Function to handle file input
export const handleFileInput =
  (track: PatternTrack, file: File): Thunk =>
  async (dispatch, getProject) => {
    const db = getDatabase();
    if (!db) return;

    const audioBuffer = await fileToAudioBuffer(file);
    const buffer = audioBufferToObject(audioBuffer);

    // Save the audio buffer in IndexedDB
    const id = `sample-${file.name}`;
    await db.put(SAMPLE_STORE, { id, buffer });

    const urls = { C3: audioBuffer };
    const instrument = selectInstrumentById(getProject(), track.instrumentId);
    const oldInstrument: Instrument | undefined = instrument
      ? { ...instrument, key: id as InstrumentKey }
      : undefined;
    dispatch(
      createInstrument({
        data: { track, options: { oldInstrument, urls } },
      })
    );
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
  const db = getDatabase();
  if (!db) return;
  const sample = await db.get(SAMPLE_STORE, id);
  if (!sample) return;
  return objectToAudioBuffer(sample.buffer);
};

// Attach file input handling to an HTML element
export const setupFileInput =
  (track: PatternTrack): Thunk =>
  (dispatch, getProject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "audio/*";
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        dispatch(handleFileInput(track, file)); // Store in IDB
      }
    };
    document.body.appendChild(input);
    input.click();
    input.remove();
  };
