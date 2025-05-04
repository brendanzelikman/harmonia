import { Hotkey } from ".";
import {
  selectSelectedTrackId,
  selectSelectedPatternClips,
  selectCurrentTimelineTick,
} from "types/Timeline/TimelineSelectors";
import { mergeSelectedMedia } from "types/Media/MediaThunks";
import {
  toggleTimelineState,
  toggleAddingState,
  toggleLivePlay,
  sampleProject,
} from "types/Timeline/TimelineThunks";
import { Thunk } from "types/Project/ProjectTypes";
import { selectTrackParentIdMap } from "types/Track/TrackSelectors";
import { createUndoType } from "types/redux";
import { promptUserForString } from "lib/prompts/html";
import { inputRomanNumerals } from "utils/roman";
import { createNewPoseClip } from "types/Track/PatternTrack/PatternTrackThunks";
import { WholeNoteTicks } from "utils/duration";
import { nanoid } from "@reduxjs/toolkit";
import { promptLineBreak } from "components/PromptModal";
import {
  filterPatterns,
  filterPortals,
  filterPoses,
  sliceClips,
} from "types/Timeline/thunks/TimelineClipThunks";
import { GiCrystalWand, GiMusicalNotes } from "react-icons/gi";

// -----------------------------------------------
// Timeline Hotkeys
// -----------------------------------------------

export const WaterTreeHotkey: Hotkey = {
  name: "Grow Tree",
  description: "Activate live play and quickstart a project",
  shortcut: "g",
  callback: (dispatch) => dispatch(toggleLivePlay()),
};

export const SampleProjectHotkey: Hotkey = {
  name: "Load Tree",
  description: "Upload the notes of a project by file",
  shortcut: "l",
  callback: (dispatch) => dispatch(sampleProject()),
};

export const ArrangePatternsHotkey: Hotkey = {
  name: "Create Pattern",
  description: "Toggle the adding of pattern clips",
  shortcut: "o",
  callback: (dispatch) => dispatch(toggleAddingState({ data: "pattern" })),
};
export const ArrangePatternIcon = GiMusicalNotes;

export const ArrangePosesHotkey: Hotkey = {
  name: "Create Pose",
  description: "Toggle the adding of pose clips",
  shortcut: "p",
  callback: (dispatch) => dispatch(toggleAddingState({ data: "pose" })),
};
export const ArrangePoseIcon = GiCrystalWand;

export const SelectPatternsHotkey: Hotkey = {
  name: "Select Pattern Clips",
  description: "Add all pattern clips to the selection",
  shortcut: "shift+o",
  callback: (dispatch) => dispatch(filterPatterns()),
};

export const SelectPosesHotkey: Hotkey = {
  name: "Select Pose Clips",
  description: "Add all pose clips to the selection",
  shortcut: "shift+p",
  callback: (dispatch) => dispatch(filterPoses()),
};

export const ArrangePortalsHotkey: Hotkey = {
  name: "Create Portal",
  description: "Toggle the portaling of media",
  shortcut: "j",
  callback: (dispatch) =>
    dispatch(toggleTimelineState({ data: "portaling-clips" })),
};

export const SelectPortalsHotkey: Hotkey = {
  name: "Filter Portals",
  description: "Add all portals to the selection",
  shortcut: "shift+u",
  callback: (dispatch) => dispatch(filterPortals()),
};

export const ToggleScissorsHotkey: Hotkey = {
  name: "Slice Clips",
  description: "Toggle the slicing of media",
  shortcut: "k",
  callback: (dispatch) =>
    dispatch(toggleTimelineState({ data: "slicing-clips" })),
};

export const SliceClipsHotkey: Hotkey = {
  name: "Slice Selected Clips",
  description: "Slice all selected clips in half",
  shortcut: "shift+k",
  callback: (dispatch) => dispatch(sliceClips()),
};

export const MergeClipsHotkey: Hotkey = {
  name: "Merge Clips",
  description: "Merge the selected pattern clips",
  shortcut: "shift+j",
  callback: (dispatch) => dispatch(mergeSelectedMedia()),
};

// --------------------------------------------------
// Export Hotkeys
// --------------------------------------------------

export const TimelineHotkeys = [
  WaterTreeHotkey,
  SampleProjectHotkey,
  ArrangePatternsHotkey,
  ArrangePosesHotkey,
  SelectPatternsHotkey,
  SelectPosesHotkey,
  ArrangePortalsHotkey,
  SelectPortalsHotkey,
  ToggleScissorsHotkey,
  SliceClipsHotkey,
  MergeClipsHotkey,
];

// -----------------------------------------------
// Roman Numeral Hotkeys
// -----------------------------------------------

export const inputPoseRomans = (): Thunk => (dispatch, getProject) => {
  promptUserForString({
    large: true,
    title: "Create Poses with Roman Numerals",
    description: [
      promptLineBreak,
      `Rule #1: Roman numerals are separated by dash.`,
      `Example: {"I - ii - V - I"}`,
      promptLineBreak,
      `Rule #2: Secondary chords are prefixed with slash.`,
      `Example: {"I - V/V - V - I"}`,
      promptLineBreak,
      `Rule #3: Seventh chords are suffixed with symbol.`,
      `Example: {"IM7 - V7/IV - ivm7 - V7"}`,
      promptLineBreak,
      `Please input your sequence:`,
    ],
    callback: (string) => {
      const leadings = inputRomanNumerals(string);
      const project = getProject();
      const undoType = createUndoType("roman", nanoid());
      const patternClip = selectSelectedPatternClips(project).at(0);
      const noClip = patternClip === undefined;
      const timelineTick = selectCurrentTimelineTick(project);
      const baseTick = patternClip?.tick ?? timelineTick;
      const parentMap = selectTrackParentIdMap(project);
      const selectedId = selectSelectedTrackId(project);
      const trackId =
        selectedId ?? noClip ? undefined : parentMap[patternClip.trackId];
      if (!trackId) return;
      for (let i = 0; i < leadings.length; i++) {
        const vector = leadings[i];
        const offset = noClip ? WholeNoteTicks : patternClip.duration;
        const tick = baseTick + (i + 1) * offset;
        const pose = { vector, trackId };
        const clip = { tick, trackId };
        dispatch(createNewPoseClip({ data: { pose, clip }, undoType }));
      }
    },
  })();
};
