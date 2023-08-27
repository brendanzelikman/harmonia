import {
  selectRoot,
  selectTransformsByIds,
  selectTransport,
} from "redux/selectors";
import { createTransform, updateTransforms } from "redux/slices/transforms";
import { AppThunk } from "redux/store";
import { TransformCoordinate } from "types/transform";

export const addTransformToTimeline = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const { toolkit, selectedTrackId } = selectRoot(state);
  if (!selectedTrackId) return;

  const { time } = selectTransport(state);
  const { chromaticTranspose, scalarTranspose, chordalTranspose } = toolkit;

  return dispatch(
    createTransform({
      trackId: selectedTrackId,
      chromaticTranspose,
      scalarTranspose,
      chordalTranspose,
      time,
    })
  );
};

export const updateSelectedTransforms =
  (coordinate: Partial<TransformCoordinate>): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { selectedTransformIds } = selectRoot(state);
    if (!selectedTransformIds.length) return;

    const selectedTransforms = selectTransformsByIds(
      state,
      selectedTransformIds
    );
    const updatedTransforms = selectedTransforms.map((transform) => ({
      ...transform,
      chromaticTranspose: coordinate.N ?? transform.chromaticTranspose,
      scalarTranspose: coordinate.T ?? transform.scalarTranspose,
      chordalTranspose: coordinate.t ?? transform.chordalTranspose,
    }));
    dispatch(updateTransforms(updatedTransforms));
  };

export const offsetSelectedTransforms =
  (offset: TransformCoordinate): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { selectedTransformIds } = selectRoot(state);
    if (!selectedTransformIds.length) return;

    const selectedTransforms = selectTransformsByIds(
      state,
      selectedTransformIds
    );
    const updatedTransforms = selectedTransforms.map((transform) => ({
      ...transform,
      chromaticTranspose: transform.chromaticTranspose + offset.N,
      scalarTranspose: transform.scalarTranspose + offset.T,
      chordalTranspose: transform.chordalTranspose + offset.t,
    }));
    dispatch(updateTransforms(updatedTransforms));
  };
