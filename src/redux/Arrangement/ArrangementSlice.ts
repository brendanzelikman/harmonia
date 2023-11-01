import { combineReducers } from "@reduxjs/toolkit";
import { clipsSlice } from "redux/Clip/ClipSlice";
import {
  PRIVATE_INSTRUMENT_ACTIONS,
  instrumentsSlice,
} from "redux/Instrument/InstrumentSlice";
import { patternTracksSlice } from "redux/PatternTrack/PatternTrackSlice";
import { scaleTracksSlice } from "redux/ScaleTrack/ScaleTrackSlice";
import { trackHierarchySlice } from "redux/TrackHierarchy/TrackHierarchySlice";
import { transpositionsSlice } from "redux/Transposition/TranspositionSlice";
import { getSliceActions } from "redux/util";

/** The arrangement reducer creates a shared history. */
const arrangementReducer = combineReducers({
  scaleTracks: scaleTracksSlice.reducer,
  patternTracks: patternTracksSlice.reducer,
  instruments: instrumentsSlice.reducer,
  clips: clipsSlice.reducer,
  transpositions: transpositionsSlice.reducer,
  hierarchy: trackHierarchySlice.reducer,
});

export default arrangementReducer;

/** Every action is allowed except for private instrument actions. */
export const arrangementActions = [
  ...getSliceActions(scaleTracksSlice),
  ...getSliceActions(patternTracksSlice),
  ...getSliceActions(clipsSlice),
  ...getSliceActions(transpositionsSlice),
  ...getSliceActions(trackHierarchySlice),
  ...getSliceActions(instrumentsSlice).filter(
    (action) => !PRIVATE_INSTRUMENT_ACTIONS.includes(action)
  ),
];
