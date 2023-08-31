import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { Transform, TransformId } from "types/transform";

export const selectTransformId = (state: RootState, id: TransformId) => {
  return id;
};
export const selectTransformIds = (state: RootState) => {
  return state.session.present.transforms.allIds;
};
export const selectTransformMap = (state: RootState) => {
  return state.session.present.transforms.byId;
};

// Select all transforms from the store
export const selectTransforms = createSelector(
  [selectTransformIds, selectTransformMap],
  (ids, transforms): Transform[] => ids.map((id) => transforms[id])
);

export const selectTransformsByIds = createSelector(
  [selectTransformMap, (state: RootState, ids: TransformId[]) => ids],
  (transforms, ids): (Transform | undefined)[] =>
    ids.map((id) => transforms[id])
);

// Select a specific transform from the store
export const selectTransform = createSelector(
  [selectTransformMap, selectTransformId],
  (transforms, id): Transform | undefined => transforms[id]
);
