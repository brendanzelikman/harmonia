import { isObject } from "lodash";
import { getContext } from "tone";

/** Convert a file into an AudioBuffer */
export const fileToAudioBuffer = async (file: File): Promise<AudioBuffer> => {
  const arrayBuffer = await file.arrayBuffer();
  const context = getContext().rawContext;
  const buffer = await context.decodeAudioData(arrayBuffer);
  return buffer;
};

/** A SafeBuffer stores the channels of a buffer */
export type SafeBuffer = {
  sampleRate: number;
  length: number;
  duration: number;
  numberOfChannels: number;
  channels: Float32Array[];
};

/** Convert an AudioBuffer into a plain object  */
export const audioBufferToObject = (audioBuffer: AudioBuffer): SafeBuffer => {
  const channels = [];

  // Read in the channel data
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  const { sampleRate, length, duration, numberOfChannels } = audioBuffer;
  return { sampleRate, length, duration, numberOfChannels, channels };
};

/* Convert a plain object into an AudioBuffer */
export const objectToAudioBuffer = (obj: unknown): AudioBuffer => {
  if (!isSafeBuffer(obj)) throw new Error("Invalid object");
  const { sampleRate, length, numberOfChannels } = obj as SafeBuffer;
  const context = getContext().rawContext;
  const buffer = context.createBuffer(numberOfChannels, length, sampleRate);

  // Rebuild the audio buffer channels
  for (let i = 0; i < obj.numberOfChannels; i++) {
    buffer.getChannelData(i).set(obj.channels[i]);
  }

  return buffer;
};

/** Type guard when reading from IDB */
const isSafeBuffer = (obj: unknown): obj is SafeBuffer => {
  return (
    isObject(obj) &&
    "numberOfChannels" in obj &&
    "sampleRate" in obj &&
    "length" in obj &&
    "duration" in obj &&
    "channels" in obj
  );
};
