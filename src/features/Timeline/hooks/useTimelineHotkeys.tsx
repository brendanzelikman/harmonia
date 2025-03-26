import { Hotkey, useDispatchedHotkey } from "lib/react-hotkeys-hook";
import {
  decreaseSubdivision,
  increaseSubdivision,
  setSelectedTrackId,
  updateMediaSelection,
} from "types/Timeline/TimelineSlice";
import {
  selectSelectedMedia,
  selectSelectedPatternTrack,
  selectSelectedPoseClips,
  selectSelectedTrackId,
  selectSelectedPatternClips,
  selectSelectedClipIds,
} from "types/Timeline/TimelineSelectors";
import {
  createDrumTracks,
  createRandomHierarchy,
} from "types/Track/ScaleTrack/ScaleTrackThunks";
import {
  addAllMediaToSelection,
  copySelectedMedia,
  pasteSelectedMedia,
  cutSelectedMedia,
  duplicateSelectedMedia,
  deleteSelectedMedia,
  moveSelectedMediaLeft,
  moveSelectedMediaRight,
  mergeSelectedMedia,
} from "types/Media/MediaThunks";
import {
  toggleTimelineState,
  toggleAddingState,
  toggleLivePlay,
} from "types/Timeline/TimelineThunks";
import {
  exportSelectedClipsToMIDI,
  deleteSelectedTrack,
  selectPreviousTrack,
  selectNextTrack,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import {
  collapseTrackChildren,
  collapseTrackParents,
  collapseTracks,
} from "types/Track/TrackThunks";
import {
  movePlayheadLeft,
  movePlayheadRight,
} from "types/Transport/TransportThunks";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectTrackAncestors,
  selectTrackChildren,
  selectTrackParentIdMap,
} from "types/Track/TrackSelectors";
import { setupFileInput } from "providers/idb/samples";
import {
  selectHasClips,
  selectOpenedClips,
  selectPatternClips,
} from "types/Clip/ClipSelectors";
import { inputPoseVector } from "types/Pose/PoseThunks";
import { createNewTree } from "utils/tree";
import { createUndoType, Payload, unpackData } from "lib/redux";
import { updatePoses } from "types/Pose/PoseSlice";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import { Pose } from "types/Pose/PoseTypes";
import { mapVector } from "utils/vector";
import { toggleClipDropdown } from "types/Clip/ClipThunks";
import { toggleTimeline } from "types/Meta/MetaSlice";
import { promptUserForString } from "utils/html";
import { inputRomanNumerals } from "utils/roman";
import { getTransport } from "tone";
import {
  createCourtesyPatternClip,
  createCourtesyPoseClip,
} from "types/Track/PatternTrack/PatternTrackThunks";
import { WholeNoteTicks } from "utils/durations";
import { nanoid } from "@reduxjs/toolkit";
import { promptLineBreak } from "components/PromptModal";
import { selectPortals } from "types/Portal/PortalSelectors";
import { getValueByKey } from "utils/objects";
import {
  isPatternClipId,
  isPoseClipId,
  PatternClip,
} from "types/Clip/ClipTypes";
import { selectTrackClipIds } from "types/Arrangement/ArrangementTrackSelectors";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { selectPatternById } from "types/Pattern/PatternSelectors";

