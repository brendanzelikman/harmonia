import { dispatchToggle, dispatchClose } from "hooks/useToggle";
import { Hotkey } from ".";
import { unselectClips } from "types/Timeline/thunks/TimelineClipThunks";
import {
  decreaseSubdivision,
  increaseSubdivision,
} from "types/Timeline/TimelineSlice";
import { dispatchCustomEvent } from "utils/event";

// -----------------------------------------------
// Global Hotkeys
// -----------------------------------------------

export const ToggleDiaryHotkey: Hotkey = {
  name: "Toggle Diary",
  shortcut: "shift+d",
  callback: () => dispatchToggle("diary"),
};

export const ToggleTerminalHotkey: Hotkey = {
  name: "Toggle Terminal",
  shortcut: "shift+t",
  callback: () => dispatchToggle("terminal"),
};

export const ToggleShortcutsHotkey: Hotkey = {
  name: "Toggle Shortcuts",
  shortcut: "\\",
  callback: () => dispatchToggle("shortcuts"),
};

export const CloseModalsHotkey: Hotkey = {
  name: "Close Modals",
  description: "Close the project terminal, editor, and diary.",
  shortcut: "escape",
  callback: (dispatch) => {
    dispatchClose("diary");
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

// -----------------------------------------------
// Export Hotkeys
// -----------------------------------------------

export const GlobalHotkeys = [
  ToggleDiaryHotkey,
  ToggleTerminalHotkey,
  ToggleShortcutsHotkey,
  DecreaseSubdivisionHotkey,
  IncreaseSubdivisionHotkey,
  CloseModalsHotkey,
];
