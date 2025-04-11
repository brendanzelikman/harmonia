import {
  BasicPitch,
  noteFramesToTime,
  addPitchBendsToNoteEvents,
  outputToNotesPoly,
  OnCompleteCallback,
} from "@spotify/basic-pitch";
import { Note } from "@tonejs/midi/dist/Note";
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
  for (let i = 0; i < obj.numberOfChannels; i++) {
    buffer.getChannelData(i).set(obj.channels[i]);
  }
  return buffer;
};

/** Resample the audio buffer to the target rate */
export const resampleAudioBuffer = (buffer: AudioBuffer, rate: number) => {
  const offlineCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.duration * rate,
    rate
  );
  const src = offlineCtx.createBufferSource();
  src.buffer = buffer;
  src.connect(offlineCtx.destination);
  src.start();
  return offlineCtx.startRendering();
};

/** Convert the audio buffer to mono */
export const flattenAudioBuffer = async (buffer: AudioBuffer) => {
  const ctx = new OfflineAudioContext(1, buffer.length, buffer.sampleRate);
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const splitter = ctx.createChannelSplitter(buffer.numberOfChannels);
  const merger = ctx.createChannelMerger(1);

  source.connect(splitter);
  for (let i = 0; i < buffer.numberOfChannels; i++) {
    splitter.connect(merger, i, 0);
  }

  merger.connect(ctx.destination);
  source.start(0);
  return ctx.startRendering();
};

/** Prepare an audio buffer with the appropriate settings */
export const prepareAudioBuffer = async (
  audioBuffer: AudioBuffer,
  options: Partial<{ sampleRate: number; channels: number }>
) => {
  let buffer = audioBuffer;
  const { sampleRate, channels } = options;
  if (sampleRate && buffer.sampleRate !== sampleRate) {
    const resampledBuffer = await resampleAudioBuffer(buffer, sampleRate);
    buffer = resampledBuffer;
  }
  if (channels === 1 && buffer.numberOfChannels > 1) {
    const monoBuffer = await flattenAudioBuffer(buffer);
    buffer = monoBuffer;
  }
  return buffer;
};

/* Convert an audio buffer into an array of MIDI notes */
export const interpretAudioBuffer = async (
  arrayBuffer: ArrayBuffer
): Promise<Note[]> => {
  // Get the audio buffer from the file
  const audioCtx = new AudioContext();
  const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
  const buffer = await prepareAudioBuffer(audioBuffer, {
    sampleRate: 22050,
    channels: 1,
  });

  // Create the basic pitch model by file
  const basicPitch = new BasicPitch("model/model.json");
  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

  // Evaluate the model on the audio buffer
  const onComplete: OnCompleteCallback = (f, o, c) => {
    frames.push(...f);
    onsets.push(...o);
    contours.push(...c);
  };
  await basicPitch.evaluateModel(buffer, onComplete, () => null);

  // Convert the frames to MIDI notes
  const events = outputToNotesPoly(frames, onsets, 0.5, 0.3, 10);
  const notes = noteFramesToTime(addPitchBendsToNoteEvents(contours, events));

  // Return the data formatted as MIDI notes
  return notes.map((note) => ({
    midi: note.pitchMidi,
    duration: note.durationSeconds,
    time: note.startTimeSeconds,
    velocity: note.amplitude,
  })) as Note[];
};