export function useTimelineHotkeys() {
  // Timeline Hotkeys
  useDispatchedHotkey(DECREASE_SUBDIVISION_HOTKEY);
  useDispatchedHotkey(INCREASE_SUBDIVISION_HOTKEY);

  // Track Hotkeys
  useDispatchedHotkey(LOAD_SAMPLES_HOTKEY);
  useDispatchedHotkey(SELECT_PREVIOUS_TRACK_HOTKEY);
  useDispatchedHotkey(SELECT_NEXT_TRACK_HOTKEY);
  useDispatchedHotkey(COLLAPSE_TRACK_HOTKEY);
  useDispatchedHotkey(COLLAPSE_TRACK_PARENTS_HOTKEY);
  useDispatchedHotkey(COLLAPSE_TRACK_CHILDREN_HOTKEY);
  useDispatchedHotkey(DELETE_TRACK_HOTKEY);

  // Motif Hotkeys
  useDispatchedHotkey(CREATE_NEW_TREE_HOTKEY);
  useDispatchedHotkey(CREATE_RANDOM_TRACKS_HOTKEY);
  useDispatchedHotkey(CREATE_DRUM_TRACKS_HOTKEY);
  useDispatchedHotkey(ARRANGE_CLIPS_HOTKEY);
  useDispatchedHotkey(ARRANGE_PATTERN_CLIPS_HOTKEY);
  useDispatchedHotkey(ARRANGE_POSE_CLIPS_HOTKEY);
  useDispatchedHotkey(ARRANGE_PORTALS_HOTKEY);
  useDispatchedHotkey(SELECT_PATTERN_CLIPS_HOTKEY);
  useDispatchedHotkey(SELECT_POSE_CLIPS_HOTKEY);
  useDispatchedHotkey(SELECT_PORTALS_HOTKEY);
  useDispatchedHotkey(SLICE_CLIPS_HOTKEY);
  useDispatchedHotkey(MERGE_MEDIA_HOTKEY);
  useDispatchedHotkey(INVERT_POSE_CLIPS_HOTKEY);
  useDispatchedHotkey(FOREST_HOTKEY);

  // Media Hotkeys
  useDispatchedHotkey(SELECT_ALL_MEDIA_HOTKEY);
  useDispatchedHotkey(CLOSE_ALL_CLIPS_HOTKEY);
  useDispatchedHotkey(MOVE_LEFT_HOTKEY);
  useDispatchedHotkey(MOVE_RIGHT_HOTKEY);
  useDispatchedHotkey(SCRUB_LEFT_HOTKEY);
  useDispatchedHotkey(SCRUB_RIGHT_HOTKEY);
  useDispatchedHotkey(TOGGLE_LIVE_PLAY_HOTKEY);
  useDispatchedHotkey(DESELECT_TRACK_HOTKEY);

  // Clipboard Hotkeys
  useDispatchedHotkey(COPY_MEDIA_HOTKEY);
  useDispatchedHotkey(PASTE_MEDIA_HOTKEY);
  useDispatchedHotkey(CUT_MEDIA_HOTKEY);
  useDispatchedHotkey(DUPLICATE_MEDIA_HOTKEY);
  useDispatchedHotkey(DELETE_MEDIA_HOTKEY);
  useDispatchedHotkey(EXPORT_MEDIA_HOTKEY);
  useDispatchedHotkey(MOVE_MEDIA_LEFT_HOTKEY);
  useDispatchedHotkey(MOVE_MEDIA_RIGHT_HOTKEY);
  useDispatchedHotkey(SCRUB_MEDIA_LEFT_HOTKEY);
  useDispatchedHotkey(SCRUB_MEDIA_RIGHT_HOTKEY);
  useDispatchedHotkey(INPUT_POSE_VECTOR_HOTKEY);
  useDispatchedHotkey(INPUT_ROMAN_NUMERAL_HOTKEY);
}

// -----------------------------------------------
// Timeline Hotkeys
// -----------------------------------------------

export const DECREASE_SUBDIVISION_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Decrease Subdivision",
  description: "Decrease the subdivision of the timeline",
  shortcut: "meta+minus",
  callback: () => dispatch(decreaseSubdivision()),
});

export const INCREASE_SUBDIVISION_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Increase Subdivision",
  description: "Increase the subdivision of the timeline",
  shortcut: "meta+equal",
  callback: () => dispatch(increaseSubdivision()),
});

export const RESET_SCROLL_HOTKEY =
  (element?: HTMLDivElement | null): Thunk<Hotkey> =>
  () => ({
    name: "Reset Scroll Position",
    description: "Reset the scroll position of the timeline",
    shortcut: "shift+enter",
    callback: () => element && element.scroll({ left: 0, behavior: "smooth" }),
  });

// -----------------------------------------------
// Track Hotkeys
// -----------------------------------------------

export const CREATE_NEW_TREE_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Create Tree",
  description: "Prompt the user to type in a new tree",
  shortcut: "i",
  callback: () => dispatch(createNewTree),
});

