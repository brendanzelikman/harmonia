import { MAX_SUBDIVISION } from "appConstants";
import { FormatterProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import {
  selectRoot,
  selectTrack,
  selectTrackTransformAtTime,
} from "redux/selectors";
import * as Slices from "redux/slices";
import { AppDispatch, AppThunk, RootState } from "redux/store";

import { isPatternTrack, TrackId } from "types/tracks";

import { Row } from "..";
import { CellComponent } from "./Cell";

const deleteSelectedClips = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const root = selectRoot(state);
  if (!root) return;
  const { selectedClipIds } = root;
  selectedClipIds.forEach((id) => dispatch(Slices.Clips.deleteClip(id)));
  dispatch(Slices.Root.deselectAllClips());
};

function mapStateToProps(state: RootState, ownProps: FormatterProps<Row>) {
  const root = selectRoot(state);
  const columnIndex = Number(ownProps.column.key);

  const trackId = ownProps.row.trackId;
  const track = !!trackId ? selectTrack(state, trackId) : undefined;
  const isPattern = !!track && isPatternTrack(track);

  const isMeasure = columnIndex % MAX_SUBDIVISION === 1;
  const isQuarter = columnIndex % 4 === 1;

  return {
    ...ownProps,
    columnIndex,
    isMeasure,
    isQuarter,
    trackId,
    isPatternTrack: isPattern,
    addingClip: root.timelineState === "adding",
    transposingClip: root.timelineState === "transposing",
  };
}

const onClick =
  (columnIndex: number, trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const time = columnIndex - 1;
    if (!trackId) {
      dispatch(Slices.Transport.seekTransport(time));
      dispatch(Slices.Root.deselectAllClips());
      return;
    }
    const state = getState();
    const root = selectRoot(state);
    const { activePatternId } = root;
    const scalarTranspose = root.scalarTranspose ?? 0;
    const chordalTranspose = root.chordalTranspose ?? 0;

    const track = selectTrack(state, trackId);
    const onPatternTrack = !!track && isPatternTrack(track);

    if (root.timelineState === "adding" && activePatternId && onPatternTrack) {
      dispatch(Slices.Clips.createPatternClip(trackId, activePatternId, time));
    } else if (root.timelineState === "transposing") {
      dispatch(
        Slices.Transforms.createTransform({
          trackId,
          time,
          scalarTranspose,
          chordalTranspose,
        })
      );
    } else {
      dispatch(Slices.Transport.seekTransport(time));
      dispatch(Slices.Root.deselectAllClips());
    }
  };

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    onClick: (columnIndex: number, trackId?: TrackId) => {
      dispatch(onClick(columnIndex, trackId));
    },
    deleteSelectedClips: () => {
      dispatch(deleteSelectedClips());
    },
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export interface CellProps extends Props {
  columnIndex: number;
  rows: Row[];
}

export default connector(CellComponent);
