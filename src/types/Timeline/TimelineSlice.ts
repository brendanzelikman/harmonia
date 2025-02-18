import { clamp, isString } from "lodash";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  MAX_CELL_HEIGHT,
  MAX_CELL_WIDTH,
  MIN_CELL_HEIGHT,
  MIN_CELL_WIDTH,
} from "utils/constants";
import { Subdivision } from "utils/durations";
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
  MediaDraft,
  MediaDragState,
  defaultMediaClipboard,
  defaultMediaDraft,
  defaultMediaSelection,
} from "types/Media/MediaTypes";
import { Action, unpackAction } from "lib/redux";

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

/** The media selection can be updated with partial values. */
export type UpdateMediaSelectionPayload = Partial<MediaSelection>;

/** The media clipboard can be updated with partial values. */
export type UpdateClipboardPayload = Partial<MediaClipboard>;

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
    /** Set the timeline state. */
    setTimelineState: (state, action: Action<SetTimelineStatePayload>) => {
      const timelineState = unpackAction(action);
      state.state = timelineState;
    },
    /** Clear the timeline state. */
    clearTimelineState: (state, _: Action<null>) => {
      state.state = "idle";
    },
    /** Set the timeline type. */
    _setTimelineType: (state, action: Action<ClipType>) => {
      state.type = unpackAction(action);
    },
    /** Set the width of a timeline cell. */
    setCellWidth(state, action: PayloadAction<SetCellWidthPayload>) {
      state.cellWidth = clamp(action.payload, MIN_CELL_WIDTH, MAX_CELL_WIDTH);
    },
    /** Set the height of a timeline cell. */
    setCellHeight(state, action: PayloadAction<SetCellHeightPayload>) {
      state.cellHeight = clamp(
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
      if (isString(data)) state.selection.trackId = data;
      else if (!data) state.selection.trackId = undefined;
    },
    /** Update the media clipboard. */
    updateClipboard: (state, action: PayloadAction<UpdateClipboardPayload>) => {
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
    updateMediaDraft: (state, action: Action<UpdateMediaDraftPayload>) => {
      if (state.draft === undefined) state.draft = defaultMediaDraft;
      const { patternClip, poseClip, scaleClip, portal } = unpackAction(action);
      if (patternClip) {
        const existingClip = state.draft.patternClip;
        state.draft.patternClip = { ...existingClip, ...patternClip };
      }
      if (poseClip) {
        const existingClip = state.draft.poseClip;
        state.draft.poseClip = { ...existingClip, ...poseClip };
      }
      if (scaleClip) {
        const existingClip = state.draft.scaleClip;
        state.draft.scaleClip = { ...existingClip, ...scaleClip };
      }
      if (portal) {
        state.draft.portal = portal;
      }
    },
    /** Update the media selection. */
    updateMediaSelection: (
      state,
      action: Action<UpdateMediaSelectionPayload>
    ) => {
      if (!state.selection) state.selection = defaultMediaSelection;
      const { clipIds, portalIds } = unpackAction(action);
      if (clipIds) {
        state.selection.clipIds = clipIds;
        if (!state.selection.clipIds.length) {
          state.draft[`${state.type}Clip`] = undefined;
        }
      }
      if (portalIds) {
        state.selection.portalIds = portalIds;
      }
    },
  },
});

export const {
  setTimelineState,
  clearTimelineState,
  _setTimelineType,
  setCellWidth,
  setCellHeight,
  setSubdivision,
  increaseSubdivision,
  decreaseSubdivision,
  setSelectedTrackId,
  updateMediaSelection,
  updateClipboard,
  updateMediaDraft,
} = timelineSlice.actions;

export default timelineSlice.reducer;
