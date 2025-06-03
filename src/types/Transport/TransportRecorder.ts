import { dispatchOpen, dispatchClose } from "hooks/useToggle";
import { LIVE_RECORDER_INSTANCE } from "types/Instrument/InstrumentClass";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { Thunk } from "types/Project/ProjectTypes";
import { stopTransport } from "./TransportState";
import encodeWAV from "audiobuffer-to-wav";
import { downloadBlob } from "utils/event";
import {
  selectInstrumentTrack,
  selectTrackLabelById,
} from "types/Track/TrackSelectors";
import { Midi } from "@tonejs/midi";
import { selectTransport } from "./TransportSelectors";
import { PatternMidiChord } from "types/Pattern/PatternTypes";
import { getPatternMidiChordNotes } from "types/Pattern/PatternUtils";
import { ticksToSeconds } from "utils/duration";
import { promptUserForString } from "lib/prompts/html";
import { getTransport } from "tone";

// --------------------------------------------------------------
// Events
// --------------------------------------------------------------

export const RECORD_TRANSPORT = "recordTransport";

/** Dispatch an event to start recording the transport. */
export const broadcastStartRecordingTransport = () => {
  dispatchOpen(RECORD_TRANSPORT);
};

/** Dispatch an event to stop recording the transport. */
export const broadcastStopRecordingTransport = () => {
  dispatchClose(RECORD_TRANSPORT);
};

// ---------------------------------------------------------------
// MIDI
// ---------------------------------------------------------------
export const MIDI_RECORDING_KEY = "recordedMidiStream";
export const MIDI_TIME_KEY = "recordedMidiTime";

/** Add a note to the MIDI stream */
export const recordNoteToMidiStream = (note: any) => {
  const noteData = JSON.stringify(note);
  const midiStream = localStorage.getItem(MIDI_RECORDING_KEY);
  if (!midiStream) {
    localStorage.setItem(MIDI_RECORDING_KEY, noteData);
  } else {
    localStorage.setItem(MIDI_RECORDING_KEY, midiStream + "+" + noteData);
  }
};

/** Get the start time of the recorded MIDI stream */
export const getRecordingStart = () =>
  window.localStorage.getItem(MIDI_TIME_KEY);

// --------------------------------------------------------------
// Thunks
// --------------------------------------------------------------

/** Start recording the transport. */
export const startRecordingTransport = (): Thunk => () => {
  broadcastStartRecordingTransport();
  window.localStorage.removeItem(MIDI_RECORDING_KEY);
  localStorage.setItem(MIDI_TIME_KEY, `${getTransport().now()}`);
  if (LIVE_RECORDER_INSTANCE.state === "started") return;
  LIVE_RECORDER_INSTANCE.start();
};

/** Stop recording the transport and save the recording. */
export const stopRecordingTransport = (): Thunk => async (_, getProject) => {
  broadcastStopRecordingTransport();
  stopTransport();

  // Download data and stop immediately
  const audio = await LIVE_RECORDER_INSTANCE.stop();
  const stream = localStorage.getItem(MIDI_RECORDING_KEY);
  localStorage.removeItem(MIDI_RECORDING_KEY);
  if (!stream?.length) return;

  let type;
  await promptUserForString({
    title: `Ready for Download!`,
    description: `Please enter "midi", "wav", or "both"`,
    callback: (value) => {
      type = value;
    },
  })();
  if (type !== "midi" && type !== "wav" && type !== "both") return;

  // Download wav data
  if (type === "wav" || type === "both") {
    const context = new AudioContext();
    const arrayBuffer = await audio.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    const wav = encodeWAV(audioBuffer);
    const blob = new Blob([wav], { type: "audio/wav" });
    const projectName = selectProjectName(getProject());
    const fileName = `${projectName ?? "Project"} Recording.wav`;
    downloadBlob(blob, fileName);
  }
  if (type === "wav") return;
  const events = stream.split("+");
  const blocks = events.map((event) => JSON.parse(event));

  const instrumentChordMap: Record<
    string,
    { chord: PatternMidiChord; time: number }[]
  > = blocks.reduce((acc, block) => {
    const { id, chord, time } = block;
    if (!acc[id]) {
      acc[id] = [];
    }
    acc[id].push({ chord, time });
    return acc;
  }, {});

  const project = getProject();
  const transport = selectTransport(project);
  const midi = new Midi();
  midi.header.setTempo(transport.bpm);
  let channel = 0;
  for (const [id, chords] of Object.entries(instrumentChordMap)) {
    const track = selectInstrumentTrack(project, id);
    if (!track) continue;
    const midiTrack = midi.addTrack();
    midiTrack.name = `Track ${selectTrackLabelById(project, track.id)}`;
    midiTrack.channel = channel++;
    for (const { chord, time } of chords) {
      for (const note of getPatternMidiChordNotes(chord)) {
        const { MIDI: midi, duration: ticks, velocity } = note;
        const duration = ticksToSeconds(ticks, transport.bpm);
        midiTrack.addNote({ midi, time, duration, velocity });
      }
    }
  }
  if (!channel) return;
  const fileName = `${selectProjectName(getProject())} Recording.mid`;
  const blob = new Blob([midi.toArray()], { type: "audio/midi" });
  downloadBlob(blob, fileName);
};
