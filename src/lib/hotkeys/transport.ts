import { getToggleValue } from "hooks/useToggle";
import { Hotkey } from ".";
import { setLoop, setMute } from "types/Transport/TransportSlice";
import { toggleTransport, stopTransport } from "types/Transport/TransportState";
import {
  stopRecordingTransport,
  startRecordingTransport,
} from "types/Transport/TransportRecorder";
import { RECORD_TRANSPORT } from "types/Transport/TransportRecorder";

// -----------------------------------------------
// Transport Hotkeys
// -----------------------------------------------

export const ToggleTransportHotkey: Hotkey = {
  name: "Toggle Playback",
  description: `Start or pause the transport playback`,
  shortcut: " ",
  callback: (dispatch) => dispatch(toggleTransport()),
};

export const StopTransportHotkey: Hotkey = {
  name: "Stop Playback",
  description: "Stop the transport playback.",
  shortcut: "enter",
  callback: () => stopTransport(),
};

export const RecordTransportHotkey: Hotkey = {
  name: "Record Playback",
  description: "Toggle whether the transport is recording.",
  shortcut: "shift+r",
  callback: (dispatch) => {
    !!getToggleValue(RECORD_TRANSPORT)
      ? dispatch(stopRecordingTransport())
      : dispatch(startRecordingTransport());
  },
};

export const LoopTransportHotkey: Hotkey = {
  name: "Loop Playback",
  description: "Toggle whether the transport is looping.",
  shortcut: "shift+l",
  callback: (dispatch) => dispatch(setLoop()),
};

export const DebugTransportHotkey: Hotkey = {
  name: "Debug Transport",
  description: "Troubleshoot sound issues.",
  shortcut: "Refresh",
  callback: () => null,
};

export const MuteTransportHotkey: Hotkey = {
  name: "Mute Playback",
  description: "Toggle whether the transport is muted.",
  shortcut: "shift+m",
  callback: (dispatch) => dispatch(setMute()),
};

// -----------------------------------------------
// Export Hotkeys
// -----------------------------------------------

export const TransportHotkeys = [
  ToggleTransportHotkey,
  StopTransportHotkey,
  RecordTransportHotkey,
  LoopTransportHotkey,
  DebugTransportHotkey,
  MuteTransportHotkey,
];
