import {
  dispatchToggle,
  dispatchClose,
  getToggleValue,
  dispatchOpen,
} from "hooks/useToggle";
import { Hotkey } from ".";
import { unselectClips } from "types/Timeline/thunks/TimelineClipThunks";
import {
  decreaseSubdivision,
  increaseSubdivision,
} from "types/Timeline/TimelineSlice";
import { dispatchCustomEvent } from "utils/event";
import { enableLANCollab } from "app/listener";
import { promptUserForString } from "lib/prompts/html";

// -----------------------------------------------
// Global Hotkeys
// -----------------------------------------------

export const ToggleTerminalHotkey: Hotkey = {
  name: "Toggle Terminal",
  shortcut: "shift+t",
  callback: () => dispatchToggle("terminal"),
};

export const ToggleShortcutsHotkey: Hotkey = {
  name: "Open Shortcuts",
  shortcut: "\\",
  callback: () => dispatchToggle("shortcuts"),
};

export const ToggleKeyboardHotkey: Hotkey = {
  name: "Toggle Keyboard",
  shortcut: "meta+k",
  callback: () => {
    !!getToggleValue("keyboard")
      ? dispatchClose("keyboard")
      : dispatchOpen("keyboard");
  },
};

export const CloseModalsHotkey: Hotkey = {
  name: "Close Modals",
  description: "Close the project dropdowns and modals",
  shortcut: "escape",
  callback: (dispatch) => {
    dispatchClose("terminal");
    dispatchClose("shortcuts");
    dispatchCustomEvent("clipDropdown", { value: false });
    dispatchCustomEvent("cleanupModal");
    dispatch(unselectClips());
  },
};

export const DecreaseSubdivisionHotkey: Hotkey = {
  name: "Decrease Subdivision",
  description: "Decrease the subdivision of the timeline",
  shortcut: "meta+-",
  callback: (dispatch) => dispatch(decreaseSubdivision()),
};

export const IncreaseSubdivisionHotkey: Hotkey = {
  name: "Increase Subdivision",
  description: "Increase the subdivision of the timeline",
  shortcut: "meta+=",
  callback: (dispatch) => dispatch(increaseSubdivision()),
};

export const ToggleCollabHotkey: Hotkey = {
  name: "Toggle Collab",
  shortcut: "shift+'",
  callback: promptUserForString({
    title: "Join Local Session",
    description: "Please enter the host IP address (e.g. 192.168.1.42)",
    onSubmit: (string) => enableLANCollab(string),
  }),
};

// -----------------------------------------------
// Export Hotkeys
// -----------------------------------------------

export const GlobalHotkeys = [
  ToggleTerminalHotkey,
  ToggleShortcutsHotkey,
  ToggleKeyboardHotkey,
  DecreaseSubdivisionHotkey,
  IncreaseSubdivisionHotkey,
  CloseModalsHotkey,
  ToggleCollabHotkey,
];
