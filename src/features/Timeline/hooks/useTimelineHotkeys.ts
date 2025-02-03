import { useProjectDispatch } from "types/hooks";
import { Hotkey, useHotkeysInTimeline } from "lib/react-hotkeys-hook";
import { isScaleTrack } from "types/Track/TrackTypes";
import {
  setSelectedTrackId,
  decreaseSubdivision,
  increaseSubdivision,
  updateMediaSelection,
} from "types/Timeline/TimelineSlice";
import {
  selectSelectedTrack,
  selectSelectedMedia,
  selectIsLive,
  selectSelectedPatternTrack,
} from "types/Timeline/TimelineSelectors";
import { createPatternTrackFromSelectedTrack } from "types/Track/PatternTrack/PatternTrackThunks";
import { createScaleTrack } from "types/Track/ScaleTrack/ScaleTrackThunks";
import {
  addAllMediaToSelection,
  copySelectedMedia,
  pasteSelectedMedia,
  cutSelectedMedia,
  duplicateSelectedMedia,
  deleteSelectedMedia,
  moveSelectedMediaLeft,
  moveSelectedMediaRight,
} from "types/Media/MediaThunks";
import {
  toggleTimelineType,
  createTypedMotif,
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
  insertScaleTrack,
  updateTrack,
} from "types/Track/TrackThunks";
import {
  movePlayheadLeft,
  movePlayheadRight,
  seekTransport,
} from "types/Transport/TransportThunks";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectTrackAncestors,
  selectTrackChildren,
} from "types/Track/TrackSelectors";
import { setupFileInput } from "providers/idb/samples";
import { selectHasClips } from "types/Clip/ClipSelectors";
import { inputPoseVector } from "types/Pose/PoseThunks";
import { selectTransportLoopStart } from "types/Transport/TransportSelectors";
import { createNewTracks } from "types/Track/TrackUtils";

