import { combineReducers } from "@reduxjs/toolkit";
import { clipsSlice } from "redux/Clip";
import { instrumentsSlice } from "redux/Instrument";
import { patternTracksSlice } from "redux/PatternTrack";
import { scaleTracksSlice } from "redux/ScaleTrack";
import { trackHierarchySlice } from "redux/TrackHierarchy";
import { transpositionsSlice } from "redux/Transposition";

const arrangementReducer = combineReducers({
  scaleTracks: scaleTracksSlice.reducer,
  patternTracks: patternTracksSlice.reducer,
  instruments: instrumentsSlice.reducer,
  clips: clipsSlice.reducer,
  transpositions: transpositionsSlice.reducer,
  hierarchy: trackHierarchySlice.reducer,
});

export default arrangementReducer;
