import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "types/units";
import * as ScaleTrackSlice from "./ScaleTrackSlice";
import { getScaleTrackTag } from "types/ScaleTrack";
import { createTag } from "types/util";

export const SCALE_TRACK_UNDO_TYPES: ActionGroup = {
  "scaleTracks/addScaleTrack": (
    action: PayloadAction<ScaleTrackSlice.AddScaleTrackPayload>
  ) => {
    const scaleTrackTag = createTag(action.payload, getScaleTrackTag);
    return `ADD_TRACK:${scaleTrackTag}`;
  },
  "scaleTracks/removeScaleTrack": (
    action: PayloadAction<ScaleTrackSlice.RemoveScaleTrackPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "scaleTracks/updateScaleTrack": (
    action: PayloadAction<ScaleTrackSlice.UpdateScaleTrackPayload>
  ) => {
    const scaleTrackTag = createTag(action.payload, getScaleTrackTag);
    return `UPDATE_TRACK:${scaleTrackTag}`;
  },
};
