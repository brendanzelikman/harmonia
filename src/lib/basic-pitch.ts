import {
  BasicPitch,
  noteFramesToTime,
  addPitchBendsToNoteEvents,
  outputToNotesPoly,
} from "@spotify/basic-pitch";
import { Note } from "@tonejs/midi/dist/Note";
import { prepareAudioBuffer } from "utils/buffer";

/* Convert the audio buffer of a file into an array of MIDI notes */
export const convertWavToMidi = async (file?: File): Promise<Note[]> => {
  if (!file) return [];

  // Get the audio buffer from the file
  const arrayBuffer = await file.arrayBuffer();
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
  await basicPitch.evaluateModel(
    buffer,
    (f, o, c) => {
      frames.push(...f);
      onsets.push(...o);
      contours.push(...c);
    },
    () => null
  );

  // Convert the frames to MIDI notes
  const notes = noteFramesToTime(
    addPitchBendsToNoteEvents(
      contours,
      outputToNotesPoly(frames, onsets, 0.5, 0.3, 10)
    )
  );

  // Return the data formatted as MIDI notes
  return notes.map((note) => ({
    midi: note.pitchMidi,
    duration: note.durationSeconds,
    time: note.startTimeSeconds,
    velocity: note.amplitude,
  })) as Note[];
};
