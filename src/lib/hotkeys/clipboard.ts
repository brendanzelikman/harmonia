import { Hotkey } from ".";
import {
  copySelectedMedia,
  pasteSelectedMedia,
  cutSelectedMedia,
  duplicateSelectedMedia,
  deleteSelectedMedia,
} from "types/Media/MediaThunks";
import { exportSelectedClipsToMIDI } from "types/Timeline/thunks/TimelineSelectionThunks";

// -----------------------------------------------
// Clipboard Hotkeys
// -----------------------------------------------

export const CopyClipsHotkey: Hotkey = {
  name: "Copy Selected Clips",
  description: "Copy the selected media",
  shortcut: "meta+c",
  callback: (dispatch) => dispatch(copySelectedMedia()),
};

export const PasteClipsHotkey: Hotkey = {
  name: "Paste From Clipboard",
  description: "Paste the copied media",
  shortcut: "meta+v",
  callback: (dispatch) => dispatch(pasteSelectedMedia()),
};

export const CutClipsHotkey: Hotkey = {
  name: "Cut Selected Clips",
  description: "Cut the selected media",
  shortcut: "meta+x",
  callback: (dispatch) => dispatch(cutSelectedMedia()),
};

export const DuplicateClipsHotkey: Hotkey = {
  name: "Duplicate Selected Clips",
  description: "Duplicate the selected media",
  shortcut: "meta+d",
  callback: (dispatch) => dispatch(duplicateSelectedMedia()),
};

export const DeleteClipsHotkey: Hotkey = {
  name: "Delete Selected Clips",
  description: "Delete the selected clips",
  shortcut: "backspace",
  callback: (dispatch) => dispatch(deleteSelectedMedia()),
};

export const ExportClipsHotkey: Hotkey = {
  name: "Export Selection to MIDI",
  description: "Export the selected clips to a MIDI file",
  shortcut: "meta+alt+m",
  callback: (dispatch) => dispatch(exportSelectedClipsToMIDI()),
};

// -----------------------------------------------
// Export Hotkeys
// -----------------------------------------------

export const ClipboardHotkeys = [
  CopyClipsHotkey,
  PasteClipsHotkey,
  CutClipsHotkey,
  DuplicateClipsHotkey,
  DeleteClipsHotkey,
  ExportClipsHotkey,
];
