import { RootState } from "redux/store";
import { createSelector } from "reselect";

// Select all transforms from the store
export const selectTransforms = createSelector(
  [(state: RootState) => state.timeline.present.transforms],
  (transforms) => transforms.allIds.map((id) => transforms.byId[id])
);

// Select all transform IDs from the store
export const selectTransformIds = (state: RootState) => {
  return state.timeline.present.transforms.allIds;
};

// Select a specific transform from the store
export const selectTransform = createSelector(
  [selectTransforms, (state: RootState, id: string) => id],
  (transforms, id) => transforms.find((transform) => transform.id === id)
);
