import { AppThunk } from "redux/store";
import { UndoTypes } from "redux/undoTypes";

/**
 * Undo the session if there is a past state.
 */
export const undoSession = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const { past } = state.session;
  if (past.length > 0) dispatch({ type: UndoTypes.undoSession });
};

/**
 * Redo the session if there is a future state.
 */
export const redoSession = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const { future } = state.session;
  if (future.length > 0) dispatch({ type: UndoTypes.redoSession });
};
