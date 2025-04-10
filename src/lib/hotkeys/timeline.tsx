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
} from "types/Timeline/TimelineThunks";
import { Thunk } from "types/Project/ProjectTypes";
import { selectTrackParentIdMap } from "types/Track/TrackSelectors";
import { selectPatternClips } from "types/Clip/ClipSelectors";
import { createUndoType, Payload, unpackData } from "types/redux";
import { promptUserForString } from "utils/html";
import { inputRomanNumerals } from "lib/roman-numerals";
import {
  createCourtesyPatternClip,
  createCourtesyPoseClip,
} from "types/Track/PatternTrack/PatternTrackThunks";
import { WholeNoteTicks } from "utils/duration";
import { nanoid } from "@reduxjs/toolkit";
import { promptLineBreak } from "components/PromptModal";
import { getValueByKey } from "utils/object";
import { PatternClip } from "types/Clip/ClipTypes";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import {
  filterPatterns,
  filterPortals,
  filterPoses,
  sliceClips,
} from "types/Timeline/thunks/TimelineClipThunks";

// -----------------------------------------------
// Timeline Hotkeys
// -----------------------------------------------

export const WaterTreeHotkey: Hotkey = {
  name: "Water Track",
  description: "Activate live play and quickstart a project",
  shortcut: "n",
  callback: (dispatch) => dispatch(toggleLivePlay()),
};

export const ArrangePatternsHotkey: Hotkey = {
  name: "Create Pattern",
  description: "Toggle the adding of pattern clips",
  shortcut: "o",
  callback: (dispatch) => dispatch(toggleAddingState({ data: "pattern" })),
};

export const ArrangePosesHotkey: Hotkey = {
  name: "Create Pose",
  description: "Toggle the adding of pose clips",
  shortcut: "p",
  callback: (dispatch) => dispatch(toggleAddingState({ data: "pose" })),
};

export const SelectPatternsHotkey: Hotkey = {
  name: "Filter Pattern Clips",
  description: "Add all pattern clips to the selection",
  shortcut: "shift+o",
  callback: (dispatch) => dispatch(filterPatterns()),
};

export const SelectPosesHotkey: Hotkey = {
  name: "Filter Pose Clips",
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
  name: "Slice Clip",
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
  name: "Merge Selected Patterns",
  description: "Merge the selected pattern clips",
  shortcut: "shift+j",
  callback: (dispatch) => dispatch(mergeSelectedMedia()),
};

export const RomanizeClipsHotkey: Hotkey = {
  name: "Input Roman Numerals",
  description: "Create poses based on the input roman numerals",
  shortcut: "g",
  callback: (dispatch) => dispatch(inputPoseRomans()),
};

// --------------------------------------------------
// Export Hotkeys
// --------------------------------------------------

export const TimelineHotkeys = [
  WaterTreeHotkey,
  ArrangePatternsHotkey,
  ArrangePosesHotkey,
  SelectPatternsHotkey,
  SelectPosesHotkey,
  ArrangePortalsHotkey,
  SelectPortalsHotkey,
  ToggleScissorsHotkey,
  SliceClipsHotkey,
  MergeClipsHotkey,
  RomanizeClipsHotkey,
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
      <span>Rule #1: Roman numerals are separated by dash.</span>,
      <span>Example: {"I - ii - V - I"}</span>,
      promptLineBreak,
      <span>Rule #2: Secondary chords are prefixed with slash.</span>,
      <span>Example: {"I - V/V - V - I"}</span>,
      promptLineBreak,
      <span>Rule #3: Seventh chords are suffixed with symbol.</span>,
      <span>Example: {"IM7 - V7/IV - ivm7 - V7"}</span>,
      promptLineBreak,
      <span className="underline">Please input your sequence:</span>,
    ],
    callback: (string) => {
      const leadings = inputRomanNumerals(string);
      const project = getProject();
      const undoType = createUndoType("roman", nanoid());
      const patternClip = selectSelectedPatternClips(project).at(0);
      const noClip = patternClip === undefined;
      const baseTick = patternClip?.tick ?? selectCurrentTimelineTick(project);
      const trackId =
        selectSelectedTrackId(project) ??
        getValueByKey(selectTrackParentIdMap(project), patternClip?.trackId);
      if (!trackId) return;
      for (let i = 0; i < leadings.length; i++) {
        const vector = leadings[i];
        const offset = noClip ? WholeNoteTicks : patternClip.duration;
        const tick = baseTick + (i + 1) * offset;
        const pose = { vector, trackId };
        const clip = { tick, trackId };
        dispatch(createCourtesyPoseClip({ data: { pose, clip }, undoType }));
      }
    },
  });
};

export const promptUserForRomanNumerals =
  (payload: Payload<PatternClip>): Thunk =>
  (dispatch, getProject) => {
    const patternClip = unpackData(payload);
    const pattern = selectPatternById(getProject(), patternClip.patternId);
    promptUserForString({
      large: true,
      title: "Create Poses with Roman Numerals",
      description: [
        promptLineBreak,
        <span>Rule #1: Roman numerals are separated by dash.</span>,
        <span>Example: {"I - ii - V - I"}</span>,
        promptLineBreak,
        <span>Rule #2: Secondary chords are prefixed with slash.</span>,
        <span>Example: {"I - V/V - V - I"}</span>,
        promptLineBreak,
        <span>Rule #3: Seventh chords are suffixed with symbol.</span>,
        <span>Example: {"IM7 - V7/IV - ivm7 - V7"}</span>,
        promptLineBreak,
        <span className="underline">Please input your sequence:</span>,
      ],
      callback: (string) => {
        const leadings = inputRomanNumerals(string);
        const project = getProject();
        const patternClips = selectPatternClips(project);
        const undoType = createUndoType("roman", nanoid());
        const noClip = patternClip === undefined;
        const baseTick =
          patternClip?.tick ?? selectCurrentTimelineTick(project);
        const trackId = getValueByKey(
          selectTrackParentIdMap(project),
          patternClip?.trackId
        );
        if (!trackId) return;
        for (let i = 0; i < leadings.length; i++) {
          const vector = leadings[i];
          const offset = noClip
            ? WholeNoteTicks
            : patternClip.duration ?? WholeNoteTicks;
          const tick = baseTick + (i + 1) * offset;
          const pose = { vector, trackId };
          const newPatternClip = { tick, trackId: patternClip.trackId };
          const clip = { tick, trackId };
          const pc = patternClips.find(
            (pc) =>
              pc.tick === tick &&
              pc.trackId === trackId &&
              pc.patternId === patternClip.patternId
          );
          if (!pc) {
            dispatch(
              createCourtesyPatternClip({
                data: { pattern, clip: newPatternClip },
                undoType,
              })
            );
          }
          dispatch(createCourtesyPoseClip({ data: { pose, clip }, undoType }));
        }
      },
    })();
  };
