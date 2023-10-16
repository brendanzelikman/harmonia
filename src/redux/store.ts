import * as Slices from "./slices";
import {
  AnyAction,
  combineReducers,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import undoable, { includeAction } from "redux-undo";
import { getSliceActions } from "./util";
import { groupByActionType, UndoTypes } from "./undoTypes";
import { handleInstrumentMiddleware } from "./Instrument";
import { Transport } from "tone";
import { saveProject } from "./Project/ProjectThunks";

const undoableArrangement = undoable(Slices.Arrangement.default, {
  groupBy: groupByActionType,
  filter: includeAction([
    ...getSliceActions(Slices.Scales.scalesSlice),
    ...getSliceActions(Slices.Patterns.patternsSlice),
    ...getSliceActions(Slices.ScaleTracks.scaleTracksSlice),
    ...getSliceActions(Slices.PatternTracks.patternTracksSlice),
    ...getSliceActions(Slices.Clips.clipsSlice),
    ...getSliceActions(Slices.Transpositions.transpositionsSlice),
    ...getSliceActions(Slices.Instruments.instrumentsSlice).filter(
      (action) => action !== "instruments/addInstrumentOffline"
    ),
    ...getSliceActions(Slices.TrackHierarchy.trackHierarchySlice),
  ]),
  undoType: UndoTypes.undoArrangement,
  redoType: UndoTypes.redoArrangement,
  limit: 16,
});

const undoableScales = undoable(Slices.Scales.default, {
  groupBy: groupByActionType,
  undoType: UndoTypes.undoScales,
  redoType: UndoTypes.redoScales,
  limit: 16,
});

const undoablePatterns = undoable(Slices.Patterns.default, {
  groupBy: groupByActionType,
  undoType: UndoTypes.undoPatterns,
  redoType: UndoTypes.redoPatterns,
  limit: 16,
});

const meta = Slices.Metadata.default;
const editor = Slices.Editor.default;
const timeline = Slices.Timeline.default;
const transport = Slices.Transport.default;

const appReducer = combineReducers({
  meta,
  transport,
  scales: undoableScales,
  patterns: undoablePatterns,
  arrangement: undoableArrangement,
  timeline,
  editor,
});

const reducer: typeof appReducer = (state, action) => {
  if (action.type === "setState") {
    return action.payload;
  } else {
    return appReducer(state, action);
  }
};

export const store = configureStore({
  reducer,
  middleware: (gDM) => gDM().concat(handleInstrumentMiddleware),
});

store.subscribe(() => {
  if (Transport.state !== "started") {
    store.dispatch(saveProject());
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
