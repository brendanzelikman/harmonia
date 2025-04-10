import { Project } from "types/Project/ProjectTypes";
import { combineReducers, PayloadAction } from "@reduxjs/toolkit";
import { Payload } from "types/redux";
import undoable, { excludeAction } from "redux-undo";
import {
  instrumentsSlice,
  privateInstrumentActions,
} from "types/Instrument/InstrumentSlice";
import {
  privateTimelineActions,
  timelineSlice,
} from "types/Timeline/TimelineSlice";
import {
  privateTransportActions,
  transportSlice,
} from "types/Transport/TransportSlice";
import { UndoType } from "types/units";
import { patternClipSlice, poseClipSlice } from "types/Clip/ClipSlice";
import { patternsSlice } from "types/Pattern/PatternSlice";
import { portalSlice } from "types/Portal/PortalSlice";
import { posesSlice } from "types/Pose/PoseSlice";
import { scalesSlice } from "types/Scale/ScaleSlice";
import { trackSlice } from "types/Track/TrackSlice";
import { Safe } from "types/utils";
import { metaSlice } from "types/Meta/MetaSlice";
import { store } from "./store";
import { selectCanRedo, selectCanUndo } from "types/Project/ProjectSelectors";

export const SET_PROJECT = "setProject";
export const UNDO_PROJECT = "undoProject";
export const REDO_PROJECT = "redoProject";
export const PROJECT_HISTORY_LIMIT = 16;

// ------------------------------------------------------------
// Base Project Type
// ------------------------------------------------------------

/** The Base Project type is the intended shape of the project.  */
export type BaseProject = {
  meta: ReturnType<typeof metaSlice.reducer>;
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
export const baseProjectReducer = combineReducers({
  meta: metaSlice.reducer,
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

/** The base project reducer wrapped with history. */
export const undoableProjectReducer = undoable(baseProjectReducer, {
  undoType: UNDO_PROJECT,
  redoType: REDO_PROJECT,
  limit: PROJECT_HISTORY_LIMIT,
  groupBy: (action: PayloadAction<Payload>): UndoType => {
    const { type, payload } = action;
    if (payload?.undoType !== undefined) return payload.undoType;
    const dataString = JSON.stringify(payload?.data);
    return `${type}(${dataString})`;
  },
  filter: excludeAction([
    ...privateTransportActions,
    ...privateTimelineActions,
    ...privateInstrumentActions,
  ]),
  syncFilter: true,
});

/** The final reducer used in the Redux store. */
export const reducer: typeof undoableProjectReducer = (state, action) => {
  if (action.type === SET_PROJECT) return action.payload as Project;
  return undoableProjectReducer(state, action);
};

/** Directly set the project */
export const setProject = (payload: Project) => {
  store.dispatch({ type: SET_PROJECT, payload });
};

/** Undo the project */
export const undoProject = () => {
  if (selectCanUndo(store.getState())) {
    store.dispatch({ type: UNDO_PROJECT });
  }
};

/** Redo the project */
export const redoProject = () => {
  if (selectCanRedo(store.getState())) {
    store.dispatch({ type: REDO_PROJECT });
  }
};
