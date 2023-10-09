import { PayloadAction } from "@reduxjs/toolkit";
import { ActionGroup } from "types/units";
import * as PatternTrackSlice from "./PatternTrackSlice";
import { createTag } from "types/util";
import { getPatternTrackTag } from "types/PatternTrack";
import { getTrackTag } from "types/Track";

export const PATTERN_TRACK_UNDO_TYPES: ActionGroup = {
  "patternTracks/addPatternTrack": (
    action: PayloadAction<PatternTrackSlice.AddPatternTrackPayload>
  ) => {
    const tag = createTag(action.payload, getTrackTag);
    return `ADD_TRACK:${tag}`;
  },
  "patternTracks/removePatternTrack": (
    action: PayloadAction<PatternTrackSlice.RemovePatternTrackPayload>
  ) => {
    const id = action.payload;
    return `REMOVE_TRACK:${id}`;
  },
  "patternTracks/updatePatternTrack": (
    action: PayloadAction<PatternTrackSlice.UpdatePatternTrackPayload>
  ) => {
    const patternTrackTag = createTag(action.payload, getPatternTrackTag);
    return `UPDATE_PATTERN_TRACK:${patternTrackTag}`;
  },
};
