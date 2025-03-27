import { clamp } from "lodash";
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
  defaultMediaClipboard,
  defaultMediaSelection,
} from "types/Media/MediaTypes";
import { Action, unpackAction } from "lib/redux";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";

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
    updateFragment: (state, action: Action<Partial<MediaDraft>>) => {
      const { portal } = unpackAction(action);
      if (portal !== undefined) {
        state.fragment = portal;
      }
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
  },
});

export const privateTimelineActions = [
  "timeline/clearTimelineState",
  "timeline/setTimelineType",
  "timeline/setCellWidth",
  "timeline/setCellHeight",
  "timeline/setSubdivision",
  "timeline/increaseSubdivision",
  "timeline/decreaseSubdivision",
  "timeline/setSelectedTrackId",
  "timeline/updateMediaSelection",
  "timeline/updateClipboard",
  "timeline/updateFragment",
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
} = timelineSlice.actions;

export default timelineSlice.reducer;
