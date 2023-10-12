import {
  AnyAction,
  combineReducers,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import * as Slices from "./slices";
import undoable, { includeAction } from "redux-undo";
import { saveState, loadState, getSliceActions } from "./util";
import { groupByActionType, UndoTypes } from "./undoTypes";
import { handleInstrumentMiddleware } from "./Instrument";
import { Transport } from "tone";

const session = combineReducers({
  scaleTracks: Slices.ScaleTracks.default,
  patternTracks: Slices.PatternTracks.default,
  clips: Slices.Clips.default,
  transpositions: Slices.Transpositions.default,
  instruments: Slices.Instruments.default,
  session: Slices.Session.default,
});

const undoableSession = undoable(session, {
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
    ...getSliceActions(Slices.Session.sessionSlice),
  ]),
  undoType: UndoTypes.undoSession,
  redoType: UndoTypes.redoSession,
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

const root = Slices.Root.default;
const editor = Slices.Editor.default;
const timeline = Slices.Timeline.default;
const transport = Slices.Transport.default;

const reducer = combineReducers({
  scales: undoableScales,
  patterns: undoablePatterns,
  session: undoableSession,
  root,
  editor,
  timeline,
  transport,
});

const preloadedState = loadState();
export const store = configureStore({
  reducer,
  preloadedState,
  middleware: (gDM) => gDM().concat(handleInstrumentMiddleware),
});

store.subscribe(() => {
  const state = store.getState();
  if (Transport.state !== "started") saveState(state);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
