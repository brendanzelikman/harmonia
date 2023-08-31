import {
  AnyAction,
  combineReducers,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import * as Slices from "./slices";
import undoable from "redux-undo";
import { loadState, saveState } from "./util";
import { groupByActionType } from "./undoTypes";

const session = combineReducers({
  clips: Slices.Clips.default,
  scaleTracks: Slices.ScaleTracks.default,
  patternTracks: Slices.PatternTracks.default,
  transforms: Slices.Transforms.default,
  mixers: Slices.Mixers.default,
  trackMap: Slices.TrackMap.default,
  clipMap: Slices.ClipMap.default,
  transformMap: Slices.TransformMap.default,
});

const undoableSession = undoable(session, {
  groupBy: groupByActionType,
  undoType: "session/undo",
  redoType: "session/redo",
  limit: 16,
});

const undoableScales = undoable(Slices.Scales.default, {
  groupBy: groupByActionType,
  undoType: "scales/undo",
  redoType: "scales/redo",
  limit: 16,
});

const undoablePatterns = undoable(Slices.Patterns.default, {
  groupBy: groupByActionType,
  undoType: "patterns/undo",
  redoType: "patterns/redo",
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
  if (state.transport.state === "started") return;
  saveState(state);
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  AnyAction
>;
