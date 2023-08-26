import { selectRoot, selectTransport } from "redux/selectors";
import { createTransform } from "redux/slices/transforms";
import { AppThunk } from "redux/store";

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
