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
import { defaultRoot } from "./slices/root";
import { defaultTransport } from "./slices/transport";
import { defaultTour } from "./slices/tour";

const timeline = combineReducers({
  clips: Slices.Clips.default,
  scaleTracks: Slices.ScaleTracks.default,
  patternTracks: Slices.PatternTracks.default,
  transforms: Slices.Transforms.default,
  mixers: Slices.Mixers.default,
  trackMap: Slices.TrackMap.default,
  clipMap: Slices.ClipMap.default,
  transformMap: Slices.TransformMap.default,
});

const undoableTimeline = undoable(timeline, {
  groupBy: groupByActionType,
  undoType: "timeline/undo",
  redoType: "timeline/redo",
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
const transport = Slices.Transport.default;
const tour = Slices.Tour.default;

const reducer = combineReducers({
  timeline: undoableTimeline,
  scales: undoableScales,
  patterns: undoablePatterns,
  root,
  transport,
  tour,
});

const preloadedState = loadState();
export const store = configureStore({
  reducer,
  preloadedState,
});

store.subscribe(() => {
  const state = store.getState();
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
