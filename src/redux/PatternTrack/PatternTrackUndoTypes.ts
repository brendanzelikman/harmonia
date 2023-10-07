import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "types/units";
import * as PatternTrackSlice from "./PatternTrackSlice";
import { createTag } from "types/util";
import { getPatternTrackTag } from "types/PatternTrack";

export const PATTERN_TRACK_UNDO_TYPES: ActionGroup = {
  "patternTracks/addPatternTrack": (
    action: PayloadAction<PatternTrackSlice.AddPatternTrackPayload>
  ) => {
    const patternTrackTag = createTag(action.payload, getPatternTrackTag);
    return `ADD_TRACK:${patternTrackTag}`;
  },
  "patternTracks/removePatternTrack": (
    action: PayloadAction<PatternTrackSlice.RemovePatternTrackPayload>
  ) => {
    return `REMOVE_TRACK:${action.payload}`;
  },
  "patternTracks/updatePatternTrack": (
    action: PayloadAction<PatternTrackSlice.UpdatePatternTrackPayload>
  ) => {
    const patternTrackTag = createTag(action.payload, getPatternTrackTag);
    return `UPDATE_TRACK:${patternTrackTag}`;
  },
};
