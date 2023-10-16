import { AppThunk } from "redux/store";
import { UndoTypes } from "redux/undoTypes";

/**
 * Undo the arrangement if there is a past state.
 */
export const undoArrangement = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const { past } = state.arrangement;
  if (past.length > 0) dispatch({ type: UndoTypes.undoArrangement });
};

/**
 * Redo the arrangement if there is a future state.
 */
export const redoArrangement = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const { future } = state.arrangement;
  if (future.length > 0) dispatch({ type: UndoTypes.redoArrangement });
};
