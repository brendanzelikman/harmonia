import {
  AnyAction,
  combineReducers,
  configureStore,
  ThunkAction,
} from "@reduxjs/toolkit";
import { saveProjectToLocalStorage } from "redux/Project";
import * as Slices from "./slices";
import undoable, { includeAction } from "redux-undo";
import { getSliceActions } from "./util";
import { groupByActionType, UndoTypes } from "./undoTypes";
import {
  defaultInstrumentState,
  handleInstrumentMiddleware,
} from "./Instrument";
import { Transport } from "tone";
import { defaultSession } from "types/Session";
import { defaultEditor } from "types/Editor";
import { defaultTimeline } from "types/Timeline";
import { defaultTransport } from "types/Transport";
import { defaultPatternState } from "./Pattern";
import { defaultScaleState } from "./Scale";
import { defaultScaleTrackState } from "./ScaleTrack";
import { defaultPatternTrackState } from "./PatternTrack";
import { defaultClipState } from "./Clip";
import { defaultTranspositionState } from "./Transposition";
import { CURRENT_PROJECT, initializeProject } from "types/Project";

/**
 * The default root state.
 */
export const defaultRootState: RootState = {
  session: {
    present: {
      scaleTracks: defaultScaleTrackState,
      patternTracks: defaultPatternTrackState,
      clips: defaultClipState,
      transpositions: defaultTranspositionState,
      instruments: defaultInstrumentState,
      session: defaultSession,
    },
    past: [],
    future: [],
  },
  scales: { present: defaultScaleState, past: [], future: [] },
  patterns: { present: defaultPatternState, past: [], future: [] },
  project: initializeProject(),
  editor: defaultEditor,
  timeline: defaultTimeline,
  transport: defaultTransport,
};

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

const project = Slices.Project.default;
const editor = Slices.Editor.default;
const timeline = Slices.Timeline.default;
const transport = Slices.Transport.default;

const reducer = combineReducers({
  scales: undoableScales,
  patterns: undoablePatterns,
  session: undoableSession,
  editor,
  timeline,
  transport,
  project,
});

/** Try to load the current project from local storage. */
export const getCurrentProject = () => {
  try {
    // Get the current project ID from local storage.
    const id = localStorage.getItem(CURRENT_PROJECT);
    if (!id) return;

    // Get the state from local storage.
    const serializedState = localStorage.getItem(id);
    if (!serializedState) return;

    // Otherwise, return the parsed state.
    return JSON.parse(serializedState);
  } catch (e) {
    console.log(e);
    return;
  }
};
const preloadedState = getCurrentProject();
export const store = configureStore({
  reducer,
  preloadedState,
  middleware: (gDM) => gDM().concat(handleInstrumentMiddleware),
});

store.subscribe(() => {
  if (Transport.state !== "started") {
    store.dispatch(saveProjectToLocalStorage());
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
