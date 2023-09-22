import { FormatterProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import {
  selectBarsBeatsSixteenths,
  selectRoot,
  selectTimeline,
  selectTimelineTick,
  selectTrack,
  selectTransport,
} from "redux/selectors";
import * as Slices from "redux/slices";
import { AppDispatch, AppThunk, RootState } from "redux/store";
import { isPatternTrack as isPattern, TrackId } from "types/tracks";
import { Row } from "..";
import { CellComponent } from "./Cell";
import { seekTransport } from "redux/thunks/transport";
import { createPatternClip } from "redux/thunks/clips";
import { setSelectedTrack } from "redux/slices/root";

function mapStateToProps(state: RootState, ownProps: FormatterProps<Row>) {
  const columnIndex = Number(ownProps.column.key);
  const trackId = ownProps.row.trackId;
  const root = selectRoot(state);

  // Timeline properties
  const timeline = selectTimeline(state);
  const adding = timeline.state === "adding";
  const transposing = timeline.state === "transposing";

  // Tick properties
  const tick = selectTimelineTick(state, columnIndex - 1);
  const { beats, sixteenths } = selectBarsBeatsSixteenths(state, tick);
  const isMeasure = beats === 0 && sixteenths === 0;

  // Transport properties
  const transport = selectTransport(state);
  const onTime = tick === transport.tick;
  const isStarted = transport.state === "started";
  const idle = !adding && !transposing && !transport.recording && !isStarted;

  // Track properties
  const track = !!trackId ? selectTrack(state, trackId) : undefined;
  const isPatternTrack = !!track && isPattern(track);
  const isSelected = root.selectedTrackId === trackId;
  const showCursor = idle && onTime && isSelected;

  // CSS properties
  const backgroundClass =
    adding && isPatternTrack
      ? "animate-pulse cursor-brush bg-sky-400/25 hover:bg-sky-700/50"
      : transposing && trackId
      ? "animate-pulse cursor-wand hover:bg-fuchsia-500/50 bg-fuchsia-500/25"
      : root.selectedTrackId === trackId
      ? "bg-slate-400/40"
      : "bg-slate-500/50";

  const leftBorderClass =
    isMeasure && columnIndex > 1
      ? "border-l-2 border-l-white/20"
      : "border-l-0.5 border-l-slate-700/50";

  return {
    ...ownProps,
    columnIndex,
    trackId,
    showCursor,
    backgroundClass,
    leftBorderClass,
  };
}

const onClick =
  (columnIndex: number, trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const tick = selectTimelineTick(state, columnIndex - 1);
    // If no track is selected, seek the transport to the time
    if (!trackId) {
      dispatch(seekTransport(tick));
      dispatch(Slices.Root.deselectAllClips());
      dispatch(Slices.Root.deselectAllTranspositions());
      return;
    }
    const root = selectRoot(state);
    const timeline = selectTimeline(state);
    const { toolkit, selectedPatternId } = root;

    const { transpositionOffsets, transpositionDuration } = toolkit;

    const track = selectTrack(state, trackId);
    const onPatternTrack = !!track && isPattern(track);
    const adding = timeline.state === "adding";

    // Create a clip if adding and on a pattern track
    if (adding && selectedPatternId && onPatternTrack) {
      dispatch(createPatternClip(trackId, selectedPatternId, tick));
      return;
    }

    // Create a transposition if transposing
    if (timeline.state === "transposing") {
      dispatch(
        Slices.Transpositions.createTranspositions([
          {
            trackId,
            tick,
            offsets: transpositionOffsets,
            duration: transpositionDuration || undefined,
          },
        ])
      );
      return;
    }

    // Seek the transport to the time
    dispatch(seekTransport(tick));

    // Select the track
    if (trackId) dispatch(setSelectedTrack(trackId));

    // Deselect all clips and transpositions
    dispatch(Slices.Root.deselectAllClips());
    dispatch(Slices.Root.deselectAllTranspositions());
  };

function mapDispatchToProps(
  dispatch: AppDispatch,
  ownProps: FormatterProps<Row>
) {
  const { trackId } = ownProps.row;
  const columnIndex = Number(ownProps.column.key);
  return {
    onClick: () => {
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
