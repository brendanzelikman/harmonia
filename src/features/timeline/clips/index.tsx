import { connect, ConnectedProps } from "react-redux";
import { MouseEvent, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  selectClips,
  selectRoot,
  selectSelectedClips,
  selectSelectedTranspositions,
  selectTimeline,
  selectTranspositions,
} from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { Clip, ClipId } from "types/Clip";
import { JSON } from "types/units";
import { PatternStream } from "types/Pattern";
import { Row } from "..";
import { createClips, updateClips } from "redux/Clip";
import { setSelectedClips, setSelectedTranspositions } from "redux/Root";
import TimelineClip from "./Clip";
import { DataGridHandle } from "react-data-grid";
import { Transposition, TranspositionId } from "types/Transposition";
import {
  createTranspositions,
  updateTranspositions,
} from "redux/Transposition";
import { TrackId } from "types/Track";
import { createMedia, updateMedia } from "redux/Media";
import { onClipClick } from "redux/Timeline";

export type ClipStreamRecord = Record<ClipId, JSON<PatternStream>>;
interface TimelineClipsProps {
  timeline: DataGridHandle;
  rows: Row[];
  trackRowMap: Record<TrackId, Row>;
}

const mapStateToProps = (state: RootState, ownProps: TimelineClipsProps) => {
  const clips = selectClips(state);
  const transpositions = selectTranspositions(state);
  const { selectedPatternId, selectedClipIds, selectedTranspositionIds } =
    selectRoot(state);
  const timeline = selectTimeline(state);
  const selectedClips = selectSelectedClips(state);
  const selectedTranspositions = selectSelectedTranspositions(state);

  return {
    ...ownProps,
    clips,
    transpositions,
    selectedClips,
    selectedTranspositions,
    addingClip: timeline.state === "adding",
    subdivision: timeline.subdivision,
    selectedPatternId,
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
    onClipClick: (e: MouseEvent, clip: Clip, eyedropping = false) => {
      dispatch(onClipClick(e, clip, eyedropping));
    },
    createMedia(
      clips: Partial<Clip>[],
      transpositions: Partial<Transposition>[]
    ) {
      return dispatch(createMedia(clips, transpositions));
    },
    updateMedia(
      clips: Partial<Clip>[],
      transpositions: Partial<Transposition>[]
    ) {
      return dispatch(updateMedia(clips, transpositions));
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
