import { Hotkey, useDispatchedHotkey } from "lib/react-hotkeys-hook";
import {
  clearTimelineState,
  decreaseSubdivision,
  increaseSubdivision,
  setSelectedTrackId,
  updateMediaSelection,
  updateTimelineTick,
} from "types/Timeline/TimelineSlice";
import {
  selectSelectedMedia,
  selectSelectedPoseClips,
  selectSelectedTrackId,
  selectSelectedPatternClips,
  selectSelectedClipIds,
  selectSelectedClips,
  selectSelectedTrack,
  selectTimelineState,
  selectCurrentTimelineTick,
} from "types/Timeline/TimelineSelectors";
import {
  createDrumTracks,
  createRandomHierarchy,
  promptUserForScale,
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
  toggleSelectedTrackId,
} from "types/Timeline/TimelineThunks";
import {
  exportSelectedClipsToMIDI,
  deleteSelectedTrack,
  selectPreviousTrack,
  selectNextTrack,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import {
  collapseTrackDescendants,
  collapseTrackAncestors,
  collapseTracks,
} from "types/Track/TrackThunks";
import {
  movePlayheadLeft,
  movePlayheadRight,
} from "types/Transport/TransportThunks";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectTrackAncestors,
  selectTrackDescendants,
  selectTrackIds,
  selectTrackParentIdMap,
} from "types/Track/TrackSelectors";
import { promptUserForSample } from "types/Track/PatternTrack/PatternTrackThunks";
import {
  selectClipDuration,
  selectHasClips,
  selectPatternClips,
} from "types/Clip/ClipSelectors";
import { inputPoseVector } from "types/Pose/PoseThunks";
import { promptUserForTree } from "utils/tree";
import { createUndoType, Payload, unpackData } from "lib/redux";
import { updatePoses } from "types/Pose/PoseSlice";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import { Pose } from "types/Pose/PoseTypes";
import { mapVector } from "utils/vector";
import { sliceClip } from "types/Clip/ClipThunks";
import { toggleTimeline } from "types/Meta/MetaSlice";
import { promptUserForString } from "utils/html";
import { inputRomanNumerals } from "utils/roman";
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
import { noop } from "lodash";
import { updateClips } from "types/Clip/ClipSlice";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { isPatternTrack } from "types/Track/TrackTypes";

export function useTimelineHotkeys() {
  // Timeline Hotkeys
  useDispatchedHotkey(DECREASE_SUBDIVISION_HOTKEY);
  useDispatchedHotkey(INCREASE_SUBDIVISION_HOTKEY);

  // Track Hotkeys
  useDispatchedHotkey(TOGGLE_EDITOR_HOTKEY);
  useDispatchedHotkey(INPUT_SCALES_HOTKEY);
  useDispatchedHotkey(INPUT_SAMPLES_HOTKEY);
  useDispatchedHotkey(SELECT_PREVIOUS_TRACK_HOTKEY);
  useDispatchedHotkey(SELECT_NEXT_TRACK_HOTKEY);
  useDispatchedHotkey(COLLAPSE_TRACK_HOTKEY);
  useDispatchedHotkey(COLLAPSE_TRACK_PARENTS_HOTKEY);
  useDispatchedHotkey(COLLAPSE_TRACK_CHILDREN_HOTKEY);
  useDispatchedHotkey(DELETE_TRACK_HOTKEY);
  useDispatchedHotkey(SELECT_TRACK_1_HOTKEY);
  useDispatchedHotkey(SELECT_TRACK_2_HOTKEY);
  useDispatchedHotkey(SELECT_TRACK_3_HOTKEY);
  useDispatchedHotkey(SELECT_TRACK_4_HOTKEY);
  useDispatchedHotkey(SELECT_TRACK_5_HOTKEY);
  useDispatchedHotkey(SELECT_TRACK_6_HOTKEY);
  useDispatchedHotkey(SELECT_TRACK_7_HOTKEY);
  useDispatchedHotkey(SELECT_TRACK_8_HOTKEY);
  useDispatchedHotkey(SELECT_TRACK_9_HOTKEY);

  // Motif Hotkeys
  useDispatchedHotkey(CREATE_NEW_TREE_HOTKEY);
  useDispatchedHotkey(CREATE_RANDOM_TRACKS_HOTKEY);
  useDispatchedHotkey(CREATE_DRUM_TRACKS_HOTKEY);
  useDispatchedHotkey(ARRANGE_PATTERNS_HOTKEY);
  useDispatchedHotkey(ARRANGE_POSES_HOTKEY);
  useDispatchedHotkey(ARRANGE_PORTALS_HOTKEY);
  useDispatchedHotkey(SELECT_TRACK_PATTERNS_HOTKEY);
  useDispatchedHotkey(SELECT_TRACK_POSES_HOTKEY);
  useDispatchedHotkey(SELECT_PORTALS_HOTKEY);
  useDispatchedHotkey(SLICE_CLIPS_HOTKEY);
  useDispatchedHotkey(SLICE_CLIPS_IN_HALF_HOTKEY);
  useDispatchedHotkey(MERGE_MEDIA_HOTKEY);
  useDispatchedHotkey(INVERT_POSE_CLIPS_HOTKEY);
  useDispatchedHotkey(TOGGLE_FOREST_HOTKEY);

  // Media Hotkeys
  useDispatchedHotkey(SELECT_ALL_MEDIA_HOTKEY);
  useDispatchedHotkey(CLOSE_ALL_CLIPS_HOTKEY);
  useDispatchedHotkey(MOVE_LEFT_HOTKEY);
  useDispatchedHotkey(MOVE_RIGHT_HOTKEY);
  useDispatchedHotkey(SCRUB_LEFT_HOTKEY);
  useDispatchedHotkey(SCRUB_RIGHT_HOTKEY);
  useDispatchedHotkey(TOGGLE_LIVE_PLAY_HOTKEY);
  useDispatchedHotkey(DESELECT_TRACK_HOTKEY);
  useDispatchedHotkey(MOVE_CLIPS_UP_HOTKEY);
  useDispatchedHotkey(MOVE_CLIPS_DOWN_HOTKEY);

  // Clipboard Hotkeys
  useDispatchedHotkey(COPY_MEDIA_HOTKEY);
  useDispatchedHotkey(PASTE_MEDIA_HOTKEY);
  useDispatchedHotkey(CUT_MEDIA_HOTKEY);
  useDispatchedHotkey(DUPLICATE_MEDIA_HOTKEY);
  useDispatchedHotkey(DELETE_MEDIA_HOTKEY);
  useDispatchedHotkey(EXPORT_MEDIA_HOTKEY);
  useDispatchedHotkey(MOVE_CLIPS_LEFT_HOTKEY);
  useDispatchedHotkey(MOVE_CLIPS_RIGHT_HOTKEY);
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
  callback: () => dispatch(promptUserForTree),
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

export const TOGGLE_EDITOR_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Change Track Instrument",
  description: "Toggle the editor",
  shortcut: "shift+i",
  callback: () => dispatch(toggleTimelineState({ data: "editing-tracks" })),
});

