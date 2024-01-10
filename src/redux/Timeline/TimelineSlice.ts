import { clamp } from "lodash";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MAX_CELL_HEIGHT,
  MAX_CELL_WIDTH,
  MIN_CELL_HEIGHT,
  MIN_CELL_WIDTH,
} from "utils/constants";
import { defaultTimeline, TimelineState } from "types/Timeline";
import {
  MediaClipboard,
  MediaDraft,
  MediaDragState,
  MediaSelection,
} from "types/Media";
import { TrackId } from "types/Track";
import { Subdivision } from "utils/durations";
import { PortalFragment } from "types/Portal";

// ------------------------------------------------------------
// Timeline Payload Types
// ------------------------------------------------------------

/** The width of a cell can be set. */
export type SetCellWidthPayload = number;

/** The height of a cell can be set. */
export type SetCellHeightPayload = number;

/** The subdivision of the timeline can be set. */
export type SetSubdivisionPayload = Subdivision;

/** The state of the timeline can be set. */
export type SetTimelineStatePayload = TimelineState;

/** The state of the timeline can be cleared. */
export type ClearTimelineStatePayload = void;

/** The selected track ID can be set or cleared. */
export type SetSelectedTrackIdPayload = TrackId | undefined;

/** The media selection can be updated with partial values. */
export type UpdateMediaSelectionPayload = Partial<MediaSelection>;

/** The media clipboard can be updated with partial values. */
export type UpdateMediaClipboardPayload = Partial<MediaClipboard>;

/** The media draft can be updated with partial values. */
export type UpdateMediaDraftPayload = Partial<MediaDraft>;

/** The media drag state can be updated with partial values. */
export type UpdateMediaDragStatePayload = Partial<MediaDragState>;

// ------------------------------------------------------------
// Timeline Slice Definition
// ------------------------------------------------------------

export const timelineSlice = createSlice({
  name: "timeline",
  initialState: defaultTimeline,
  reducers: {
    /** Set the width of a timeline cell. */
    setCellWidth(state, action: PayloadAction<SetCellWidthPayload>) {
      state.cell.width = clamp(action.payload, MIN_CELL_WIDTH, MAX_CELL_WIDTH);
    },
    /** Set the height of a timeline cell. */
    setCellHeight(state, action: PayloadAction<SetCellHeightPayload>) {
      state.cell.height = clamp(
        action.payload,
        MIN_CELL_HEIGHT,
        MAX_CELL_HEIGHT
      );
    },
    /** Set the subdivision of the timeline. */
    setSubdivision(state, action: PayloadAction<SetSubdivisionPayload>) {
      state.subdivision = action.payload;
    },
    /** Increase the subdivision of the timeline. */
    increaseSubdivision(state) {
      if (state.subdivision.includes("64")) return;
      const match = state.subdivision.match(/\d+/);
      if (!match) return;
      const oldValue = parseInt(match[0]);
      const newValue = Math.min(oldValue * 2, 64);
      const newSubdivision = state.subdivision.replace(/\d+/, `${newValue}`);
      state.subdivision = newSubdivision as Subdivision;
    },
    /** Decrease the subdivision of the timeline. */
    decreaseSubdivision(state) {
      if (state.subdivision.includes("1") && !state.subdivision.includes("16"))
        return;
      const match = state.subdivision.match(/\d+/);
      if (!match) return;
      const oldValue = parseInt(match[0]);
      const newValue = Math.max(oldValue / 2, 1);
      const newSubdivision = state.subdivision.replace(/\d+/, `${newValue}`);
      state.subdivision = newSubdivision as Subdivision;
    },
    /** Set the timeline state. */
    setTimelineState: (
      state,
      action: PayloadAction<SetTimelineStatePayload>
    ) => {
      state.state = action.payload;
    },
    /** Clear the timeline state. */
    clearTimelineState: (state) => {
      state.state = "idle";
    },
    /** Set the selected track ID. */
    setSelectedTrackId: (
      state,
      action: PayloadAction<SetSelectedTrackIdPayload>
    ) => {
      state.selectedTrackId = action.payload;
    },
    /** Set the selected clip type. */
    setSelectedClipType: (state, action: PayloadAction<"pattern" | "pose">) => {
      state.selectedClipType = action.payload;
    },
    /** Update the media clipboard. */
    updateMediaClipboard: (
      state,
      action: PayloadAction<UpdateMediaClipboardPayload>
    ) => {
      const { mediaClipboard } = state;
      const { clips, portals } = action.payload;
      if (clips) {
        mediaClipboard.clips = clips;
      }
      if (portals) {
        mediaClipboard.portals = portals;
      }
    },
    /** Update the media draft. */
    updateMediaDraft: (
      state,
      action: PayloadAction<UpdateMediaDraftPayload>
    ) => {
      const { mediaDraft } = state;
      const { patternClip, poseClip, portal } = action.payload;
      if (patternClip) {
        mediaDraft.patternClip = { ...mediaDraft.patternClip, ...patternClip };
      }
      if (poseClip) {
        mediaDraft.poseClip = { ...mediaDraft.poseClip, ...poseClip };
      }
      if (portal) {
        mediaDraft.portal = portal;
      }
    },
    /** Update the media selection. */
    updateMediaSelection: (
      state,
      action: PayloadAction<UpdateMediaSelectionPayload>
    ) => {
      const { mediaSelection } = state;
      const { patternClipIds, poseClipIds, portalIds } = action.payload;
      if (patternClipIds) {
        mediaSelection.patternClipIds = patternClipIds;
      }
      if (poseClipIds) {
        mediaSelection.poseClipIds = poseClipIds;
      }
      if (portalIds) {
        mediaSelection.portalIds = portalIds;
      }
    },
    /** Update the media drag state. */
    updateMediaDragState: (
      state,
      action: PayloadAction<UpdateMediaDragStatePayload>
    ) => {
      const { mediaDragState } = state;
      const { draggingPatternClip, draggingPoseClip, draggingPortal } =
        action.payload;

      if (draggingPatternClip !== undefined) {
        mediaDragState.draggingPatternClip = draggingPatternClip;
      }
      if (draggingPoseClip !== undefined) {
        mediaDragState.draggingPoseClip = draggingPoseClip;
      }
      if (draggingPortal !== undefined) {
        mediaDragState.draggingPortal = draggingPortal;
      }
    },
    /** Toggle whether live posing is enabled. */
    toggleLivePlay: (state) => {
      state.livePlay.enabled = !state.livePlay.enabled;
    },
    /** Toggle the live pose mode. */
    toggleLivePlayMode: (state) => {
      state.livePlay.mode =
        state.livePlay.mode === "numerical" ? "alphabetical" : "numerical";
    },
    /** Toggle the diary. */
    toggleDiary: (state) => {
      state.showingDiary = !state.showingDiary;
    },
  },
});

export const {
  setTimelineState,
  clearTimelineState,
  setCellWidth,
  setCellHeight,
  setSubdivision,
  increaseSubdivision,
  decreaseSubdivision,
  setSelectedTrackId,
  setSelectedClipType,
  updateMediaSelection,
  updateMediaClipboard,
  updateMediaDraft,
  updateMediaDragState,
  toggleLivePlay,
  toggleLivePlayMode,
  toggleDiary,
} = timelineSlice.actions;

export default timelineSlice.reducer;
