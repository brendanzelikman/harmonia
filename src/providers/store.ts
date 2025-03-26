import {
  combineReducers,
  configureStore,
  PayloadAction,
} from "@reduxjs/toolkit";
import { saveProject } from "../types/Project/ProjectThunks";
import { handleInstrumentMiddleware } from "types/Instrument/InstrumentMiddleware";
import { MetaSlice } from "types/Meta/MetaSlice";
import { scalesSlice } from "types/Scale/ScaleSlice";
import { trackSlice } from "types/Track/TrackSlice";
import { instrumentsSlice } from "types/Instrument/InstrumentSlice";
import { patternClipSlice, poseClipSlice } from "types/Clip/ClipSlice";
import { portalSlice } from "types/Portal/PortalSlice";
import { posesSlice } from "types/Pose/PoseSlice";
import { patternsSlice } from "types/Pattern/PatternSlice";
import {
  privateTimelineActions,
  timelineSlice,
} from "types/Timeline/TimelineSlice";
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
  tracks: ReturnType<typeof trackSlice.reducer>;
  instruments: ReturnType<typeof instrumentsSlice.reducer>;
  scales: ReturnType<typeof scalesSlice.reducer>;
  patterns: ReturnType<typeof patternsSlice.reducer>;
  poses: ReturnType<typeof posesSlice.reducer>;
  patternClips: ReturnType<typeof patternClipSlice.reducer>;
  poseClips: ReturnType<typeof poseClipSlice.reducer>;
  portals: ReturnType<typeof portalSlice.reducer>;
  timeline: ReturnType<typeof timelineSlice.reducer>;
  transport: ReturnType<typeof transportSlice.reducer>;
};
export type SafeBaseProject = Safe<BaseProject>;

/** The base project reducer consolidates all slices into a single reducer. */
const baseProjectReducer = combineReducers({
  meta: MetaSlice.reducer,
  tracks: trackSlice.reducer,
  instruments: instrumentsSlice.reducer,
  scales: scalesSlice.reducer,
  patterns: patternsSlice.reducer,
  poses: posesSlice.reducer,
  patternClips: patternClipSlice.reducer,
  poseClips: poseClipSlice.reducer,
  portals: portalSlice.reducer,
  timeline: timelineSlice.reducer,
  transport: transportSlice.reducer,
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
    const dataString = JSON.stringify(payload?.data);
    return `${type}:${dataString}`;
  },
  filter: excludeAction([
    ...privateTransportActions,
    ...privateTimelineActions,
    "instruments/addInstrumentOffline",
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