export const INPUT_SCALES_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Change Track Scale",
  description: "Prompt the user to type in a new scale",
  shortcut: "shift+s",
  callback: () => {
    const trackId = selectSelectedTrackId(getProject());
    if (isScaleTrackId(trackId)) dispatch(promptUserForScale(trackId));
  },
});

export const INPUT_SAMPLES_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Upload Sample to Track",
  description: "Load a sample into the selected Sampler",
  shortcut: "meta+shift+i",
  callback: () => {
    const track = selectSelectedTrack(getProject());
    if (isPatternTrack(track))
      dispatch(promptUserForSample({ data: { track } }));
  },
});

export const SELECT_PREVIOUS_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Select Previous Track",
  description: "Select the previous track",
  shortcut: "shift+up",
  callback: () => dispatch(selectPreviousTrack()),
});

export const SELECT_NEXT_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Select Next Track",
  description: "Select the next track",
  shortcut: "shift+down",
  callback: () => dispatch(selectNextTrack()),
});

export const COLLAPSE_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Collapse / Expand Track",
  description: "Collapse/expand the selected track",
  shortcut: "shift+c",
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
  name: "Minify/Enlarge Parent Tracks",
  description: "Collapse/expand the parent tracks of the selected track",
  shortcut: "meta+shift+comma",
  callback: () => {
    const project = getProject();
    const trackId = selectSelectedTrackId(project);
    if (!trackId) return;
    const parents = selectTrackAncestors(project, trackId);
    const isParentCollapsed = parents.some((track) => track?.collapsed);
    dispatch(collapseTrackAncestors(trackId, !isParentCollapsed));
  },
});

export const COLLAPSE_TRACK_CHILDREN_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Minify/Enlarge Child Tracks",
  description: "Collapse/expand the child tracks of the selected track",
  shortcut: "alt+meta+shift+comma",
  callback: () => {
    const project = getProject();
    const trackId = selectSelectedTrackId(project);
    if (!trackId) return;
    const chain = selectTrackDescendants(project, trackId);
    const isChildCollapsed = chain.some((track) => track?.collapsed);
    dispatch(collapseTrackDescendants(trackId, !isChildCollapsed));
  },
});

export const DELETE_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Delete Selected Track",
  description: "Delete the selected track",
  shortcut: "shift+backspace",
  callback: () => dispatch(deleteSelectedTrack()),
});

