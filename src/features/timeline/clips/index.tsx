import { connect, ConnectedProps } from "react-redux";
import { useCallback } from "react";
import { createPortal } from "react-dom";
import { selectClips, selectRoot, selectTransforms } from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId } from "types/clip";
import { JSON } from "types/units";
import { PatternStream } from "types/pattern";
import { Row } from "..";
import {
  createClips,
  createClipsAndTransforms,
  updateClips,
  updateClipsAndTransforms,
} from "redux/slices/clips";
import { setSelectedClips, setSelectedTransforms } from "redux/slices/root";
import TimelineClip from "./Clip";
import { DataGridHandle } from "react-data-grid";
import { Transform, TransformId } from "types/transform";
import { createTransforms, updateTransform } from "redux/slices/transforms";

export type ClipStreamRecord = Record<ClipId, JSON<PatternStream>>;
interface TimelineClipsProps {
  timeline: DataGridHandle;
  rows: Row[];
}

const mapStateToProps = (state: RootState, ownProps: TimelineClipsProps) => {
  const clips = selectClips(state);
  const transforms = selectTransforms(state);
  const { selectedClipIds, selectedTransformIds } = selectRoot(state);

  return {
    ...ownProps,
    clips,
    transforms,
    selectedClipIds: selectedClipIds || [],
    selectedTransformIds: selectedTransformIds || [],
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    selectClips: (clipIds: ClipId[]) => {
      dispatch(setSelectedClips(clipIds));
    },
    selectTransforms: (transformIds: TransformId[]) => {
      dispatch(setSelectedTransforms(transformIds));
    },
    createClips: (clips: Partial<Clip>[]) => {
      return dispatch(createClips(clips));
    },
    updateClips: (clips: Partial<Clip>[]) => {
      dispatch(updateClips(clips));
    },
    createTransforms: (transforms: Transform[]) => {
      dispatch(createTransforms(transforms));
    },
    updateTransforms: (transforms: Transform[]) => {
      transforms.forEach((transform) => {
        dispatch(updateTransform(transform));
      });
    },
    createClipsAndTransforms(
      clips: Partial<Clip>[],
      transforms: Partial<Transform>[]
    ) {
      return dispatch(createClipsAndTransforms(clips, transforms));
    },
    updateClipsAndTransforms(
      clips: Partial<Clip>[],
      transforms: Partial<Transform>[]
    ) {
      return dispatch(updateClipsAndTransforms(clips, transforms));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export interface ClipsProps extends Props, TimelineClipsProps {}

export default connector(TimelineClips);

function TimelineClips(props: ClipsProps) {
  const element = props.timeline.element;
  if (!element) return null;

  const renderClip = useCallback(
    (clip: Clip) => <TimelineClip {...props} key={clip.id} clip={clip} />,
    [props]
  );

  return createPortal(props.clips.map(renderClip), element);
}