export const CREATE_DRUM_TRACKS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Drum Tree",
  description: "Create Drum Tree",
  shortcut: "alt+shift+i",
  callback: () => dispatch(createDrumTracks()),
});

export const CREATE_RANDOM_TRACKS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Randomize Tree",
  description: "Create Random Tree",
  shortcut: "alt+i",
  callback: () => dispatch(createRandomHierarchy()),
});

export const LOAD_SAMPLES_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Load Samples",
  description: "Load a sample into the selected Pattern Track",
  shortcut: "meta+alt+p",
  callback: () => {
    const project = getProject();
    const track = selectSelectedPatternTrack(project);
    dispatch(setupFileInput(track));
  },
});

export const SELECT_PREVIOUS_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Select Previous Track",
  description: "Select the previous track",
  shortcut: "up",
  callback: () => dispatch(selectPreviousTrack()),
});

export const SELECT_NEXT_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Select Next Track",
  description: "Select the next track",
  shortcut: "down",
  callback: () => dispatch(selectNextTrack()),
});

export const COLLAPSE_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Collapse/Expand Track",
  description: "Collapse/expand the selected track",
  shortcut: "comma",
  callback: () => {
    const project = getProject();
    const trackId = selectSelectedTrackId(project);
    if (!trackId) return;
    dispatch(collapseTracks({ data: { trackIds: [trackId] } }));
  },
});

export const COLLAPSE_TRACK_PARENTS_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Collapse/Expand Parent Tracks",
  description: "Collapse/expand the parent tracks of the selected track",
  shortcut: "meta+comma",
  callback: () => {
    const project = getProject();
    const trackId = selectSelectedTrackId(project);
    if (!trackId) return;
    const parents = selectTrackAncestors(project, trackId);
    const isParentCollapsed = parents.some((track) => track?.collapsed);
    dispatch(collapseTrackParents(trackId, !isParentCollapsed));
  },
});

export const COLLAPSE_TRACK_CHILDREN_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Collapse/Expand Child Tracks",
  description: "Collapse/expand the child tracks of the selected track",
  shortcut: "meta+shift+comma",
  callback: () => {
    const project = getProject();
    const trackId = selectSelectedTrackId(project);
    if (!trackId) return;
    const chain = selectTrackChildren(project, trackId);
    const isChildCollapsed = chain.some((track) => track?.collapsed);
    dispatch(collapseTrackChildren(trackId, !isChildCollapsed));
  },
});

export const DELETE_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Delete Selected Track",
  description: "Delete the selected track",
  shortcut: "meta+backspace",
  callback: () => dispatch(deleteSelectedTrack()),
});

// -----------------------------------------------
// Motif Hotkeys
// -----------------------------------------------

export const ARRANGE_CLIPS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Start/Stop Arranging Clips",
  description: "Toggle the adding of clips",
  shortcut: "a",
  // callback: () => dispatch(toggleTimelineState({ data: "adding-clips" })),
  callback: () => null,
});

export const ARRANGE_PATTERN_CLIPS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Create Pattern",
  description: "Toggle the adding of pattern clips",
  shortcut: "o",
  callback: () => dispatch(toggleAddingState({ data: "pattern" })),
});

export const SELECT_PATTERN_CLIPS_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Select Pattern Clips",
  description: "Add all pattern clips to the selection",
  shortcut: "shift+o",
  callback: () => {
    const project = getProject();
    const trackId = selectSelectedTrackId(project);
    const clipIds = selectSelectedClipIds(project);
    const trackClipIds = selectTrackClipIds(project, trackId);
    if (clipIds.length) {
      dispatch(
        updateMediaSelection({
          data: { clipIds: clipIds.filter(isPatternClipId) },
        })
      );
    } else {
      dispatch(
        updateMediaSelection({
          data: { clipIds: trackClipIds.filter(isPatternClipId) },
        })
      );
    }
  },
});

export const ARRANGE_POSE_CLIPS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Create Pose",
  description: "Toggle the adding of pose clips",
  shortcut: "p",
  callback: () => dispatch(toggleAddingState({ data: "pose" })),
});

