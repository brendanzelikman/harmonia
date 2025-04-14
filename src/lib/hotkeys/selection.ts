import { Hotkey } from ".";
import { addAllMediaToSelection } from "types/Media/MediaThunks";
import {
  moveClipsDown,
  moveClipsUp,
  moveClipsLeft,
  moveClipsRight,
  scrubClipsLeft,
  scrubClipsRight,
  unselectClips,
} from "types/Timeline/thunks/TimelineClipThunks";

// -----------------------------------------------
// Selection Hotkeys
// -----------------------------------------------

export const SelectClipsHotkey: Hotkey = {
  name: "Select All Clips",
  description: "Select all media",
  shortcut: "meta+a",
  callback: (dispatch) => dispatch(addAllMediaToSelection()),
};

export const _UnselectClipsHotkey: Hotkey = {
  name: "Deselect All Clips",
  description: "Close any open clips, or deselect all media",
  shortcut: "escape",
  callback: (dispatch) => dispatch(unselectClips()),
};

export const _MoveClipsHotkey: Hotkey = {
  name: "Move Selected Clips",
  description: "Move the selected clips around",
  shortcut: "Arrow Keys",
  callback: (dispatch) => dispatch(moveClipsDown()),
};

export const MoveClipsUpHotkey: Hotkey = {
  name: "Move Selected Clips Up",
  description: "Move the selected media up",
  shortcut: "arrowup",
  callback: (dispatch) => dispatch(moveClipsUp()),
};

export const MoveClipsDownHotkey: Hotkey = {
  name: "Move Selected Clips Down",
  description: "Move the selected media down",
  shortcut: "arrowdown",
  callback: (dispatch) => dispatch(moveClipsDown()),
};

export const MoveClipsLeftHotkey: Hotkey = {
  name: "Move Selected Clips Left",
  description: "Move the selected media left",
  shortcut: "arrowleft",
  callback: (dispatch) => dispatch(moveClipsLeft()),
};

export const MoveClipsRightHotkey: Hotkey = {
  name: "Move Selected Clips Right",
  description: "Move the selected media right",
  shortcut: "arrowright",
  callback: (dispatch) => dispatch(moveClipsRight()),
};

export const ScrubClipsLeftHotkey: Hotkey = {
  name: "Scrub to Previous Tick",
  description: "Scrub backward in the timeline",
  shortcut: "shift+arrowleft",
  callback: (dispatch) => dispatch(scrubClipsLeft()),
};

export const ScrubClipsRightHotkey: Hotkey = {
  name: "Scrub to Next Tick",
  description: "Scrub forward in the timeline",
  shortcut: "shift+arrowright",
  callback: (dispatch) => dispatch(scrubClipsRight()),
};

export const _MoveLeftHotkey: Hotkey = {
  name: "Move Left",
  description: "Move back one subdivision",
  shortcut: "arrowleft",
  callback: (dispatch) => dispatch(moveClipsLeft()),
};

export const _MoveRightHotkey: Hotkey = {
  name: "Move Right",
  description: "Move forward one subdivision",
  shortcut: "arrowright",
  callback: (dispatch) => dispatch(moveClipsRight()),
};

export const _ScrubLeftHotkey: Hotkey = {
  name: "Scrub Left",
  description: "Move back one tick",
  shortcut: "shift+arrowleft",
  callback: (dispatch) => dispatch(scrubClipsLeft()),
};

export const _ScrubRightHotkey: Hotkey = {
  name: "Scrub Right",
  description: "Move forward one tick",
  shortcut: "shift+arrowright",
  callback: (dispatch) => dispatch(scrubClipsRight()),
};

// -----------------------------------------------
// Export Hotkeys
// -----------------------------------------------

export const SelectionHotkeys = [
  SelectClipsHotkey,
  MoveClipsUpHotkey,
  MoveClipsDownHotkey,
  MoveClipsLeftHotkey,
  MoveClipsRightHotkey,
  ScrubClipsLeftHotkey,
  ScrubClipsRightHotkey,
];
