import classNames from "classnames";
import { useCellDrop } from "./useCellDrop";
import { use, useProjectDispatch } from "types/hooks";
import { FormatterProps } from "react-data-grid";
import { hasKeys } from "utils/objects";
import { Row } from "features/Timeline/Timeline";
import { getTransport } from "tone";
import { BarsBeatsSixteenths } from "types/Transport/TransportFunctions";
import {
  selectPortalFragment,
  selectTimelineState,
} from "types/Timeline/TimelineSelectors";
import { selectIsTransportActive } from "types/Transport/TransportSelectors";
import { onCellClick } from "types/Timeline/TimelineThunks";
import { useDragState } from "types/Media/MediaTypes";

interface CellFormatterProps extends FormatterProps<Row> {
  tick: number;
  time: BarsBeatsSixteenths;
}

export function CellFormatter(props: CellFormatterProps) {
  const dispatch = useProjectDispatch();
  const { row, column, tick } = props;
  const { onTrack, onPatternTrack, id: trackId } = row;
  const columnIndex = parseInt(column.key);

  // Read the state of the timeline and transport
  const state = use(selectTimelineState);
  const fragment = use(selectPortalFragment);
  const isTransportActive = use(selectIsTransportActive);
  const isDraggingPatternClip = useDragState().draggingPatternClip;
  const addingPatternClips = state === "adding-pattern-clips" && onPatternTrack;
  const addingPoseClips = state === "adding-pose-clips" && !!trackId;
  const addingScaleClips = state === "adding-scale-clips" && !!trackId;
  const addingPortalClips = state === "portaling-clips" && !!trackId;
  const addingClips = addingPatternClips || addingPoseClips || addingScaleClips;

  // Each cell can be a drop target for clips
  const [CellDrop, drop] = useCellDrop({ trackId, columnIndex, row });
  const { isOver, canDrop } = CellDrop;

  // Each cell has a different left border depending on its bars/beats/sixteenths
  const { beats, sixteenths } = props.time;
  const isMeasure = beats === 0 && sixteenths === 0;
  const border = classNames(
    "border-t border-t-white/20",
    { "border-l-2 border-l-white/20": isMeasure && columnIndex > 1 },
    { "border-l-0.5 border-l-slate-700/50": !isMeasure || columnIndex <= 1 }
  );

  // The user cursor corresponds to the timeline state
  const cursor = classNames(
    { "cursor-paintbrush": addingPatternClips },
    { "cursor-portalgunb": addingPortalClips && !hasKeys(fragment) },
    { "cursor-portalguno": addingPortalClips && hasKeys(fragment) },
    { "cursor-wand": addingPoseClips },
    { "cursor-gethsemane": addingScaleClips },
    { "cursor-pointer": addingPortalClips }
  );

  // The cell background changes heavily based on the state.
  const background =
    isOver && canDrop && !(!onPatternTrack && isDraggingPatternClip)
      ? "bg-sky-950/30"
      : addingPatternClips
      ? "bg-teal-500/25 hover:bg-teal-500/50"
      : addingPoseClips
      ? "hover:bg-fuchsia-500/50 bg-fuchsia-500/25"
      : addingScaleClips
      ? "hover:bg-blue-500/50 bg-blue-500/25"
      : addingPortalClips
      ? !hasKeys(fragment)
        ? "hover:bg-sky-400/50 bg-sky-400/25"
        : "hover:bg-orange-400/50 bg-orange-400/25"
      : "bg-transparent";

  // Compile the classname
  const className = classNames("size-full", border, cursor, background);
  const onClick = () => dispatch(onCellClick(columnIndex, trackId));

  // If not on a track, return a blank cell that can still seek the transport
  if (!trackId) {
    return <div className="size-full bg-transparent" onClick={onClick} />;
  }

  // Otherwise, return the cell with a cursor
  const Cursor = () => {
    const idle = !addingClips && !isTransportActive;
    const showCursor = idle && onTrack && tick === getTransport().ticks;
    if (!showCursor) return null;
    const bgColor = onPatternTrack ? "bg-emerald-500" : "bg-sky-500";
    const className = `${bgColor} w-[2px] -left-[2px] h-full absolute pointer-events-none`;
    return <div className={className} />;
  };

  return (
    <div ref={drop} className={className} onClick={onClick}>
      <Cursor />
    </div>
  );
}
