import { connect, ConnectedProps } from "react-redux";
import { useCallback } from "react";
import { createPortal } from "react-dom";
import { selectClips, selectSelectedClipIds } from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId } from "types/clips";
import { JSON } from "types/units";
import { PatternStream } from "types/patterns";
import { Row } from "..";
import { createClips, updateClips } from "redux/slices/clips";
import { selectClips as selectAllClips } from "redux/slices/root";
import TimelineClip from "./Clip";
import { DataGridHandle } from "react-data-grid";
import { Transform } from "types/transform";
import { createTransforms, updateTransform } from "redux/slices/transforms";

export type ClipStreamRecord = Record<ClipId, JSON<PatternStream>>;
interface TimelineClipsProps {
  timeline: DataGridHandle;
  rows: Row[];
}

const mapStateToProps = (state: RootState, ownProps: TimelineClipsProps) => {
  const clips = selectClips(state);
  const selectedIds = selectSelectedClipIds(state);

  return { ...ownProps, clips, selectedIds };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    createClips: (clips: Partial<Clip>[]) => {
      return dispatch(createClips(clips));
    },
    selectClips: (clipIds: ClipId[]) => {
      dispatch(selectAllClips(clipIds));
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
