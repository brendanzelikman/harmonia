import { Row } from "features/timeline";
import { MouseEvent } from "react";
import {
  selectRoot,
  selectTranspositionsByIds,
  selectTransport,
  selectTranspositionMap,
} from "redux/selectors";
import {
  addSelectedTransposition,
  deselectTransposition,
  setSelectedTranspositions,
} from "redux/slices/root";
import {
  createTranspositions,
  updateTranspositions,
} from "redux/slices/transpositions";
import { AppThunk } from "redux/store";

import { Transposition, TranspositionOffsetRecord } from "types/transposition";
import { isHoldingOption, isHoldingShift } from "utils";

export const onTranspositionClick =
  (e: MouseEvent, transposition: Transposition, rows: Row[]): AppThunk =>
  (dispatch, getState) => {
    if (!transposition) return;
    const state = getState();
    const transpositionMap = selectTranspositionMap(state);
    const { selectedTranspositionIds } = selectRoot(state);

    const isSelected = selectedTranspositionIds.includes(transposition.id);
    if (isSelected) {
      dispatch(deselectTransposition(transposition.id));
      return;
    }

    const nativeEvent = e.nativeEvent as Event;
    const holdingShift = isHoldingShift(nativeEvent);

    // Select the transposition if the user is not holding shift
    if (!holdingShift) {
      const holdingOption = isHoldingOption(nativeEvent);
      if (holdingOption) {
        dispatch(addSelectedTransposition(transposition.id));
      } else {
        dispatch(setSelectedTranspositions([transposition.id]));
      }
      return;
    }

    // Just select the transposition if there are no other selected transpositions
    if (selectedTranspositionIds.length === 0) {
      dispatch(setSelectedTranspositions([transposition.id]));
      return;
    }

    // Get the last selected transposition
    const lastId = selectedTranspositionIds.at(-1);
    if (!lastId) return;
    const lastTransposition = transpositionMap[lastId];
    if (!lastTransposition) return;

    // Get the start and end index of the selection
    const startIndex = rows.findIndex(
      (row) => row.trackId === lastTransposition?.trackId
    );
    const targetIndex = rows.findIndex(
      (row) => row.trackId === transposition.trackId
    );

    // Get the trackIds of the selection
    const trackIds = rows
      .slice(
        Math.min(startIndex, targetIndex),
        Math.max(startIndex, targetIndex) + 1
      )
      .map((row) => row.trackId);

    // Get the transpositionIds of the selection
    const transpositionIds = Object.values(transpositionMap)
      .filter((t) => trackIds.includes(t.trackId))
      .map((t) => t.id);

    // Compute the start and end tick of the selection
    const startTick = lastTransposition.tick;
    const endTick = transposition.tick;

    // Filter the transpositionIds to only include transpositions in the selection
    const newTranspositionIds = transpositionIds.filter((id) => {
      const transposition = transpositionMap[id];
      if (!transposition) return false;
      return transposition.tick >= startTick && transposition.tick <= endTick;
    });

    // Select the transpositions
    dispatch(setSelectedTranspositions(newTranspositionIds));
  };

export const addTranspositionToTimeline =
  (): AppThunk => (dispatch, getState) => {
    const state = getState();
    const { toolkit, selectedTrackId } = selectRoot(state);
    if (!selectedTrackId) return;

    const { tick } = selectTransport(state);
    const { transpositionOffsets, transpositionDuration } = toolkit;

    return dispatch(
      createTranspositions([
        {
          trackId: selectedTrackId,
          offsets: transpositionOffsets,
          duration: transpositionDuration || undefined,
          tick,
        },
      ])
    );
  };

export const updateSelectedTranspositions =
  (offsets: TranspositionOffsetRecord): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { selectedTranspositionIds } = selectRoot(state);
    if (!selectedTranspositionIds.length) return;

    const selectedTranspositions = selectTranspositionsByIds(
      state,
      selectedTranspositionIds
    ).filter(Boolean) as Transposition[];
    const updatedTranspositions = selectedTranspositions.map((t) => {
      return {
        ...t,
        offsets: {
          ...t.offsets,
          ...offsets,
        },
      };
    });
    dispatch(
      updateTranspositions({ transpositions: updatedTranspositions, clips: [] })
    );
  };

export const offsetSelectedTranspositions =
  (offset: TranspositionOffsetRecord): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { selectedTranspositionIds } = selectRoot(state);
    if (!selectedTranspositionIds.length) return;

    const selectedTranspositions = selectTranspositionsByIds(
      state,
      selectedTranspositionIds
    ).filter(Boolean) as Transposition[];
    const updatedTranspositions = selectedTranspositions.map((t) => {
      const newOffsets = Object.keys({ ...t.offsets, ...offset }).reduce(
        (acc, cur) => {
          if (!cur?.length) return acc;
          return {
            ...acc,
            [cur]: (t.offsets[cur] || 0) + (offset[cur] || 0),
          };
        },
        {} as TranspositionOffsetRecord
      );

      return {
        ...t,
        offsets: {
          ...t.offsets,
          ...newOffsets,
        },
      };
    });
    dispatch(
      updateTranspositions({ transpositions: updatedTranspositions, clips: [] })
    );
  };
