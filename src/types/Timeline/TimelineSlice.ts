import { clamp } from "lodash";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MAX_CELL_HEIGHT,
  MAX_CELL_WIDTH,
  MIN_CELL_HEIGHT,
  MIN_CELL_WIDTH,
} from "utils/constants";
import { Subdivision } from "utils/duration";
import { ClipType } from "types/Clip/ClipTypes";
import { TrackId } from "types/Track/TrackTypes";
import {
  TimelineState,
  defaultTimeline,
  defaultTimelineSelection,
} from "./TimelineTypes";
import {
  MediaSelection,
  MediaClipboard,
  defaultMediaClipboard,
  defaultMediaSelection,
} from "types/Media/MediaTypes";
import { Action, unpackAction } from "types/redux";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";
import { Portal } from "types/Portal/PortalTypes";
import { Pattern } from "types/Pattern/PatternTypes";
import { Pose } from "types/Pose/PoseTypes";

// ------------------------------------------------------------
// Timeline Slice Definition
// ------------------------------------------------------------

export const timelineSlice = createSlice({
  name: "timeline",
  initialState: defaultTimeline,
  reducers: {
    /** Set the timeline state. */
    setTimelineState: (state, action: Action<TimelineState>) => {
      const timelineState = unpackAction(action);
      state.state = timelineState;
    },
    /** Clear the timeline state. */
    clearTimelineState: (state, _: Action<null>) => {
      state.state = "idle";
    },
    /** Set the timeline type. */
    setTimelineType: (state, action: Action<ClipType>) => {
      state.type = unpackAction(action);
    },
    /** Set the width of a timeline cell. */
    setCellWidth(state, action: PayloadAction<number>) {
      state.cellWidth = clamp(action.payload, MIN_CELL_WIDTH, MAX_CELL_WIDTH);
    },
    /** Set the height of a timeline cell. */
    setCellHeight(state, action: PayloadAction<number>) {
      state.cellHeight = clamp(
        action.payload,
        MIN_CELL_HEIGHT,
        MAX_CELL_HEIGHT
      );
    },
    /** Set the subdivision of the timeline. */
    setSubdivision(state, action: PayloadAction<Subdivision>) {
      state.subdivision = action.payload;
    },
    /** Increase the subdivision of the timeline. */
    increaseSubdivision(state, _: Action<null>) {
      if (!state.subdivision) {
        state.subdivision = defaultTimeline.subdivision;
        return;
      }
      if (state.subdivision.includes("64")) return;
      const match = state.subdivision.match(/\d+/);
      if (!match) return;
      const oldValue = parseInt(match[0]);
      const newValue = Math.min(oldValue * 2, 64);
      const newSubdivision = state.subdivision.replace(/\d+/, `${newValue}`);
      state.subdivision = newSubdivision as Subdivision;
    },
    /** Decrease the subdivision of the timeline. */
    decreaseSubdivision(state, _: Action<null>) {
      if (!state.subdivision) {
        state.subdivision = defaultTimeline.subdivision;
        return;
      }
      if (state.subdivision.includes("1") && !state.subdivision.includes("16"))
        return;
      const match = state.subdivision.match(/\d+/);
      if (!match) return;
      const oldValue = parseInt(match[0]);
      const newValue = Math.max(oldValue / 2, 1);
      const newSubdivision = state.subdivision.replace(/\d+/, `${newValue}`);
      state.subdivision = newSubdivision as Subdivision;
    },
    /** Set the selected track ID. */
    setSelectedTrackId: (state, action: Action<TrackId | null | undefined>) => {
      if (!state.selection) state.selection = defaultTimelineSelection;
      const data = unpackAction(action);
      const isPT = isPatternTrackId(data);
      const isST = isScaleTrackId(data);
      if (isPT || (isST && state.state !== "editing-tracks")) {
        state.selection.trackId = data;
      } else if (!data) state.selection.trackId = undefined;
    },
    /** Update the media clipboard. */
    updateClipboard: (
      state,
      action: PayloadAction<Partial<MediaClipboard>>
    ) => {
      if (!state.clipboard) state.clipboard = defaultMediaClipboard;
      const { clips, portals } = action.payload;
      if (clips) {
        state.clipboard.clips = clips;
      }
      if (portals) {
        state.clipboard.portals = portals;
      }
    },
    /** Update the media draft. */
    updateFragment: (state, action: Action<Partial<Portal>>) => {
      const portal = unpackAction(action);
      state.fragment = portal;
    },
    /** Update the timeline tick. */
    updateTimelineTick: (state, action: Action<number | null>) => {
      const tick = unpackAction<number | null>(action);
      state.tick = tick;
    },
    /** Update the media selection. */
    updateMediaSelection: (state, action: Action<Partial<MediaSelection>>) => {
      if (!state.selection) state.selection = defaultMediaSelection;
      const { clipIds, portalIds } = unpackAction(action);
      if (clipIds) {
        state.selection.clipIds = clipIds;
      }
      if (portalIds) {
        state.selection.portalIds = portalIds;
      }
    },
    /** Add a pattern to storage by index */
    addPatternToStorage: (
      state,
      action: Action<{ index: number; pattern: Pattern | null | undefined }>
    ) => {
      const { index, pattern } = unpackAction(action);
      if (!state.storage) state.storage = defaultTimeline.storage;
      if (index < 0 || index >= state.storage.patterns.length) return;
      state.storage.patterns[index] = pattern;
    },
    /** Add a pose to storage by index */
    addPoseToStorage: (
      state,
      action: Action<{ index: number; pose: Pose | null | undefined }>
    ) => {
      const { index, pose } = unpackAction(action);
      if (!state.storage) state.storage = defaultTimeline.storage;
      if (index < 0 || index >= state.storage.poses.length) return;
      state.storage.poses[index] = pose;
    },
    /** Remove a pattern from storage by index */
    removePatternFromStorage: (state, action: Action<number>) => {
      const index = unpackAction(action);
      if (!state.storage) state.storage = defaultTimeline.storage;
      if (index < 0 || index >= state.storage.patterns.length) return;
      state.storage.patterns[index] = null;
    },
    /** Remove a pose from storage by index */
    removePoseFromStorage: (state, action: Action<number>) => {
      const index = unpackAction(action);
      if (!state.storage) state.storage = defaultTimeline.storage;
      if (index < 0 || index >= state.storage.poses.length) return;
      state.storage.poses[index] = null;
    },
    /** Clear all patterns from storage */
    clearPatternStorage: (state, _: Action<null>) => {
      if (!state.storage) state.storage = defaultTimeline.storage;
      state.storage.patterns = new Array(state.storage.patterns.length).fill(
        null
      );
    },
    /** Clear all poses from storage */
    clearPoseStorage: (state, _: Action<null>) => {
      if (!state.storage) state.storage = defaultTimeline.storage;
      state.storage.poses = new Array(state.storage.poses.length).fill(null);
    },
  },
});

export const privateTimelineActions = [
  "timeline/clearTimelineState",
  "timeline/setTimelineType",
  "timeline/setSelectedTrackId",
  "timeline/updateMediaSelection",
  "timeline/updateClipboard",
  "timeline/updateFragment",
  "timeline/updateTimelineTick",
];

export const {
  setTimelineState,
  clearTimelineState,
  setTimelineType,
  setCellWidth,
  setCellHeight,
  setSubdivision,
  increaseSubdivision,
  decreaseSubdivision,
  setSelectedTrackId,
  updateMediaSelection,
  updateClipboard,
  updateFragment,
  updateTimelineTick,
  addPatternToStorage,
  addPoseToStorage,
  removePatternFromStorage,
  removePoseFromStorage,
  clearPatternStorage,
  clearPoseStorage,
} = timelineSlice.actions;

export default timelineSlice.reducer;
