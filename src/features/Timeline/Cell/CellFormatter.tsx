import classNames from "classnames";
import { useCellDrop } from "./useCellDrop";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { onCellClick } from "redux/thunks";
import { FormatterProps } from "react-data-grid";
import { Row } from "../Timeline";
import { selectColumnTicks, selectTimeline } from "redux/Timeline";
import { selectTrackById } from "redux/Track";
import { selectTransport } from "redux/Transport";
import { isPatternTrack } from "types/PatternTrack";
import {
  isTimelineAddingClips,
  isTimelineAddingPoses,
  isTimelinePortalingMedia,
} from "types/Timeline";
import {
  convertTicksToFormattedTime,
  isTransportStarted,
} from "types/Transport";
import { Transport } from "tone";
import { hasKeys } from "utils/objects";

export function CellFormatter(props: FormatterProps<Row>) {
  const dispatch = useProjectDispatch();
  const { row, column } = props;
  const columnIndex = parseInt(column.key);

  // Track properties
  const trackId = props.row.trackId;
  const track = useProjectSelector((_) => selectTrackById(_, trackId));
  const onPatternTrack = !!track && isPatternTrack(track);

  // Timeline properties
  const timeline = useProjectSelector(selectTimeline);
  const isAdding = onPatternTrack && isTimelineAddingClips(timeline);
  const isTransposing = isTimelineAddingPoses(timeline);
  const isPortaling = isTimelinePortalingMedia(timeline);
  const isTrackSelected = timeline.selectedTrackId === trackId;
  const fragment = timeline.mediaDraft.portal;

  // Tick/measure properties
  const transport = useProjectSelector(selectTransport);
  const isStarted = isTransportStarted(transport) || transport.recording;
  const tick = useProjectSelector((_) => selectColumnTicks(_, columnIndex - 1));
  const { beats, sixteenths } = convertTicksToFormattedTime(transport, tick);
  const onTime = tick === Transport.ticks;
  const isMeasure = beats === 0 && sixteenths === 0;

  // Timeline cursor properties
  const idle = !isAdding && !isTransposing && !isPortaling && !isStarted;
  const showCursor = idle && onTime && isTrackSelected;
  const timelineCursor = classNames(
    "w-[2px] -left-[2px] h-full absolute animate-pulse transition-all duration-75 pointer-events-none",
    row.type === "patternTrack" ? "bg-emerald-500" : "bg-sky-500",
    showCursor ? "block" : "hidden"
  );

  // A custom hook for dropping media into cells
  const [{ isOver, canDrop }, drop] = useCellDrop({
    trackId,
    columnIndex,
    row,
  });

  // The left border is white for measure lines, slate for other lines
  const border = classNames(
    "border-t border-t-white/20",
    { "border-l-2 border-l-white/20": isMeasure && columnIndex > 1 },
    { "border-l-0.5 border-l-slate-700/50": !isMeasure || columnIndex <= 1 }
  );

  // The user cursor corresponds to the timeline state
  const cursor = classNames(
    { "cursor-paintbrush": isAdding && onPatternTrack },
    { "cursor-wand": isTransposing && trackId },
    { "cursor-pointer": isPortaling }
  );

  // The cell background changes heavily based on the state.
  const background =
    isOver && canDrop
      ? "bg-sky-950/30"
      : isAdding && onPatternTrack
      ? "animate-pulse bg-sky-400/25 hover:bg-sky-700/50"
      : isTransposing && trackId
      ? "animate-pulse hover:bg-fuchsia-500/50 bg-fuchsia-500/25"
      : isPortaling
      ? !hasKeys(fragment)
        ? "animate-pulse hover:bg-sky-400/50 bg-sky-400/25"
        : "animate-pulse hover:bg-orange-400/50 bg-orange-400/25"
      : "bg-transparent";

  // Assemble the class
  const className = classNames(
    "relative text-white w-full h-full",
    border,
    cursor,
    background
  );

  /** The cell click handler is handled by a separate thunk. */
  const onClick = () => dispatch(onCellClick(columnIndex, trackId));

  // If not on a track, return a blank cell that can still seek the transport
  if (!trackId) {
    return <div className="w-full h-full bg-transparent" onClick={onClick} />;
  }

  // Otherwise, return the cell
  return (
    <div ref={drop} className={className} onClick={onClick}>
      <div className={timelineCursor} />
    </div>
  );
}
