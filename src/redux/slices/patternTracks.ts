import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { selectPatternTrack } from "redux/selectors";
import { AppThunk } from "redux/store";
import { initializeState } from "redux/util";
import { InstrumentKey, updateInstrument } from "types/instrument";
import { defaultPatternTrack, PatternTrack, TrackId } from "types/tracks";
import { union } from "lodash";
import { migrateTrackInSession } from "./sessionMap";

const initialState = initializeState<TrackId, PatternTrack>([
  defaultPatternTrack,
]);

export type AddPatternTrackPayload = PatternTrack;
export type RemovePatternTrackPayload = TrackId;
export type UpdatePatternTrackPayload = Partial<PatternTrack>;

export const patternTracksSlice = createSlice({
  name: "patternTracks",
  initialState,
  reducers: {
    addPatternTrack: (state, action: PayloadAction<AddPatternTrackPayload>) => {
      const scaleTrack = action.payload;
      state.byId[scaleTrack.id] = scaleTrack;
      state.allIds = union(state.allIds, [scaleTrack.id]);
    },
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

export const setPatternTrackScaleTrack =
  (patternTrackId: TrackId, parentId: TrackId, index?: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const patternTrack = selectPatternTrack(state, patternTrackId);
    if (!patternTrack) return;

    const newTrack = { ...patternTrack, parentId };
    dispatch(updatePatternTrack(newTrack));
    dispatch(
      migrateTrackInSession({
        id: patternTrackId,
        parentId,
        index,
      })
    );
  };

export const setPatternTrackInstrument =
  (id: TrackId, instrument: InstrumentKey): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const patternTrack = selectPatternTrack(state, id);
    if (!patternTrack) return;

    const newTrack = { ...patternTrack, instrument };
    dispatch(updatePatternTrack(newTrack));
    dispatch(updateInstrument(newTrack));
  };

export default patternTracksSlice.reducer;
