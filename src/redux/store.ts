import * as Slices from "./slices";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import undoable, { includeAction } from "redux-undo";
import { groupByActionType, UndoTypes } from "./undoTypes";
import { handleInstrumentMiddleware } from "./Instrument";
import { saveProject } from "./Project/ProjectThunks";
import { arrangementActions } from "./Arrangement";

const editor = Slices.Editor.default;
const meta = Slices.Metadata.default;
const timeline = Slices.Timeline.default;
const transport = Slices.Transport.default;

const undoableArrangement = undoable(Slices.Arrangement.default, {
  groupBy: groupByActionType,
  filter: includeAction(arrangementActions),
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

const appReducer = combineReducers({
  meta,
  transport,
  scales: undoableScales,
  patterns: undoablePatterns,
  arrangement: undoableArrangement,
  timeline,
  editor,
});

/** Inject the reducer with an overwriter */
const reducer: typeof appReducer = (state, action) => {
  if (action.type === "setProject") return action.payload;
  return appReducer(state, action);
};

/** Configure the store with instrument-validating middleware. */
export const store = configureStore({
  reducer,
  middleware: (gDM) => gDM().concat(handleInstrumentMiddleware),
});

/** Auto-save the project. */
store.subscribe(() => {
  store.dispatch(saveProject());
});
