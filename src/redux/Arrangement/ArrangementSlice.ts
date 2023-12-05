import { combineReducers } from "@reduxjs/toolkit";
import { clipsSlice } from "redux/Clip/ClipSlice";
import {
  PRIVATE_INSTRUMENT_ACTIONS,
  instrumentsSlice,
} from "redux/Instrument/InstrumentSlice";
import { tracksSlice } from "redux/Track/TrackSlice";
import { portalsSlice } from "redux/Portal";
import { posesSlice } from "redux/Pose/PoseSlice";
import { getSliceActions } from "redux/util";

/** The arrangement reducer creates a shared history. */
const arrangementReducer = combineReducers({
  tracks: tracksSlice.reducer,
  instruments: instrumentsSlice.reducer,
  clips: clipsSlice.reducer,
  portals: portalsSlice.reducer,
});

export default arrangementReducer;

/** Every action is allowed except for private instrument actions. */
export const arrangementActions = [
  ...getSliceActions(tracksSlice),
  ...getSliceActions(clipsSlice),
  ...getSliceActions(posesSlice),
  ...getSliceActions(portalsSlice),
  ...getSliceActions(instrumentsSlice).filter(
    (action) => !PRIVATE_INSTRUMENT_ACTIONS.includes(action)
  ),
];
