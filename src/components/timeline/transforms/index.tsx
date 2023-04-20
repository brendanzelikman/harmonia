import { connect, ConnectedProps } from "react-redux";
import { useCallback } from "react";
import { createPortal } from "react-dom";
import { AppDispatch, RootState } from "redux/store";
import { Row } from "..";
import TimelineTransform from "./Transform";
import { DataGridHandle } from "react-data-grid";
import { Transform } from "types/transform";
import {
  createTransform,
  deleteTransform,
  updateTransform,
} from "redux/slices/transforms";
import { selectTransforms } from "redux/selectors/transforms";
import { selectRoot } from "redux/selectors";
import { toggleTransposingClip } from "redux/slices/root";

interface TimelineTransformsProps {
  timeline: DataGridHandle;
  rows: Row[];
}

const mapStateToProps = (
  state: RootState,
  ownProps: TimelineTransformsProps
) => {
  const transforms = selectTransforms(state);
  const root = selectRoot(state);
  const { timelineState, draggingClip } = root;
  const { chromaticTranspose, scalarTranspose, chordalTranspose } = root;

  const transposing = timelineState === "transposing";

  return {
    ...ownProps,
    transforms,
    transposing,
    draggingClip,
    chromaticTranspose,
    scalarTranspose,
    chordalTranspose,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    createTransform: (transform: Partial<Transform>) => {
      return dispatch(createTransform(transform));
    },
    deleteTransform: (transform: Transform) => {
      dispatch(deleteTransform(transform.id));
    },
    updateTransform: (transform: Partial<Transform>) => {
      dispatch(updateTransform(transform));
    },
    toggleTransposingClip: () => {
      dispatch(toggleTransposingClip());
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export interface TransformsProps extends Props, TimelineTransformsProps {}

export default connector(TimelineTransforms);

function TimelineTransforms(props: TransformsProps) {
  const element = props.timeline.element;
  if (!element) return null;

  const renderTransform = useCallback(
    (transform: Transform) => (
      <TimelineTransform {...props} key={transform.id} transform={transform} />
    ),
    [props]
  );

  return createPortal(props.transforms.map(renderTransform), element);
}
