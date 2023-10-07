import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import { PatternTrack, defaultPatternTrack } from "types/PatternTrack";
import { TrackId } from "types/Track";
import { initializeState } from "types/util";

/**
 * A `PatternTrack` can be added to the store.
 */
export type AddPatternTrackPayload = PatternTrack;

/**
 * A `PatternTrack` can be removed from the store by ID.
 */
export type RemovePatternTrackPayload = TrackId;

/**
 * A `PatternTrack` can be updated in the store.
 */
export type UpdatePatternTrackPayload = Partial<PatternTrack>;

const initialState = initializeState<TrackId, PatternTrack>([
  defaultPatternTrack,
]);

/**
 * The `patternTracks` slice contains all of the `PatternTracks` in the store.
 *
 * @property `addPatternTrack` - Add a PatternTrack to the store.
 * @property `removePatternTrack` - Remove a PatternTrack from the store.
 * @property `updatePatternTrack` - Update a PatternTrack in the store.
 *
 */
export const patternTracksSlice = createSlice({
  name: "patternTracks",
  initialState,
  reducers: {
    /**
     * Add a PatternTrack to the store.
     * @param state The patternTracks state.
     * @param action The PatternTrack to add.
     */
    addPatternTrack: (state, action: PayloadAction<AddPatternTrackPayload>) => {
      const scaleTrack = action.payload;
      state.byId[scaleTrack.id] = scaleTrack;
      state.allIds = union(state.allIds, [scaleTrack.id]);
    },
    /**
     * Remove a PatternTrack from the store.
     * @param state The patternTracks state.
     * @param action The PatternTrack ID to remove.
     * @returns The PatternTrack ID.
     */
    removePatternTrack: (
      state,
      action: PayloadAction<RemovePatternTrackPayload>
    ) => {
      const trackId = action.payload;
      delete state.byId[trackId];

      const index = state.allIds.findIndex((id) => id === trackId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    /**
     * Update a PatternTrack in the store.
     * @param state The patternTracks state.
     * @param action The PatternTrack partial to update.
     * @returns The PatternTrack ID.
     */
    updatePatternTrack: (state, action) => {
      const { id, ...rest } = action.payload;
      const track = state.byId[id];
      if (!id || !track) return;
      state.byId[id] = {
        ...state.byId[id],
        ...rest,
      };
    },
  },
});

export const { addPatternTrack, removePatternTrack, updatePatternTrack } =
  patternTracksSlice.actions;

export default patternTracksSlice.reducer;
