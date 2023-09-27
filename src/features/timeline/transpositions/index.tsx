import { connect, ConnectedProps } from "react-redux";
import { useCallback } from "react";
import { createPortal } from "react-dom";
import { AppDispatch, RootState } from "redux/store";
import { Row } from "..";
import TimelineTransposition from "./Transposition";
import { DataGridHandle } from "react-data-grid";
import { Transposition } from "types/transposition";
import {
  createTranspositions,
  deleteTranspositions,
  updateTranspositions,
} from "redux/slices/transpositions";
import { selectTranspositions } from "redux/selectors/transpositions";
import {
  selectCellWidth,
  selectRoot,
  selectSelectedClips,
  selectSelectedTranspositions,
  selectTrackParents,
} from "redux/selectors";
import { Clip } from "types/clip";
import {
  createClipsAndTranspositions,
  updateClipsAndTranspositions,
} from "redux/slices/clips";
import { toggleTransposingClip } from "redux/slices/timeline";
import { setSelectedClips, setSelectedTranspositions } from "redux/slices/root";
import { TrackId } from "types/tracks";

interface TimelineTranspositionsProps {
  timeline: DataGridHandle;
  rows: Row[];
  trackRowMap: Record<TrackId, Row>;
  backgroundWidth: number;
}

const mapStateToProps = (
  state: RootState,
  ownProps: TimelineTranspositionsProps
) => {
  const { toolkit, selectedTrackId } = selectRoot(state);
  const transpositions = selectTranspositions(state);
  const selectedClips = selectSelectedClips(state);
  const selectedTranspositions = selectSelectedTranspositions(state);
  const selectedTrackParents = selectTrackParents(state, selectedTrackId);
  const canTransposeScale = !!selectedTrackParents.length;
  const cellWidth = selectCellWidth(state);

  return {
    ...ownProps,
    ...toolkit,
    transpositions,
    selectedTrackId,
    selectedClips,
    selectedTranspositions,
    selectedTrackParents,
    canTransposeScale,
    cellWidth,
  };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    createTransposition: (transposition: Partial<Transposition>) => {
      return dispatch(createTranspositions([transposition]));
    },
    deleteTransposition: (transposition: Transposition) => {
      dispatch(deleteTranspositions([transposition]));
    },
    updateTransposition: (transposition: Partial<Transposition>) => {
      dispatch(
        updateTranspositions({ transpositions: [transposition], clips: [] })
      );
    },
    toggleTransposingClip: () => {
      dispatch(toggleTransposingClip());
    },
    createClipsAndTranspositions(
      clips: Partial<Clip>[],
      transpositions: Partial<Transposition>[]
    ) {
      return dispatch(createClipsAndTranspositions(clips, transpositions)).then(
        ({ clipIds, transpositionIds }) => {
          if (clipIds.length) {
            dispatch(setSelectedClips(clipIds));
          }
          if (transpositionIds.length) {
            setSelectedTranspositions(transpositionIds);
          }
        }
      );
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

export interface TranspositionsProps
  extends Props,
    TimelineTranspositionsProps {}

export default connector(TimelineTranspositions);

function TimelineTranspositions(props: TranspositionsProps) {
  const element = props.timeline.element;
  if (!element) return null;

  const renderTransposition = useCallback(
    (transposition: Transposition) => (
      <TimelineTransposition
        {...props}
        key={transposition.id}
        transposition={transposition}
      />
    ),
    [props]
  );

  return createPortal(props.transpositions.map(renderTransposition), element);
}
