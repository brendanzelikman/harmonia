import {
  combineReducers,
  configureStore,
  PayloadAction,
} from "@reduxjs/toolkit";
import { saveProject } from "../types/Project/ProjectThunks";
import { handleInstrumentMiddleware } from "types/Instrument/InstrumentMiddleware";
import { MetaSlice } from "types/Meta/MetaSlice";
import { scalesSlice } from "types/Scale/ScaleSlice";
import { patternTrackSlice, scaleTrackSlice } from "types/Track/TrackSlice";
import { instrumentsSlice } from "types/Instrument/InstrumentSlice";
import {
  patternClipSlice,
  poseClipSlice,
  scaleClipSlice,
} from "types/Clip/ClipSlice";
import { portalSlice } from "types/Portal/PortalSlice";
import { posesSlice } from "types/Pose/PoseSlice";
import { patternsSlice } from "types/Pattern/PatternSlice";
import { timelineSlice } from "types/Timeline/TimelineSlice";
import { editorSlice } from "types/Editor/EditorSlice";
import {
  privateTransportActions,
  transportSlice,
} from "types/Transport/TransportSlice";
import undoable, { excludeAction } from "redux-undo";
import { Safe } from "types/util";
import { Thunk } from "types/Project/ProjectTypes";
import { Payload } from "lib/redux";
import { UndoType } from "types/units";

// ------------------------------------------------------------
// Base Project Type
// ------------------------------------------------------------

/** The Base Project type is the intended shape of the project.  */
export type BaseProject = {
  meta: ReturnType<typeof MetaSlice.reducer>;
  patternTracks: ReturnType<typeof patternTrackSlice.reducer>;
  scaleTracks: ReturnType<typeof scaleTrackSlice.reducer>;
  instruments: ReturnType<typeof instrumentsSlice.reducer>;
  motifs: {
    scale: ReturnType<typeof scalesSlice.reducer>;
    pattern: ReturnType<typeof patternsSlice.reducer>;
    pose: ReturnType<typeof posesSlice.reducer>;
  };
  clips: {
    scale: ReturnType<typeof scaleClipSlice.reducer>;
    pattern: ReturnType<typeof patternClipSlice.reducer>;
    pose: ReturnType<typeof poseClipSlice.reducer>;
  };
  portals: ReturnType<typeof portalSlice.reducer>;
  timeline: ReturnType<typeof timelineSlice.reducer>;
  transport: ReturnType<typeof transportSlice.reducer>;
  editor: ReturnType<typeof editorSlice.reducer>;
};
export type SafeBaseProject = Safe<BaseProject>;

/** The base project reducer consolidates all slices into a single reducer. */
const baseProjectReducer = combineReducers({
  meta: MetaSlice.reducer,
  patternTracks: patternTrackSlice.reducer,
  scaleTracks: scaleTrackSlice.reducer,
  instruments: instrumentsSlice.reducer,
  motifs: combineReducers({
    scale: scalesSlice.reducer,
    pattern: patternsSlice.reducer,
    pose: posesSlice.reducer,
  }),
  clips: combineReducers({
    scale: scaleClipSlice.reducer,
    pattern: patternClipSlice.reducer,
    pose: poseClipSlice.reducer,
  }),
  portals: portalSlice.reducer,
  timeline: timelineSlice.reducer,
  transport: transportSlice.reducer,
  editor: editorSlice.reducer,
});

// ------------------------------------------------------------
// Undoable Project History
// ------------------------------------------------------------

export const UNDO_PROJECT = "project/undo";
export const REDO_PROJECT = "project/redo";
export const PROJECT_HISTORY_LIMIT = 16;

/** The base project reducer wrapped with history. */
const undoableProjectReducer = undoable(baseProjectReducer, {
  undoType: UNDO_PROJECT,
  redoType: REDO_PROJECT,
  limit: PROJECT_HISTORY_LIMIT,
  groupBy: (action: PayloadAction<Payload>): UndoType => {
    const { type, payload } = action;
    if (payload?.undoType !== undefined) return payload.undoType;
    return `${type}:${JSON.stringify(payload?.data)}`;
  },
  filter: excludeAction([
    ...privateTransportActions,
    "instruments/_addOfflineInstrument",
  ]),
  syncFilter: true,
});

// ------------------------------------------------------------
// Wrapped Project Reducer
// ------------------------------------------------------------

/** Inject the reducer with an overwriter. */
export const SET_PROJECT = "setProject";
export const setProject =
  (payload: SafeBaseProject): Thunk =>
  (dispatch) => {
    dispatch({ type: SET_PROJECT, payload });
  };

/** The final reducer used in the Redux store. */
const reducer: typeof undoableProjectReducer = (state, action) => {
  if (action.type === SET_PROJECT) return action.payload;
  return undoableProjectReducer(state, action);
};

// ------------------------------------------------------------
// Redux Store Configuration
// ------------------------------------------------------------

/** Configure the store with instrument-validating middleware. */
export const store = configureStore({
  reducer,
  middleware: (gDM) => gDM().concat(handleInstrumentMiddleware),
});

/** Auto-save the project. */
const SHOULD_AUTOSAVE = true;
store.subscribe(() => {
  if (SHOULD_AUTOSAVE) store.dispatch(saveProject());
  (window as any).getState = () => store.getState();
});
