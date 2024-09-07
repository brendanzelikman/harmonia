import { useProjectDispatch } from "types/hooks";
import { Hotkey, useHotkeysInTimeline } from "lib/react-hotkeys-hook";
import { DataGridHandle } from "react-data-grid";
import { useAuth } from "providers/auth";
import { isPatternTrack, isScaleTrack } from "types/Track/TrackTypes";
import {
  setSelectedTrackId,
  decreaseSubdivision,
  increaseSubdivision,
  updateMediaSelection,
} from "types/Timeline/TimelineSlice";
import {
  selectSelectedTrack,
  selectSelectedMedia,
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
import { exportProjectToMIDI } from "types/Project/ProjectExporters";
import {
  toggleTimelineType,
  createTypedMotif,
  toggleTimelineState,
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
  downloadTransport,
  movePlayheadLeft,
  movePlayheadRight,
} from "types/Transport/TransportThunks";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectTrackChain,
  selectTrackChildren,
} from "types/Track/TrackSelectors";
import { setupFileInput } from "providers/idb/samples";

export function useTimelineHotkeys(timeline?: DataGridHandle) {
  const dispatch = useProjectDispatch();

  // Timeline Hotkeys
  useHotkeysInTimeline(dispatch(DECREASE_SUBDIVISION_HOTKEY));
  useHotkeysInTimeline(dispatch(INCREASE_SUBDIVISION_HOTKEY));
  useHotkeysInTimeline(dispatch(RESET_SCROLL_HOTKEY(timeline?.element)));
  useHotkeysInTimeline(dispatch(EXPORT_MIDI_HOTKEY));
  useHotkeysInTimeline(dispatch(EXPORT_AUDIO_HOTKEY));

  // Track Hotkeys
  useHotkeysInTimeline(dispatch(CREATE_SCALE_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(CREATE_PATTERN_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(INSERT_PARENT_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(LOAD_SAMPLES_HOTKEY));
  useHotkeysInTimeline(dispatch(SELECT_PREVIOUS_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(SELECT_NEXT_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(DESELECT_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(COLLAPSE_TRACK_HOTKEY));
  useHotkeysInTimeline(dispatch(COLLAPSE_TRACK_FAMILY_HOTKEY));
  useHotkeysInTimeline(dispatch(DELETE_TRACK_HOTKEY));

  // Motif Hotkeys
  useHotkeysInTimeline(dispatch(CREATE_NEW_MOTIF_HOTKEY));
  useHotkeysInTimeline(dispatch(TOGGLE_MOTIF_HOTKEY));
  useHotkeysInTimeline(dispatch(TOGGLE_ADDING_CLIP_HOTKEY));
  useHotkeysInTimeline(dispatch(TOGGLE_SLICING_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(TOGGLE_PORTALING_MEDIA_HOTKEY));

  // Media Hotkeys
  useHotkeysInTimeline(dispatch(SELECT_ALL_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(DESELECT_ALL_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(MOVE_LEFT_HOTKEY));
  useHotkeysInTimeline(dispatch(MOVE_RIGHT_HOTKEY));
  useHotkeysInTimeline(dispatch(SCRUB_LEFT_HOTKEY));
  useHotkeysInTimeline(dispatch(SCRUB_RIGHT_HOTKEY));

  // Clipboard Hotkeys
  useHotkeysInTimeline(dispatch(COPY_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(PASTE_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(CUT_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(DUPLICATE_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(DELETE_MEDIA_HOTKEY));
  useHotkeysInTimeline(dispatch(EXPORT_MEDIA_HOTKEY));
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

export const EXPORT_MIDI_HOTKEY: Thunk<Hotkey> = (dispatch) => {
  const { isProdigy } = useAuth();
  return {
    name: "Export to MIDI",
    description: "Export the timeline to a MIDI file",
    shortcut: "meta+alt+m",
    callback: () => !isProdigy && dispatch(exportProjectToMIDI()),
  };
};

export const EXPORT_AUDIO_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Export to WAV",
  description: "Export the timeline to a WAV file",
  shortcut: "meta+alt+w",
  callback: () => dispatch(downloadTransport()),
});

// -----------------------------------------------
// Track Hotkeys
// -----------------------------------------------

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
  shortcut: "l",
  callback: () => {
    const project = getProject();
    const track = selectSelectedTrack(project);
    if (!isPatternTrack(track)) return;
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
  name: "Collapse Selected Track",
  description: "Collapse the selected track",
  shortcut: "m",
  callback: () => {
    const selectedTrack = selectSelectedTrack(getProject());
    if (!selectedTrack) return;
    const collapsed = !selectedTrack?.collapsed;
    dispatch(updateTrack({ data: { ...selectedTrack, collapsed } }));
  },
});

export const COLLAPSE_TRACK_FAMILY_HOTKEY: Thunk<Hotkey> = (
  dispatch,
  getProject
) => {
  const project = getProject();
  const track = selectSelectedTrack(project);
  const isPatternTrack = track?.type === "pattern";
  if (isPatternTrack) {
    const isParentCollapsed = selectTrackChain(project, track?.id).some(
      (track) => track?.collapsed
    );
    return {
      name: "Collapse Parent Tracks",
      description: "Collapse the parent tracks of the selected track",
      shortcut: "shift+m",
      callback: () => {
        if (!track) return;
        dispatch(collapseTrackParents(track.id, !isParentCollapsed));
      },
    };
  } else {
    const isChildCollapsed = selectTrackChildren(project, track?.id).some(
      (track) => track?.collapsed
    );
    return {
      name: "Collapse Track Family",
      description: "Collapse the selected track and its children",
      shortcut: "shift+m",
      callback: () => {
        if (!track) return;
        dispatch(collapseTrackChildren(track.id, !isChildCollapsed));
      },
    };
  }
};

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
  name: "Toggle Timeline Type",
  description: "Toggle the currently selected motif",
  shortcut: "c",
  callback: () => dispatch(toggleTimelineType()),
});

export const TOGGLE_ADDING_CLIP_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Toggle Adding Clip",
  description: "Toggle the adding of clips",
  shortcut: "a",
  callback: () => dispatch(toggleTimelineState({ data: "adding-clips" })),
});

export const TOGGLE_SLICING_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Toggle Slicing Media",
  description: "Toggle the slicing of media",
  shortcut: "k",
  callback: () => dispatch(toggleTimelineState({ data: "slicing-clips" })),
});

export const TOGGLE_PORTALING_MEDIA_HOTKEY: Thunk<Hotkey> = (dispatch) => ({
  name: "Toggle Portaling Media",
  description: "Toggle the portaling of media",
  shortcut: "p",
  callback: () => dispatch(toggleTimelineState({ data: "portaling-clips" })),
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
  name: "Move Selected Media Left",
  description: "Move the selected media left",
  shortcut: "left",
  callback: () => {
    const mediaLength = selectSelectedMedia(getProject()).length;
    if (mediaLength) {
      dispatch(moveSelectedMediaLeft());
    } else {
      dispatch(movePlayheadLeft());
    }
  },
});

export const MOVE_RIGHT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Move Selected Media Right",
  description: "Move the selected media right",
  shortcut: "right",
  callback: () => {
    const mediaLength = selectSelectedMedia(getProject()).length;
    if (mediaLength) {
      dispatch(moveSelectedMediaRight());
    } else {
      dispatch(movePlayheadRight());
    }
  },
});

export const SCRUB_LEFT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Scrub Selected Media Left",
  description: "Scrub the selected media left",
  shortcut: "shift+left",
  callback: () => {
    const mediaLength = selectSelectedMedia(getProject()).length;
    if (mediaLength) {
      dispatch(moveSelectedMediaLeft(1));
    } else {
      dispatch(movePlayheadLeft(1));
    }
  },
});

export const SCRUB_RIGHT_HOTKEY: Thunk<Hotkey> = (dispatch, getProject) => ({
  name: "Scrub Selected Media Right",
  description: "Scrub the selected media right",
  shortcut: "shift+right",
  callback: () => {
    const mediaLength = selectSelectedMedia(getProject()).length;
    if (mediaLength) {
      dispatch(moveSelectedMediaRight(1));
    } else {
      dispatch(movePlayheadRight(1));
    }
  },
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
  shortcut: "meta+shift+m",
  callback: () => dispatch(exportSelectedClipsToMIDI()),
});