// -----------------------------------------------
// Motif Hotkeys
// -----------------------------------------------

export const ARRANGE_PATTERNS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Create Pattern",
  description: "Toggle the adding of pattern clips",
  shortcut: "o",
  callback: () => dispatch(toggleAddingState({ data: "pattern" })),
});

export const ARRANGE_POSES_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Create Pose",
  description: "Toggle the adding of pose clips",
  shortcut: "p",
  callback: () => dispatch(toggleAddingState({ data: "pose" })),
});

export const SELECT_TRACK_PATTERNS_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Filter Pattern Clips",
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

export const SELECT_TRACK_POSES_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Filter Pose Clips",
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
  name: "Create Portal",
  description: "Toggle the portaling of media",
  shortcut: "j",
  callback: () => {
    const project = getProject();
    if (!selectHasTracks(project)) return;
    dispatch(toggleTimelineState({ data: "portaling-clips" }));
  },
});

export const SELECT_PORTALS_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Filter Portals",
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

export const TOGGLE_FOREST_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Toggle Forest",
  description: "Toggle the forest mode",
  shortcut: "shift+f",
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
  name: "Slice Pattern",
  description: "Toggle the slicing of media",
  shortcut: "k",
  callback: () => {
    const project = getProject();
    if (!selectHasClips(project)) return;
    dispatch(toggleTimelineState({ data: "slicing-clips" }));
  },
});

export const SLICE_CLIPS_IN_HALF_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Slice Selected Clips",
  description: "Slice all selected clips in half",
  shortcut: "shift+k",
  callback: () => {
    const project = getProject();
    if (!selectHasClips(project)) return;
    const selectedClips = selectSelectedPatternClips(project);
    const undoType = createUndoType("slice", selectedClips);
    for (const clip of selectedClips) {
      const duration = selectClipDuration(project, clip.id);
      if (clip.duration === 0) continue;
      const tick = Math.round(clip.tick + duration / 2);
      if (tick === clip.tick || tick === clip.tick + duration) continue;
      dispatch(sliceClip({ data: { id: clip.id, tick }, undoType }));
    }
  },
});

export const MERGE_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Merge Selected Patterns",
  description: "Merge the selected pattern clips",
  shortcut: "shift+j",
  callback: () => dispatch(mergeSelectedMedia()),
});

// -----------------------------------------------
// Media Hotkeys
// -----------------------------------------------

export const SELECT_ALL_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Select All Clips",
  description: "Select all media",
  shortcut: "meta+a",
  callback: () => dispatch(addAllMediaToSelection()),
});

export const SELECT_TRACK_HOTKEY: Thunk<Hotkey> = () => ({
  name: "Select Track",
  description: "Select the selected track",
  shortcut: "shift+[1-9]",
  callback: noop,
});

export const SELECT_TRACK_1_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Select Track 1",
  description: "Select the first track",
  shortcut: "shift+1",
  callback: () => {
    dispatch(toggleSelectedTrackId({ data: selectTrackIds(getProject())[0] }));
  },
});

export const SELECT_TRACK_2_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Select Track 2",
  description: "Select the second track",
  shortcut: "shift+2",
  callback: () => {
    dispatch(toggleSelectedTrackId({ data: selectTrackIds(getProject())[1] }));
  },
});

export const SELECT_TRACK_3_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Select Track 3",
  description: "Select the third track",
  shortcut: "shift+3",
  callback: () => {
    dispatch(toggleSelectedTrackId({ data: selectTrackIds(getProject())[2] }));
  },
});

export const SELECT_TRACK_4_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Select Track 4",
  description: "Select the fourth track",
  shortcut: "shift+4",
  callback: () => {
    dispatch(toggleSelectedTrackId({ data: selectTrackIds(getProject())[3] }));
  },
});

export const SELECT_TRACK_5_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Select Track 5",
  description: "Select the fifth track",
  shortcut: "shift+5",
  callback: () => {
    dispatch(toggleSelectedTrackId({ data: selectTrackIds(getProject())[4] }));
  },
});

export const SELECT_TRACK_6_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Select Track 6",
  description: "Select the sixth track",
  shortcut: "shift+6",
  callback: () => {
    dispatch(toggleSelectedTrackId({ data: selectTrackIds(getProject())[5] }));
  },
});

export const SELECT_TRACK_7_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Select Track 7",
  description: "Select the seventh track",
  shortcut: "shift+7",
  callback: () => {
    dispatch(toggleSelectedTrackId({ data: selectTrackIds(getProject())[6] }));
  },
});

export const SELECT_TRACK_8_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Select Track 8",
  description: "Select the eighth track",
  shortcut: "shift+8",
  callback: () => {
    dispatch(toggleSelectedTrackId({ data: selectTrackIds(getProject())[7] }));
  },
});

