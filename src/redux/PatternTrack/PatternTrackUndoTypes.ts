import * as _ from "./PatternTrackSlice";
import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "redux/util";
import { getPatternTrackUpdateAsString as getUpdateAsString } from "types/PatternTrack";
import { getTrackAsString } from "types/Track";

export const PATTERN_TRACK_UNDO_TYPES: ActionGroup = {
  "patternTracks/addPatternTrack": (
    action: PayloadAction<_.AddPatternTrackPayload>
  ) => {
    return `ADD_TRACK:${getTrackAsString(action.payload)}`;
  },
  "patternTracks/removePatternTrack": (
    action: PayloadAction<_.RemovePatternTrackPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload.originalId}`;
  },
  "patternTracks/updatePatternTrack": (
    action: PayloadAction<_.UpdatePatternTrackPayload>
  ) => {
    return `UPDATE_PATTERN_TRACK:${getUpdateAsString(action.payload)}`;
  },
};
