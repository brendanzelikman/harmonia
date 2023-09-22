import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { TranspositionId } from "types/transposition";

export const selectTranspositionId = (
  state: RootState,
  id: TranspositionId
) => {
  return id;
};
export const selectTranspositionIds = (state: RootState) => {
  return state.session.present.transpositions.allIds;
};
export const selectTranspositionMap = (state: RootState) => {
  return state.session.present.transpositions.byId;
};

// Select all transpositions from the store
export const selectTranspositions = createSelector(
  [selectTranspositionIds, selectTranspositionMap],
  (ids, transpositions) => ids.map((id) => transpositions[id])
);

export const selectTranspositionsByIds = createSelector(
  [selectTranspositionMap, (state: RootState, ids: TranspositionId[]) => ids],
  (transpositions, ids) => ids.map((id) => transpositions[id])
);

// Select a specific transposition from the store
export const selectTransposition = createSelector(
  [selectTranspositionMap, selectTranspositionId],
  (transpositions, id) => transpositions[id]
);
