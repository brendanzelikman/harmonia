import {
  AnyAction,
  combineReducers,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import * as Slices from "./slices";
import undoable, { excludeAction } from "redux-undo";
import { saveState, loadState } from "./util";
import { groupByActionType, UndoTypes } from "./undoTypes";

const session = combineReducers({
  clips: Slices.Clips.default,
  scaleTracks: Slices.ScaleTracks.default,
  patternTracks: Slices.PatternTracks.default,
  transpositions: Slices.Transpositions.default,
  mixers: Slices.Mixers.default,
  sessionMap: Slices.SessionMap.default,
});

const undoableSession = undoable(session, {
  groupBy: groupByActionType,
  filter: excludeAction([
    "mixers/addMixer",
    "mixers/removeMixer",
    "transport/setLoaded",
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
  session: undoableSession,
  scales: undoableScales,
  patterns: undoablePatterns,
  root,
  editor,
  timeline,
  transport,
});

const preloadedState = loadState();
export const store = configureStore({
  reducer,
  preloadedState,
});

store.subscribe(() => {
  const state = store.getState();
  if (state.transport.state !== "started") saveState(state);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
