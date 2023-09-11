import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { selectPatternTrack } from "redux/selectors";

import { AppThunk } from "redux/store";
import { initializeState } from "redux/util";
import { updateInstrument } from "types/instrument";
import { defaultPatternTrack, PatternTrack, TrackId } from "types/tracks";
import {
  addPatternTrackToTrackMap,
  removePatternTrackFromTrackMap,
} from "./maps/trackMap";
import { union } from "lodash";

const initialState = initializeState<TrackId, PatternTrack>([
  defaultPatternTrack,
]);

export const patternTracksSlice = createSlice({
  name: "patternTracks",
  initialState,
  reducers: {
    addPatternTrack: (state, action: PayloadAction<PatternTrack>) => {
      const scaleTrack = action.payload;
      state.byId[scaleTrack.id] = scaleTrack;
      state.allIds = union(state.allIds, [scaleTrack.id]);
    },
    removePatternTrack: (state, action: PayloadAction<TrackId>) => {
      const trackId = action.payload;
      delete state.byId[trackId];

      const index = state.allIds.findIndex((id) => id === trackId);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    removePatternTracksByScaleTrackId: (
      state,
      action: PayloadAction<TrackId>
    ) => {
      const scaleTrackId = action.payload;
      const patternTracks = Object.values(state.byId).filter(
        (track) => track.scaleTrackId === scaleTrackId
      );
      patternTracks.forEach((track) => {
        delete state.byId[track.id];
        const index = state.allIds.findIndex((id) => id === track.id);
        if (index === -1) return;
        state.allIds.splice(index, 1);
      });
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

export const {
  addPatternTrack,
  removePatternTrack,
  removePatternTracksByScaleTrackId,
  updatePatternTrack,
} = patternTracksSlice.actions;

export const setPatternTrackScaleTrack =
  (patternTrackId: TrackId, scaleTrackId: TrackId, index?: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const patternTrack = selectPatternTrack(state, patternTrackId);
    if (!patternTrack) return;

    const newTrack = { ...patternTrack, scaleTrackId };
    dispatch(updatePatternTrack(newTrack));
    dispatch(removePatternTrackFromTrackMap(patternTrackId));
    dispatch(
      addPatternTrackToTrackMap({ scaleTrackId, patternTrackId, index })
    );
  };

export const setPatternTrackInstrument =
  (id: TrackId, instrument: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const patternTrack = selectPatternTrack(state, id);
    if (!patternTrack) return;

    const newTrack = { ...patternTrack, instrument };
    dispatch(updatePatternTrack(newTrack));
    dispatch(updateInstrument(newTrack));
  };

export default patternTracksSlice.reducer;
