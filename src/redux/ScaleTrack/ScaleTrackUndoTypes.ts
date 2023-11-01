import * as _ from "./ScaleTrackSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getScaleTrackUpdateAsString } from "types/ScaleTrack";
import { getTrackAsString } from "types/Track";

export const SCALE_TRACK_UNDO_TYPES: ActionGroup = {
  "scaleTracks/addScaleTrack": (
    action: PayloadAction<_.AddScaleTrackPayload>
  ) => {
    return `ADD_TRACK:${getTrackAsString(action.payload)}`;
  },
  "scaleTracks/removeScaleTrack": (
    action: PayloadAction<_.RemoveScaleTrackPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "scaleTracks/updateScaleTrack": (
    action: PayloadAction<_.UpdateScaleTrackPayload>
  ) => {
    return `UPDATE_SCALE_TRACK:${getScaleTrackUpdateAsString(action.payload)}`;
  },
};
