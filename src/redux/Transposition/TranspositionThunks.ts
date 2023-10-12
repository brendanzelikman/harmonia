import {
  TranspositionId,
  TranspositionNoId,
  getOffsettedTransposition,
  initializeTransposition,
} from "types/Transposition";
import { AppThunk } from "redux/store";
import { Transposition, TranspositionOffsetRecord } from "types/Transposition";
import { addMediaToSession, removeMediaFromSession } from "redux/Session";
import { selectSelectedTranspositions } from "redux/selectors";
import {
  _updateTranspositions,
  addTranspositions,
  removeTranspositions,
} from "./TranspositionSlice";

/**
 * Create a list of transpositions and add them to the store.
 * @param transpositionNoIds The transpositions to create.
 * @returns A promise that resolves to the ids of the new transpositions.
 */
export const createTranspositions =
  (
    transpositionNoIds: Partial<TranspositionNoId>[]
  ): AppThunk<Promise<TranspositionId[]>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      // Initialize the transpositions
      const transpositions = transpositionNoIds.map(initializeTransposition);
      const payload = { transpositions };

      // Add the transpositions to the store
      dispatch(addTranspositions(payload));
      dispatch(addMediaToSession(payload));

      // Resolve the promise
      const ids = transpositions.map((t) => t.id);
      resolve(ids);
    });
  };

/**
 * Delete a list of transpositions from the store.
 * @param transpositions The transpositions to delete.
 */
export const deleteTranspositions =
  (transpositions: Transposition[]): AppThunk =>
  (dispatch) => {
    dispatch(removeTranspositions({ transpositions }));
    dispatch(removeMediaFromSession({ transpositions }));
  };

/**
 * Update the selected transpositions with the given offsets.
 * @param offsets The offsets to apply to the selected transpositions.
 */
export const updateSelectedTranspositions =
  (offsets: TranspositionOffsetRecord): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const selectedTranspositions = selectSelectedTranspositions(state);
    if (!selectedTranspositions.length) return;

    const transpositions = selectedTranspositions.map((t) => {
      return { ...t, offsets: { ...t.offsets, ...offsets } };
    });
    dispatch(_updateTranspositions({ transpositions }));
  };

/**
 * Offset the selected transpositions by the given offsets.
 * @param offset The offsets to apply to the selected transpositions.
 */
export const offsetSelectedTranspositions =
  (offset: TranspositionOffsetRecord): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const selectedTranspositions = selectSelectedTranspositions(state);
    if (!selectedTranspositions.length) return;

    // Offset each transposition
    const transpositions = selectedTranspositions.map((t) =>
      getOffsettedTransposition(t, offset)
    );

    // Update the transpositions
    dispatch(_updateTranspositions({ transpositions }));
  };

/**
 * Reset the selected transpositions.
 */
export const resetSelectedTranspositions =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const selectedTranspositions = selectSelectedTranspositions(state);
    if (!selectedTranspositions.length) return;

    const transpositions = selectedTranspositions.map((t) => ({
      ...t,
      offsets: {} as TranspositionOffsetRecord,
    }));
    dispatch(_updateTranspositions({ transpositions }));
  };
