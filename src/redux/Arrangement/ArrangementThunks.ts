import { Thunk } from "types/Project";
import { UndoTypes } from "redux/undoTypes";

/** Undo the arrangement if there is a past state. */
export const undoArrangement = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const { past } = project.arrangement;
  if (past.length > 0) dispatch({ type: UndoTypes.undoArrangement });
};

/** Redo the arrangement if there is a future state. */
export const redoArrangement = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const { future } = project.arrangement;
  if (future.length > 0) dispatch({ type: UndoTypes.redoArrangement });
};
