import { dispatchOpen, dispatchClose } from "hooks/useToggle";
import { LIVE_RECORDER_INSTANCE } from "types/Instrument/InstrumentClass";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { Thunk } from "types/Project/ProjectTypes";
import { stopTransport } from "./TransportState";
import encodeWAV from "audiobuffer-to-wav";
import { downloadBlob } from "utils/event";

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

// --------------------------------------------------------------
// Thunks
// --------------------------------------------------------------

/** Start recording the transport. */
export const startRecordingTransport = (): Thunk => () => {
  broadcastStartRecordingTransport();
  if (LIVE_RECORDER_INSTANCE.state === "started") return;
  LIVE_RECORDER_INSTANCE.start();
};

/** Stop recording the transport and save the recording. */
export const stopRecordingTransport = (): Thunk => (_, getProject) => {
  broadcastStopRecordingTransport();
  if (LIVE_RECORDER_INSTANCE.state !== "started") return;
  stopTransport();
  LIVE_RECORDER_INSTANCE.stop().then(async (toneBlob) => {
    const context = new AudioContext();
    const arrayBuffer = await toneBlob.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    const wav = encodeWAV(audioBuffer);
    const blob = new Blob([wav], { type: "audio/wav" });
    const projectName = selectProjectName(getProject());
    const fileName = `${projectName ?? "Project"} Recording.wav`;
    downloadBlob(blob, fileName);
  });
};
