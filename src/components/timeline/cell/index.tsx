import { FormatterProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import { selectRoot, selectTrack, selectTransport } from "redux/selectors";
import * as Slices from "redux/slices";
import { AppDispatch, AppThunk, RootState } from "redux/store";

import { isPatternTrack, TrackId } from "types/tracks";

import { Row } from "..";
import { CellComponent } from "./Cell";
import { seekTransport } from "redux/thunks/transport";
import { createPatternClip } from "redux/thunks/clips";
import { setSelectedTrack } from "redux/slices/root";

function mapStateToProps(state: RootState, ownProps: FormatterProps<Row>) {
  const root = selectRoot(state);
  const transport = selectTransport(state);
  const columnIndex = Number(ownProps.column.key);

  const trackId = ownProps.row.trackId;
  const track = !!trackId ? selectTrack(state, trackId) : undefined;
  const isPattern = !!track && isPatternTrack(track);

  const isMeasure = columnIndex % (transport.timeSignature?.[0] || 16) === 1;
  const isQuarter = columnIndex % 4 === 1;
  const onTime = columnIndex - 1 === transport.time;
  const isStarted = transport.state === "started";

  return {
    ...ownProps,
    columnIndex,
    isMeasure,
    isQuarter,
    onTime,
    isStarted,
    trackId,
    isPatternTrack: isPattern,
    selectedTrackId: root.selectedTrackId,
    addingClip: root.timelineState === "adding",
    transposingClip: root.timelineState === "transposing",
  };
}

const onClick =
  (columnIndex: number, trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const time = columnIndex - 1;

    // If no track is selected, seek the transport to the time
    if (!trackId) {
      dispatch(seekTransport(time));
      dispatch(Slices.Root.deselectAllClips());
      dispatch(Slices.Root.deselectAllTransforms());
      return;
    }
    const state = getState();
    const root = selectRoot(state);
    const { toolkit, selectedPatternId } = root;

    const chromaticTranspose = toolkit.chromaticTranspose ?? 0;
    const scalarTranspose = toolkit.scalarTranspose ?? 0;
    const chordalTranspose = toolkit.chordalTranspose ?? 0;

    const track = selectTrack(state, trackId);
    const onPatternTrack = !!track && isPatternTrack(track);
    const adding = root.timelineState === "adding";

    // Create a clip if adding and on a pattern track
    if (adding && selectedPatternId && onPatternTrack) {
      dispatch(createPatternClip(trackId, selectedPatternId, time));
      return;
    }

    // Create a transform if transposing
    if (root.timelineState === "transposing") {
      dispatch(
        Slices.Transforms.createTransform({
          trackId,
          time,
          chromaticTranspose,
          scalarTranspose,
          chordalTranspose,
        })
      );
      return;
    }

    // Seek the transport to the time
    dispatch(seekTransport(time));

    // Select the track
    if (trackId) dispatch(setSelectedTrack(trackId));

    // Deselect all clips and transforms
    dispatch(Slices.Root.deselectAllClips());
    dispatch(Slices.Root.deselectAllTransforms());
  };

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    onClick: (columnIndex: number, trackId?: TrackId) => {
      dispatch(onClick(columnIndex, trackId));
    },
    setSelectedTrack: (trackId?: TrackId) => {
      dispatch(setSelectedTrack(trackId));
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
