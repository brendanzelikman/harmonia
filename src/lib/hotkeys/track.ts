import { nanoid } from "@reduxjs/toolkit";
import { Hotkey } from ".";
import { createUndoType } from "types/redux";
import {
  selectPreviousTrack,
  selectNextTrack,
  deleteSelectedTrack,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import {
  setSelectedTrackId,
  updateTimelineTick,
} from "types/Timeline/TimelineSlice";
import {
  toggleTimelineState,
  toggleTrackByIndex,
} from "types/Timeline/TimelineThunks";
import { inputPatternTrackSample } from "lib/prompts/sampler";
import {
  createDrumTracks,
  createRandomHierarchy,
} from "types/Track/ScaleTrack/ScaleTrackThunks";
import { promptUserForTree } from "lib/prompts/tree";
import {
  collapseTracks,
  collapseTrackAncestors,
} from "types/Track/TrackThunks";
import { inputScaleTrackScale } from "lib/prompts/scale";

// ---------------------------------------------------
// Track Hotkeys
// ---------------------------------------------------

export const CreateTracksHotkey: Hotkey = {
  name: "Create Tree",
  description: "Prompt the user to type in a new tree",
  shortcut: "n",
  callback: (dispatch) => dispatch(promptUserForTree),
};

export const CreateDrumTracksHotkey: Hotkey = {
  name: "Drum Tree",
  description: "Create Drum Tree",
  shortcut: "alt+shift+n",
  callback: (dispatch) => dispatch(createDrumTracks()),
};

export const CreateRandomTracksHotkey: Hotkey = {
  name: "Create Random Tree",
  description: "Create Random Tree",
  shortcut: "alt+n",
  callback: (dispatch) => dispatch(createRandomHierarchy()),
};

export const CollapseTrackHotkey: Hotkey = {
  name: "Collapse / Expand Track",
  description: "Collapse/expand the selected track",
  shortcut: "shift+c",
  callback: (dispatch) => dispatch(collapseTracks()),
};

export const CollapseParentsHotkey: Hotkey = {
  name: "Minify/Enlarge Parent Tracks",
  description: "Collapse/expand the parent tracks of the selected track",
  shortcut: "meta+shift+c",
  callback: (dispatch) => dispatch(collapseTrackAncestors()),
};

export const DeleteTrackHotkey: Hotkey = {
  name: "Delete Selected Track",
  description: "Delete the selected track",
  shortcut: "shift+backspace",
  callback: (dispatch) => dispatch(deleteSelectedTrack()),
};

// ------------------------------------------------
// Scale Track Hotkeys
// ------------------------------------------------

export const InputScaleHotkey: Hotkey = {
  name: "Change Track Scale",
  description: "Prompt the user to type in a new scale",
  shortcut: "shift+s",
  callback: (dispatch) => dispatch(inputScaleTrackScale()),
};

// -----------------------------------------------
// Pattern Track Hotkeys
// -----------------------------------------------

export const ToggleEditorHotkey: Hotkey = {
  name: "Change Track Instrument",
  description: "Toggle the editor",
  shortcut: "shift+i",
  callback: (dispatch) =>
    dispatch(toggleTimelineState({ data: "editing-tracks" })),
};

export const InputSampleHotkey: Hotkey = {
  name: "Upload Sample to Track",
  description: "Load a sample into the selected Sampler",
  shortcut: "meta+shift+i",
  callback: (dispatch) => dispatch(inputPatternTrackSample()),
};

// -----------------------------------------------
// Selection Hotkeys
// -----------------------------------------------

export const SelectTrackDisplayedHotkey: Hotkey = {
  name: "Select Track",
  description: "Select the selected track",
  shortcut: "shift+[1-9]",
  callback: () => null,
};

export const SelectPreviousTrackHotkey: Hotkey = {
  name: "Select Previous Track",
  description: "Select the previous track",
  shortcut: "shift+arrowup",
  callback: (dispatch) => dispatch(selectPreviousTrack()),
};

export const SelectNextTrackHotkey: Hotkey = {
  name: "Select Next Track",
  description: "Select the next track",
  shortcut: "shift+arrowdown",
  callback: (dispatch) => dispatch(selectNextTrack()),
};

export const DeselectTrackHotkey: Hotkey = {
  name: "Deselect Track",
  description: "Deselect the selected track",
  shortcut: "shift+escape",
  callback: (dispatch) => {
    const undoType = createUndoType("deselectTrack", nanoid());
    dispatch(setSelectedTrackId({ data: null, undoType }));
    dispatch(updateTimelineTick({ data: 0, undoType }));
  },
};

export const SelectFirstTrackHotkey: Hotkey = {
  name: "Select Track 1",
  description: "Select the first track",
  shortcut: "shift+!",
  callback: (dispatch) => dispatch(toggleTrackByIndex(0)),
};

export const SelectSecondTrackHotkey: Hotkey = {
  name: "Select Track 2",
  description: "Select the second track",
  shortcut: "shift+@",
  callback: (dispatch) => dispatch(toggleTrackByIndex(1)),
};

export const SelectThirdTrackHotkey: Hotkey = {
  name: "Select Track 3",
  description: "Select the third track",
  shortcut: "shift+#",
  callback: (dispatch) => dispatch(toggleTrackByIndex(2)),
};

export const SelectFourthTrackHotkey: Hotkey = {
  name: "Select Track 4",
  description: "Select the fourth track",
  shortcut: "shift+$",
  callback: (dispatch) => dispatch(toggleTrackByIndex(3)),
};

export const SelectFifthTrackHotkey: Hotkey = {
  name: "Select Track 5",
  description: "Select the fifth track",
  shortcut: "shift+%",
  callback: (dispatch) => dispatch(toggleTrackByIndex(4)),
};

export const SelectSixthTrackHotkey: Hotkey = {
  name: "Select Track 6",
  description: "Select the sixth track",
  shortcut: "shift+^",
  callback: (dispatch) => dispatch(toggleTrackByIndex(5)),
};

export const SelectSeventhTrackHotkey: Hotkey = {
  name: "Select Track 7",
  description: "Select the seventh track",
  shortcut: "shift+&",
  callback: (dispatch) => dispatch(toggleTrackByIndex(6)),
};

export const SelectEighthTrackHotkey: Hotkey = {
  name: "Select Track 8",
  description: "Select the eighth track",
  shortcut: "shift+*",
  callback: (dispatch) => dispatch(toggleTrackByIndex(7)),
};

export const SelectNinthTrackHotkey: Hotkey = {
  name: "Select Track 9",
  description: "Select the ninth track",
  shortcut: "shift+(",
  callback: (dispatch) => dispatch(toggleTrackByIndex(8)),
};

// -----------------------------------------------
// Export Hotkeys
// -----------------------------------------------

export const TrackHotkeys = [
  CreateTracksHotkey,
  CreateDrumTracksHotkey,
  CreateRandomTracksHotkey,
  CollapseTrackHotkey,
  CollapseParentsHotkey,
  DeleteTrackHotkey,
  InputScaleHotkey,
  ToggleEditorHotkey,
  InputSampleHotkey,
  SelectPreviousTrackHotkey,
  SelectNextTrackHotkey,
  DeselectTrackHotkey,
  SelectFirstTrackHotkey,
  SelectSecondTrackHotkey,
  SelectThirdTrackHotkey,
  SelectFourthTrackHotkey,
  SelectFifthTrackHotkey,
  SelectSixthTrackHotkey,
  SelectSeventhTrackHotkey,
  SelectEighthTrackHotkey,
  SelectNinthTrackHotkey,
];