export const SELECT_TRACK_9_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Select Track 9",
  description: "Select the ninth track",
  shortcut: "shift+9",
  callback: () => {
    dispatch(toggleSelectedTrackId({ data: selectTrackIds(getProject())[8] }));
  },
});

export const DESELECT_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Deselect Track",
  description: "Deselect the selected track",
  shortcut: "shift+esc",
  callback: () => {
    const undoType = createUndoType("deselectTrack", nanoid());
    dispatch(setSelectedTrackId({ data: null, undoType }));
    dispatch(updateTimelineTick({ data: 0, undoType }));
  },
});

export const CLOSE_ALL_CLIPS_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Deselect All Clips",
  description: "Close any open clips, or deselect all media",
  shortcut: "esc",
  callback: () => {
    const project = getProject();
    const state = selectTimelineState(project);
    if (state !== "idle") {
      dispatch(clearTimelineState());
      return;
    }
    dispatch(updateMediaSelection({ data: { clipIds: [], portalIds: [] } }));
  },
});

export const DELETE_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Delete Selected Clips",
  description: "Delete the selected clips",
  shortcut: "backspace",
  callback: () => dispatch(deleteSelectedMedia()),
});

export const MOVE_LEFT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Seek to Previous Subdivision",
  description: "Move backward in the timeline",
  shortcut: "left",
  callback: () => {
    const mediaLength = selectSelectedMedia(getProject()).length;
    if (!mediaLength) dispatch(movePlayheadLeft(2));
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

export const MOVE_CLIPS_UP_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Move Selected Clips Up",
  description: "Move the selected media up",
  shortcut: "up",
  callback: () => {
    const clips = selectSelectedClips(getProject());
    const trackIds = selectTrackIds(getProject());
    const undoType = createUndoType("moveClipsUp", nanoid());
    for (const clip of clips) {
      const newTrackId = trackIds[trackIds.indexOf(clip.trackId) - 1];
      if (newTrackId) {
        const data = [{ id: clip.id, trackId: newTrackId }];
        dispatch(updateClips({ data, undoType }));
      }
    }
  },
});

export const MOVE_CLIPS_DOWN_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Move Selected Clips Down",
  description: "Move the selected media down",
  shortcut: "down",
  callback: () => {
    const clips = selectSelectedClips(getProject());
    const trackIds = selectTrackIds(getProject());
    const undoType = createUndoType("moveClipsDown", nanoid());
    for (const clip of clips) {
      const newTrackId = trackIds[trackIds.indexOf(clip.trackId) + 1];
      if (newTrackId) {
        const data = [{ id: clip.id, trackId: newTrackId }];
        dispatch(updateClips({ data, undoType }));
      }
    }
  },
});

export const SCRUB_LEFT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Scrub to Previous Tick",
  description: "Scrub backward in the timeline",
  shortcut: "shift+left",
  callback: () => {
    const mediaLength = selectSelectedMedia(getProject()).length;
    if (!mediaLength) dispatch(movePlayheadLeft(1));
  },
});

export const SCRUB_RIGHT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Scrub to Next Tick",
  description: "Scrub forward in the timeline",
  shortcut: "shift+right",
  callback: () => {
    const mediaLength = selectSelectedMedia(getProject()).length;
    if (!mediaLength) dispatch(movePlayheadRight(1));
  },
});

export const MOVE_CLIPS_LEFT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Move Selected Clips Left",
  description: "Move the selected media left",
  shortcut: "left",
  callback: () => dispatch(moveSelectedMediaLeft()),
});

export const MOVE_CLIPS_RIGHT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Move Selected Clips Right",
  description: "Move the selected media right",
  shortcut: "right",
  callback: () => dispatch(moveSelectedMediaRight()),
});

export const SCRUB_MEDIA_LEFT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Scrub Selected Clips Left",
  description: "Scrub the selected media left",
  shortcut: "shift+left",
  callback: () => {
    dispatch(moveSelectedMediaLeft(1));
  },
});

export const SCRUB_MEDIA_RIGHT_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Scrub Selected Clips Right",
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
  name: "Copy Selected Clips",
  description: "Copy the selected media",
  shortcut: "meta+c",
  callback: () => dispatch(copySelectedMedia()),
});

export const PASTE_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Paste From Clipboard",
  description: "Paste the copied media",
  shortcut: "meta+v",
  callback: () => dispatch(pasteSelectedMedia()),
});

export const CUT_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Cut Selected Clips",
  description: "Cut the selected media",
  shortcut: "meta+x",
  callback: () => dispatch(cutSelectedMedia()),
});

export const DUPLICATE_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Duplicate Selected Clips",
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