export const SELECT_POSE_CLIPS_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Select Pose Clips",
  description: "Add all pose clips to the selection",
  shortcut: "shift+p",
  callback: () => {
    const project = getProject();
    const trackId = selectSelectedTrackId(project);
    const clipIds = selectSelectedClipIds(project);
    const trackClipIds = selectTrackClipIds(project, trackId);
    if (clipIds.length) {
      dispatch(
        updateMediaSelection({
          data: { clipIds: clipIds.filter(isPoseClipId) },
        })
      );
    } else {
      dispatch(
        updateMediaSelection({
          data: { clipIds: trackClipIds.filter(isPoseClipId) },
        })
      );
    }
  },
});

export const ARRANGE_PORTALS_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Start/Stop Arranging Portals",
  description: "Toggle the portaling of media",
  shortcut: "j",
  callback: () => {
    const project = getProject();
    if (!selectHasTracks(project)) return;
    dispatch(toggleTimelineState({ data: "portaling-clips" }));
  },
});

export const SELECT_PORTALS_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Select Portals",
  description: "Add all portals to the selection",
  shortcut: "shift+u",
  callback: () => {
    const project = getProject();
    const trackId = selectSelectedTrackId(project);
    let portals = selectPortals(project);
    if (trackId) {
      portals = portals.filter((clipId) => clipId.trackId === trackId);
    }
    const portalIds = portals.map((clip) => clip.id);
    dispatch(updateMediaSelection({ data: { portalIds } }));
  },
});

export const FOREST_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Toggle Forest Mode",
  description: "Toggle the forest mode",
  shortcut: "f",
  callback: () => dispatch(toggleTimeline()),
});

export const INVERT_POSE_CLIPS_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Start/Stop Arranging Pose Clips",
  description: "Invert the vectors of the pose clips",
  shortcut: "g",
  callback: () => {
    const project = getProject();
    if (!selectHasClips(project)) return;
    const poseClips = selectSelectedPoseClips(project);
    const poseMap = selectPoseMap(project);
    const poses = poseClips
      .map((clip) => poseMap[clip.poseId])
      .filter(Boolean) as Pose[];
    const undoType = createUndoType("invert", poses);
    dispatch(
      updatePoses({
        data: poses.map((pose) => ({
          ...pose,
          vector: mapVector(pose.vector ?? {}, (_, v) => -v),
        })),
        undoType,
      })
    );
  },
});

export const SLICE_CLIPS_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Slice Patterns",
  description: "Toggle the slicing of media",
  shortcut: "k",
  callback: () => {
    const project = getProject();
    if (!selectHasClips(project)) return;
    dispatch(toggleTimelineState({ data: "slicing-clips" }));
  },
});

export const MERGE_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Tape Patterns",
  description: "Merge the selected pattern clips",
  shortcut: "alt+m",
  callback: () => dispatch(mergeSelectedMedia()),
});

// -----------------------------------------------
// Media Hotkeys
// -----------------------------------------------

export const SELECT_ALL_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Select All Media",
  description: "Select all media",
  shortcut: "meta+a",
  callback: () => dispatch(addAllMediaToSelection()),
});

export const DESELECT_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Deselect Track",
  description: "Deselect the selected track",
  shortcut: "shift+esc",
  callback: () => dispatch(setSelectedTrackId({ data: null })),
});

export const CLOSE_ALL_CLIPS_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Close / Deselect Clips",
  description: "Close any open clips, or deselect all media",
  shortcut: "esc",
  callback: () => {
    const project = getProject();
    const openedClips = selectOpenedClips(project);
    if (openedClips.length) {
      const undoType = createUndoType("close", openedClips);
      openedClips.forEach(({ id }) =>
        dispatch(toggleClipDropdown({ data: { id }, undoType }))
      );
    } else {
      dispatch(updateMediaSelection({ data: { clipIds: [], portalIds: [] } }));
    }
  },
});

export const DELETE_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Delete Selected Media",
  description: "Delete the selected media",
  shortcut: "backspace",
  callback: () => dispatch(deleteSelectedMedia()),
});

