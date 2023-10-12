import {
  ActionCreatorWithPayload,
  createSlice,
  PayloadAction,
} from "@reduxjs/toolkit";
import { initializeState } from "types/util";
import { TrackId } from "types/Track";
import { Transposition, TranspositionId } from "types/Transposition";
import { without } from "lodash";
import { MediaPayload, PartialMediaPayload } from "types/Media";
import { updateMediaInSession } from "redux/Session";

const initialTranspositions = initializeState<TranspositionId, Transposition>();

/**
 * `Transpositions` can be added with a `MediaPayload`.
 */
export type AddTranspositionsPayload = MediaPayload;

/**
 * `Transpositions` can be removed with a `MediaPayload`.
 */
export type RemoveTranspositionsPayload = MediaPayload;

/**
 * `Transpositions` can be updated with a `PartialMediaPayload`.
 */
export type UpdateTranspositionsPayload = PartialMediaPayload;

/**
 * `Transpositions` can be removed by track ID.
 */
export type RemoveTranspositionsByTrackIdPayload = TrackId;

/**
 * `Transpositions` can be cleared by track ID.
 */
export type ClearTranspositionsByTrackIdPayload = TrackId;

/**
 * The `transpositions` slice contains all transpositions in the session.
 *
 * @property `addTranspositions` - Adds transpositions to the store.
 * @property `removeTranspositions` - Removes transpositions from the store.
 * @property `updateTranspositions` - Updates transpositions in the store.
 * @property `removeTranspositionsByTrackId` - Removes transpositions from the store by track ID.
 * @property `clearTranspositionsByTrackId` - Clears transpositions from the store by track ID.
 *
 */
export const transpositionsSlice = createSlice({
  name: "transpositions",
  initialState: initialTranspositions,
  reducers: {
    /**
     * Add transpositions to the store.
     * @param state The transpositions state.
     * @param action The payload action containing the transpositions to add.
     */
    addTranspositions: (
      state,
      action: PayloadAction<AddTranspositionsPayload>
    ) => {
      const { transpositions } = action.payload;
      if (!transpositions?.length) return;
      transpositions.forEach((transposition) => {
        state.byId[transposition.id] = transposition;
        state.allIds.push(transposition.id);
      });
    },
    /**
     * Remove transpositions from the store.
     * @param state The transpositions state.
     * @param action The payload action containing the transpositions to remove.
     */
    removeTranspositions: (
      state,
      action: PayloadAction<RemoveTranspositionsPayload>
    ) => {
      const { transpositions } = action.payload;
      if (!transpositions?.length) return;
      const transpositionIds = transpositions.map(({ id }) => id);
      transpositionIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = without(state.allIds, ...transpositionIds);
    },
    /**
     * Update transpositions in the store.
     * @param state The transpositions state.
     * @param action The payload action containing the transpositions to update.
     */
    _updateTranspositions: (
      state,
      action: PayloadAction<UpdateTranspositionsPayload>
    ) => {
      const { transpositions } = action.payload;
      if (!transpositions?.length) return;
      transpositions.forEach((transposition) => {
        const { id, ...rest } = transposition;
        if (!id) return;
        if (!state.byId[id]) return;
        state.byId[id] = { ...state.byId[id], ...rest };
      });
    },
    /**
     * Remove transpositions from the store by track ID.
     * @param state The transpositions state.
     * @param action The payload action containing the track ID.
     */
    removeTranspositionsByTrackId: (
      state,
      action: PayloadAction<RemoveTranspositionsByTrackIdPayload>
    ) => {
      const trackId = action.payload;
      if (!trackId) return;
      const transpositionIds = state.allIds.filter(
        (id) => state.byId[id].trackId === trackId
      );
      transpositionIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = without(state.allIds, ...transpositionIds);
    },
    /**
     * Clear transpositions from the store by track ID.
     * @param state The transpositions state.
     * @param action The payload action containing the track ID.
     */
    clearTranspositionsByTrackId: (
      state,
      action: PayloadAction<ClearTranspositionsByTrackIdPayload>
    ) => {
      const trackId = action.payload;
      if (!trackId) return;
      const transpositionIds = state.allIds.filter(
        (id) => state.byId[id].trackId === trackId
      );
      transpositionIds.forEach((id) => {
        delete state.byId[id];
      });
      state.allIds = without(state.allIds, ...transpositionIds);
    },
  },
});

export const {
  addTranspositions,
  removeTranspositions,
  _updateTranspositions,
  removeTranspositionsByTrackId,
  clearTranspositionsByTrackId,
} = transpositionsSlice.actions;

export const updateTranspositions =
  (media: PartialMediaPayload) => (dispatch: any) => {
    dispatch(_updateTranspositions(media));
    dispatch(updateMediaInSession(media));
  };

export default transpositionsSlice.reducer;
