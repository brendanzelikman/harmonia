import { getContext } from "tone";

/** A SafeBuffer stores the channels of a buffer */
export type DecodedBuffer = {
  sampleRate: number;
  length: number;
  duration: number;
  numberOfChannels: number;
  channels: Float32Array[];
};

/** Convert a file into an AudioBuffer */
export const readAudioBuffer = async (file: File): Promise<AudioBuffer> => {
  const arrayBuffer = await file.arrayBuffer();
  const context = getContext().rawContext;
  const buffer = await context.decodeAudioData(arrayBuffer);
  return buffer;
};

/** Convert an AudioBuffer into a SafeBuffer  */
export const decodeAudioBuffer = (audioBuffer: AudioBuffer): DecodedBuffer => {
  const channels = [];

  // Read in the channel data
  for (let i = 0; i < audioBuffer.numberOfChannels; i++) {
    channels.push(audioBuffer.getChannelData(i));
  }

  const { sampleRate, length, duration, numberOfChannels } = audioBuffer;
  return { sampleRate, length, duration, numberOfChannels, channels };
};

/* Convert a SafeBuffer into an AudioBuffer */
export const encodeAudioBuffer = (obj: DecodedBuffer): AudioBuffer => {
  const { sampleRate, length, numberOfChannels } = obj as DecodedBuffer;
  const context = getContext().rawContext;
  const buffer = context.createBuffer(numberOfChannels, length, sampleRate);

  // Rebuild the audio buffer channels
  for (let i = 0; i < obj.numberOfChannels; i++) {
    buffer.getChannelData(i).set(obj.channels[i]);
  }

  return buffer;
};