export const MOVE_LEFT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Seek to Previous Subdivision",
  description: "Move backward in the timeline",
  shortcut: "left",
  callback: () => {
    const mediaLength = selectSelectedMedia(getProject()).length;
    if (!mediaLength) dispatch(movePlayheadLeft());
  },
});

export const MOVE_RIGHT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Seek to Next Subdivision",
  description: "Move forward in the timeline",
  shortcut: "right",
  callback: () => {
    const mediaLength = selectSelectedMedia(getProject()).length;
    if (!mediaLength) dispatch(movePlayheadRight());
  },
});

export const SCRUB_LEFT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Scrub to Previous Subdivision",
  description: "Scrub backward in the timeline",
  shortcut: "shift+left",
  callback: () => {
    const mediaLength = selectSelectedMedia(getProject()).length;
    if (!mediaLength) dispatch(movePlayheadLeft(1));
  },
});

export const SCRUB_RIGHT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Scrub to Next Subdivision",
  description: "Scrub forward in the timeline",
  shortcut: "shift+right",
  callback: () => {
    const mediaLength = selectSelectedMedia(getProject()).length;
    if (!mediaLength) dispatch(movePlayheadRight(1));
  },
});

export const MOVE_MEDIA_LEFT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Move Selected Media Left",
  description: "Move the selected media left",
  shortcut: "left",
  callback: () => dispatch(moveSelectedMediaLeft()),
});

export const MOVE_MEDIA_RIGHT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Move Selected Media Right",
  description: "Move the selected media right",
  shortcut: "right",
  callback: () => dispatch(moveSelectedMediaRight()),
});

export const SCRUB_MEDIA_LEFT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Scrub Selected Media Left",
  description: "Scrub the selected media left",
  shortcut: "shift+left",
  callback: () => {
    dispatch(moveSelectedMediaLeft(1));
  },
});

export const SCRUB_MEDIA_RIGHT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Scrub Selected Media Right",
  description: "Scrub the selected media right",
  shortcut: "shift+right",
  callback: () => {
    dispatch(moveSelectedMediaRight(1));
  },
});

export const TOGGLE_LIVE_PLAY_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Water Tree",
  description: "Activate live play and quickstart a project",
  shortcut: "n",
  callback: () => dispatch(toggleLivePlay()),
});

// -----------------------------------------------
// Clipboard Hotkeys
// -----------------------------------------------

export const COPY_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Copy Selected Media",
  description: "Copy the selected media",
  shortcut: "meta+c",
  callback: () => dispatch(copySelectedMedia()),
});

export const PASTE_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Paste Selected Media",
  description: "Paste the copied media",
  shortcut: "meta+v",
  callback: () => dispatch(pasteSelectedMedia()),
});

export const CUT_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Cut Selected Media",
  description: "Cut the selected media",
  shortcut: "meta+x",
  callback: () => dispatch(cutSelectedMedia()),
});

export const DUPLICATE_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Duplicate Selected Media",
  description: "Duplicate the selected media",
  shortcut: "meta+d",
  callback: () => dispatch(duplicateSelectedMedia()),
});

export const EXPORT_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Export Selection to MIDI",
  description: "Export the selected clips to a MIDI file",
  shortcut: "meta+alt+m",
  callback: () => dispatch(exportSelectedClipsToMIDI()),
});

export const INPUT_POSE_VECTOR_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Generate a Pose Vector",
  description: "Update all selected poses with the inputted vector.",
  shortcut: "meta+alt+v",
  callback: () => dispatch(inputPoseVector()),
});

export const INPUT_ROMAN_NUMERAL_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Input Roman Numerals",
  description: "Create poses based on the input roman numerals",
  shortcut: "g",
  callback: promptUserForString({
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
      const baseTick = patternClip?.tick ?? getTransport().ticks;
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
  }),
});

export const promptRomanNumerals =
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
        const baseTick = patternClip?.tick ?? getTransport().ticks;
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
          const newPattern = { tick, trackId: patternClip.trackId };
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
                data: { pattern, clip: newPattern },
                undoType,
              })
            );
          }
          dispatch(createCourtesyPoseClip({ data: { pose, clip }, undoType }));
        }
      },
    })();
  };
