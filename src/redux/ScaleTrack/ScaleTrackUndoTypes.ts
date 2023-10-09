import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "types/units";
import * as ScaleTrackSlice from "./ScaleTrackSlice";
import { getScaleTrackTag } from "types/ScaleTrack";
import { createTag } from "types/util";
import { getTrackTag } from "types/Track";

export const SCALE_TRACK_UNDO_TYPES: ActionGroup = {
  "scaleTracks/addScaleTrack": (
    action: PayloadAction<ScaleTrackSlice.AddScaleTrackPayload>
  ) => {
    const tag = createTag(action.payload, getTrackTag);
    return `ADD_TRACK:${tag}`;
  },
  "scaleTracks/removeScaleTrack": (
    action: PayloadAction<ScaleTrackSlice.RemoveScaleTrackPayload>
  ) => {
    const id = action.payload;
    return `REMOVE_TRACK:${id}`;
  },
  "scaleTracks/updateScaleTrack": (
    action: PayloadAction<ScaleTrackSlice.UpdateScaleTrackPayload>
  ) => {
    const scaleTrackTag = createTag(action.payload, getScaleTrackTag);
    return `UPDATE_SCALE_TRACK:${scaleTrackTag}`;
  },
};
