import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import {
  PatternTrack,
  PatternTrackUpdate,
  defaultPatternTrackState,
} from "types/PatternTrack";
import { RemoveTrackPayload, TrackId } from "types/Track";

// ------------------------------------------------------------
// Payload Types
// ------------------------------------------------------------

/** A `PatternTrack` can be added to the store. */
export type AddPatternTrackPayload = PatternTrack;

/** A `PatternTrack` can be removed from the store by ID. */
export type RemovePatternTrackPayload = RemoveTrackPayload;

/** A `PatternTrack` can be updated in the store. */
export type UpdatePatternTrackPayload = PatternTrackUpdate;

// ------------------------------------------------------------
// Slice Definition
// ------------------------------------------------------------

export const patternTracksSlice = createSlice({
  name: "patternTracks",
  initialState: defaultPatternTrackState,
  reducers: {
    /** Add a pattern track to the slice. */
    addPatternTrack: (state, action: PayloadAction<AddPatternTrackPayload>) => {
      const scaleTrack = action.payload;
      state.byId[scaleTrack.id] = scaleTrack;
      state.allIds = union(state.allIds, [scaleTrack.id]);
    },
    /** Remove a pattern track from the slice. */
    removePatternTrack: (
      state,
      action: PayloadAction<RemovePatternTrackPayload>
    ) => {
      const { id } = action.payload;
      delete state.byId[id];
      const index = state.allIds.findIndex((tId) => id === tId);
      if (index > -1) state.allIds.splice(index, 1);
    },
    /** Update a pattern track in the slice. */
    updatePatternTrack: (state, action) => {
      const { id, ...rest } = action.payload;
      if (!id || !state.byId[id]) return;
      state.byId[id] = { ...state.byId[id], ...rest };
    },
  },
});

export const { addPatternTrack, removePatternTrack, updatePatternTrack } =
  patternTracksSlice.actions;

export default patternTracksSlice.reducer;