export function useTimelineHotkeys() {
  const dispatch = useProjectDispatch();

  // Timeline Hotkeys
  useHotkeysInTimeline(dispatch(DECREASE_SUBDIVISION_HOTKEY));
  useHotkeysInTimeline(dispatch(INCREASE_SUBDIVISION_HOTKEY));
  useHotkeysInTimeline(dispatch(RESET_TRANSPORT_HOTKEY));
  // useHotkeysInTimeline(dispatch(RESET_SCROLL_HOTKEY(element)));

  // Track Hotkeys
  useHotkeysInTimeline(dispatch(CREATE_SCALE_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(CREATE_PATTERN_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(INSERT_PARENT_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(LOAD_SAMPLES_HOTKEY));
  useHotkeysInTimeline(dispatch(SELECT_PREVIOUS_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(SELECT_NEXT_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(DESELECT_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(COLLAPSE_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(COLLAPSE_TRACK_PARENTS_HOTKEY));
  useHotkeysInTimeline(dispatch(COLLAPSE_TRACK_CHILDREN_HOTKEY));
  useHotkeysInTimeline(dispatch(DELETE_TRACK_HOTKEY));

  // Motif Hotkeys
  useHotkeysInTimeline(dispatch(CREATE_NEW_TRACKS_HOTKEY));
  useHotkeysInTimeline(dispatch(CREATE_NEW_MOTIF_HOTKEY));
  useHotkeysInTimeline(dispatch(TOGGLE_MOTIF_HOTKEY));
  useHotkeysInTimeline(dispatch(ARRANGE_CLIPS_HOTKEY));
  useHotkeysInTimeline(dispatch(ARRANGE_PATTERN_CLIPS_HOTKEY));
  useHotkeysInTimeline(dispatch(ARRANGE_POSE_CLIPS_HOTKEY));
  useHotkeysInTimeline(dispatch(ARRANGE_SCALE_CLIPS_HOTKEY));
  useHotkeysInTimeline(dispatch(SLICE_CLIPS_HOTKEY));
  useHotkeysInTimeline(dispatch(ARRANGE_PORTALS_HOTKEY));

  // Media Hotkeys
  useHotkeysInTimeline(dispatch(SELECT_ALL_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(DESELECT_ALL_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(MOVE_LEFT_HOTKEY));
  useHotkeysInTimeline(dispatch(MOVE_RIGHT_HOTKEY));
  useHotkeysInTimeline(dispatch(SCRUB_LEFT_HOTKEY));
  useHotkeysInTimeline(dispatch(SCRUB_RIGHT_HOTKEY));
  useHotkeysInTimeline(dispatch(TOGGLE_LIVE_PLAY_HOTKEY));

  // Clipboard Hotkeys
  useHotkeysInTimeline(dispatch(COPY_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(PASTE_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(CUT_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(DUPLICATE_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(DELETE_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(EXPORT_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(MOVE_MEDIA_LEFT_HOTKEY));
  useHotkeysInTimeline(dispatch(MOVE_MEDIA_RIGHT_HOTKEY));
  useHotkeysInTimeline(dispatch(SCRUB_MEDIA_LEFT_HOTKEY));
  useHotkeysInTimeline(dispatch(SCRUB_MEDIA_RIGHT_HOTKEY));
  useHotkeysInTimeline(dispatch(INPUT_POSE_VECTOR_HOTKEY));
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

export const RESET_TRANSPORT_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Reset Transport",
  description: "Reset the transport to the beginning",
  shortcut: "x",
  callback: () =>
    dispatch(seekTransport({ data: selectTransportLoopStart(getProject()) })),
});

// -----------------------------------------------
// Track Hotkeys
// -----------------------------------------------

export const CREATE_NEW_TRACKS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Create New Tracks",
  description: "Create New Tracks",
  shortcut: "n",
  callback: () => dispatch(createNewTracks),
});

export const CREATE_SCALE_TRACK_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Create Scale Track",
  description: "Create a Scale Track",
  shortcut: "shift+s",
  callback: () => {
    const selectedTrack = selectSelectedTrack(getProject());
    const parentId = isScaleTrack(selectedTrack)
      ? selectedTrack?.id
      : undefined;
    dispatch(createScaleTrack({ parentId }));
  },
});

export const CREATE_PATTERN_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Create Pattern Track",
  description: "Create a Pattern Track",
  shortcut: "shift+p",
  callback: () => dispatch(createPatternTrackFromSelectedTrack()),
});

export const INSERT_PARENT_TRACK_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => ({
  name: "Insert Parent Scale Track",
  description: "Create a parent for the selected track",
  shortcut: "meta+shift+s",
  callback: () => {
    const selectedTrack = selectSelectedTrack(getProject());
    dispatch(insertScaleTrack(selectedTrack?.id));
  },
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

export const DESELECT_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Clear Track Selection",
  description: "Deselect the selected track",
  shortcut: "esc",
  callback: () => dispatch(setSelectedTrackId({ data: null })),
});

export const COLLAPSE_TRACK_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Collapse/Expand Track",
  description: "Collapse/expand the selected track",
  shortcut: "comma",
  callback: () => {
    const project = getProject();
    const isLive = selectIsLive(project);
    const selectedTrack = selectSelectedTrack(project);
    if (!selectedTrack || isLive) return;
    const collapsed = !selectedTrack?.collapsed;
    dispatch(updateTrack({ data: { ...selectedTrack, collapsed } }));
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
    const track = selectSelectedTrack(project);
    const isLive = selectIsLive(project);
    if (!track || isLive) return;
    const parents = selectTrackAncestors(project, track.id);
    const isParentCollapsed = parents.some((track) => track?.collapsed);
    dispatch(collapseTrackParents(track.id, !isParentCollapsed));
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
    const track = selectSelectedTrack(project);
    const isLive = selectIsLive(project);
    if (!track || isLive) return;
    const chain = selectTrackChildren(project, track.id);
    const isChildCollapsed = chain.some((track) => track?.collapsed);
    dispatch(collapseTrackChildren(track.id, !isChildCollapsed));
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

export const CREATE_NEW_MOTIF_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Create New Motif",
  description: "Create a new motif",
  shortcut: "shift+equal",
  callback: () => dispatch(createTypedMotif()),
});

export const TOGGLE_MOTIF_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Toggle Motif Type",
  description: "Toggle the currently selected motif",
  shortcut: "c",
  callback: () => dispatch(toggleTimelineType()),
});

export const ARRANGE_CLIPS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Start/Stop Arranging Clips",
  description: "Toggle the adding of clips",
  shortcut: "a",
  callback: () => dispatch(toggleTimelineState({ data: "adding-clips" })),
});

export const ARRANGE_PATTERN_CLIPS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Start/Stop Arranging Pattern Clips",
  description: "Toggle the adding of pattern clips",
  shortcut: "v",
  callback: () => dispatch(toggleAddingState({ data: "pattern" })),
});

export const ARRANGE_SCALE_CLIPS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Start/Stop Arranging Scale Clips",
  description: "Toggle the adding of scale clips",
  shortcut: "b",
  callback: () => dispatch(toggleAddingState({ data: "scale" })),
});

export const ARRANGE_POSE_CLIPS_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Start/Stop Arranging Pose Clips",
  description: "Toggle the adding of pose clips",
  shortcut: "n",
  callback: () => dispatch(toggleAddingState({ data: "pose" })),
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
    if (selectIsLive(project) || !selectHasClips(project)) return;
    dispatch(toggleTimelineState({ data: "portaling-clips" }));
  },
});

export const SLICE_CLIPS_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Start/Stop Slicing Clips",
  description: "Toggle the slicing of media",
  shortcut: "k",
  callback: () => {
    const project = getProject();
    if (selectIsLive(project) || !selectHasClips(project)) return;
    dispatch(toggleTimelineState({ data: "slicing-clips" }));
  },
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

export const DESELECT_ALL_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Clear Media Selection",
  description: "Deselect all media",
  shortcut: "esc",
  callback: () =>
    dispatch(updateMediaSelection({ data: { clipIds: [], portalIds: [] } })),
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
  name: "Toggle Live Play",
  description: "Activate live play and quickstart a project",
  shortcut: "p",
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
