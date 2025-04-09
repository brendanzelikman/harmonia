import {
  BasicPitch,
  noteFramesToTime,
  addPitchBendsToNoteEvents,
  outputToNotesPoly,
} from "@spotify/basic-pitch";
import { Note } from "@tonejs/midi/dist/Note";
import { addToggleCloseListener } from "hooks/useToggle";

export const analyzeAudio = async (file?: File): Promise<Note[]> => {
  if (!file) return [];
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext();
  let audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

  if (audioBuffer.sampleRate !== 22050) {
    const resampledBuffer = await resample(audioBuffer, 22050);
    audioBuffer = resampledBuffer;
  }

  if (audioBuffer.numberOfChannels !== 1) {
    const monoBuffer = await toMono(audioBuffer);
    audioBuffer = monoBuffer;
  }

  const basicPitch = new BasicPitch("model/model.json");

  const frames: number[][] = [];
  const onsets: number[][] = [];
  const contours: number[][] = [];

  await basicPitch.evaluateModel(
    audioBuffer,
    (f, o, c) => {
      frames.push(...f);
      onsets.push(...o);
      contours.push(...c);
    },
    () => null
  );

  const notes = noteFramesToTime(
    addPitchBendsToNoteEvents(
      contours,
      outputToNotesPoly(frames, onsets, 0.5, 0.3, 10)
    )
  );

  return notes.map((note) => ({
    midi: note.pitchMidi,
    duration: note.durationSeconds,
    time: note.startTimeSeconds,
    velocity: note.amplitude,
  })) as Note[];
};

function resample(
  buffer: AudioBuffer,
  targetRate: number
): Promise<AudioBuffer> {
  const offlineCtx = new OfflineAudioContext(
    buffer.numberOfChannels,
    buffer.duration * targetRate,
    targetRate
  );
  const src = offlineCtx.createBufferSource();
  src.buffer = buffer;
  src.connect(offlineCtx.destination);
  src.start();
  return offlineCtx.startRendering();
}

function toMono(buffer: AudioBuffer): Promise<AudioBuffer> {
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
}

export async function recordWav(): Promise<File> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const recorder = new MediaRecorder(stream);
  const chunks: Blob[] = [];

  return new Promise<File>((resolve) => {
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "audio/*" });
      const file = new File([blob], "recording.wav", { type: "audio/*" });
      resolve(file);
    };

    recorder.start();

    const stop = () => {
      recorder.stop();
      stream.getTracks().forEach((t) => t.stop());
    };

    addToggleCloseListener("record-pattern", stop);
  });
}
