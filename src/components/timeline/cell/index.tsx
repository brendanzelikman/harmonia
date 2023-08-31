import { FormatterProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import {
  selectRoot,
  selectTimelineBBS,
  selectTimelineTick,
  selectTrack,
  selectTransport,
} from "redux/selectors";
import * as Slices from "redux/slices";
import { AppDispatch, AppThunk, RootState } from "redux/store";
import { isPatternTrack, TrackId } from "types/tracks";
import { Row } from "..";
import { CellComponent } from "./Cell";
import { seekTransport } from "redux/thunks/transport";
import { createPatternClip } from "redux/thunks/clips";
import { setSelectedTrack } from "redux/slices/root";
import { Tick } from "types/units";

function mapStateToProps(state: RootState, ownProps: FormatterProps<Row>) {
  const root = selectRoot(state);
  const transport = selectTransport(state);
  const columnIndex = Number(ownProps.column.key);
  const tick = selectTimelineTick(state, columnIndex - 1);
  const { beats, sixteenths } = selectTimelineBBS(state, tick);
  const isMeasure = beats === 0 && sixteenths === 0;

  const trackId = ownProps.row.trackId;
  const track = !!trackId ? selectTrack(state, trackId) : undefined;
  const isPattern = !!track && isPatternTrack(track);

  const onTime = tick === transport.tick;
  const isStarted = transport.state === "started";
  const adding = root.timelineState === "adding";
  const transposing = root.timelineState === "transposing";

  const showCursor =
    !adding &&
    !transposing &&
    onTime &&
    root.selectedTrackId === trackId &&
    !isStarted;

  const backgroundClass =
    adding && isPattern
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
    tick,
    columnIndex,
    isMeasure,
    showCursor,
    trackId,
    isPatternTrack: isPattern,
    backgroundClass,
    leftBorderClass,
  };
}

const onClick =
  (tick: Tick, trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    // If no track is selected, seek the transport to the time
    if (!trackId) {
      dispatch(seekTransport(tick));
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
      dispatch(createPatternClip(trackId, selectedPatternId, tick));
      return;
    }

    // Create a transform if transposing
    if (root.timelineState === "transposing") {
      dispatch(
        Slices.Transforms.createTransform({
          trackId,
          tick,
          chromaticTranspose,
          scalarTranspose,
          chordalTranspose,
        })
      );
      return;
    }

    // Seek the transport to the time
    dispatch(seekTransport(tick));

    // Select the track
    if (trackId) dispatch(setSelectedTrack(trackId));

    // Deselect all clips and transforms
    dispatch(Slices.Root.deselectAllClips());
    dispatch(Slices.Root.deselectAllTransforms());
  };

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    onClick: (tick: Tick, trackId?: TrackId) => {
      dispatch(onClick(tick, trackId));
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
