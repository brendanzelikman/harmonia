import { connect, ConnectedProps } from "react-redux";
import { useCallback } from "react";
import { createPortal } from "react-dom";
import {
  selectClips,
  selectRoot,
  selectSelectedClips,
  selectSelectedTranspositions,
  selectTranspositions,
} from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId } from "types/clip";
import { JSON } from "types/units";
import { PatternStream } from "types/pattern";
import { Row } from "..";
import {
  createClips,
  createClipsAndTranspositions,
  updateClips,
  updateClipsAndTranspositions,
} from "redux/slices/clips";
import { setSelectedClips, setSelectedTranspositions } from "redux/slices/root";
import TimelineClip from "./Clip";
import { DataGridHandle } from "react-data-grid";
import { Transposition, TranspositionId } from "types/transposition";
import {
  createTranspositions,
  updateTranspositions,
} from "redux/slices/transpositions";
import { TrackId } from "types";

export type ClipStreamRecord = Record<ClipId, JSON<PatternStream>>;
interface TimelineClipsProps {
  timeline: DataGridHandle;
  rows: Row[];
  trackRowMap: Record<TrackId, Row>;
}

const mapStateToProps = (state: RootState, ownProps: TimelineClipsProps) => {
  const clips = selectClips(state);
  const transpositions = selectTranspositions(state);
  const { selectedClipIds, selectedTranspositionIds } = selectRoot(state);
  const selectedClips = selectSelectedClips(state);
  const selectedTranspositions = selectSelectedTranspositions(state);

  return {
    ...ownProps,
    clips,
    transpositions,
    selectedClips,
    selectedTranspositions,
    selectedClipIds: selectedClipIds || [],
    selectedTranspositionIds: selectedTranspositionIds || [],
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    selectClips: (clipIds: ClipId[]) => {
      dispatch(setSelectedClips(clipIds));
    },
    selectTranspositions: (transpositionIds: TranspositionId[]) => {
      dispatch(setSelectedTranspositions(transpositionIds));
    },
    createClips: (clips: Partial<Clip>[]) => {
      return dispatch(createClips(clips));
    },
    updateClips: (clips: Partial<Clip>[]) => {
      dispatch(updateClips({ clips, transpositions: [] }));
    },
    createTranspositions: (transpositions: Transposition[]) => {
      dispatch(createTranspositions(transpositions));
    },
    updateTranspositions: (transpositions: Transposition[]) => {
      dispatch(updateTranspositions({ clips: [], transpositions }));
    },
    createClipsAndTranspositions(
      clips: Partial<Clip>[],
      transpositions: Partial<Transposition>[]
    ) {
      return dispatch(createClipsAndTranspositions(clips, transpositions));
    },
    updateClipsAndTranspositions(
      clips: Partial<Clip>[],
      transpositions: Partial<Transposition>[]
    ) {
      return dispatch(updateClipsAndTranspositions(clips, transpositions));
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
