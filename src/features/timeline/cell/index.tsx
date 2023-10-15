import { FormatterProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import {
  selectTimeline,
  selectTickFromColumn,
  selectTrackById,
  selectTransport,
} from "redux/selectors";
import { AppDispatch, RootState } from "redux/store";
import { TrackId } from "types/Track";
import { Row } from "..";
import { CellComponent } from "./Cell";
import { isPatternTrack } from "types/PatternTrack";
import { convertTicksToBarsBeatsSixteenths } from "types/Transport";
import { onCellClick, setSelectedTrackId } from "redux/Timeline";
import { Transport } from "tone";
import { isAddingClips, isAddingTranspositions } from "types/Timeline";

function mapStateToProps(state: RootState, ownProps: FormatterProps<Row>) {
  const columnIndex = Number(ownProps.column.key);
  const trackId = ownProps.row.trackId;
  const transport = selectTransport(state);

  // Timeline properties
  const timeline = selectTimeline(state);
  const adding = isAddingClips(timeline);
  const transposing = isAddingTranspositions(timeline);

  // Tick properties
  const tick = selectTickFromColumn(state, columnIndex - 1);
  const { beats, sixteenths } = convertTicksToBarsBeatsSixteenths(
    transport,
    tick
  );
  const isMeasure = beats === 0 && sixteenths === 0;

  // Transport properties
  const onTime = tick === Transport.ticks;
  const isStarted = transport.state === "started";
  const idle = !adding && !transposing && !transport.recording && !isStarted;

  // Track properties
  const track = !!trackId ? selectTrackById(state, trackId) : undefined;
  const onPatternTrack = !!track && isPatternTrack(track);
  const isSelected = timeline.selectedTrackId === trackId;
  const showCursor = idle && onTime && isSelected;

  // The background corresponds to the timeline state
  const backgroundClass =
    adding && onPatternTrack
      ? "animate-pulse cursor-paintbrush bg-sky-400/25 hover:bg-sky-700/50"
      : transposing && trackId
      ? "animate-pulse cursor-wand hover:bg-fuchsia-500/50 bg-fuchsia-500/25"
      : "bg-transparent";

  // Left border is white for measure lines, slate for other lines
  const borderClass = `border-t border-t-white/20 ${
    isMeasure && columnIndex > 1
      ? "border-l-2 border-l-white/20"
      : "border-l-0.5 border-l-slate-700/50"
  }`;

  // Cursor is green for pattern tracks, blue for scale tracks
  const cursorColor =
    ownProps.row.type === "patternTrack" ? "bg-emerald-500" : "bg-sky-500";

  // Cursor pulses when not playing
  const cursorAnimation = `animate-pulse transition-all duration-75 ${
    showCursor ? "block" : "hidden"
  } pointer-events-none`;

  // Cursor position is offset by a bit
  const cursorPosition = `w-[2px] -left-[2px] h-full absolute`;

  // Assemble the cursor class
  const cursorClass = `${cursorColor} ${cursorAnimation} ${cursorPosition}`;

  return {
    ...ownProps,
    columnIndex,
    trackId,
    backgroundClass,
    borderClass,
    showCursor,
    cursorClass,
  };
}

function mapDispatchToProps(
  dispatch: AppDispatch,
  ownProps: FormatterProps<Row>
) {
  const { trackId } = ownProps.row;
  const columnIndex = Number(ownProps.column.key);
  return {
    onClick: () => {
      dispatch(onCellClick(columnIndex, trackId));
    },
    setSelectedTrack: (trackId?: TrackId) => {
      dispatch(setSelectedTrackId(trackId));
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
