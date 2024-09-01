import { useCellDrop } from "./useCellDrop";
import { useProjectDispatch } from "types/hooks";
import { FormatterProps } from "react-data-grid";
import { Row } from "features/Timeline/Timeline";
import { getTransport } from "tone";
import { BarsBeatsSixteenths } from "types/Transport/TransportFunctions";
import { onCellClick } from "types/Timeline/thunks/TimelineClickThunks";

interface CellFormatterProps extends FormatterProps<Row> {
  tick: number;
  time: BarsBeatsSixteenths;
  idle: boolean;
  className?: string;
}

export function CellFormatter(props: CellFormatterProps) {
  const dispatch = useProjectDispatch();
  const { row, column, tick, idle } = props;
  const { onTrack, onPatternTrack, id: trackId } = row;
  const columnIndex = parseInt(column.key);

  // Each cell can be a drop target for clips
  const [_, drop] = useCellDrop({ trackId, columnIndex, row });

  // Create a cursor to show the current position of the transport
  const Cursor = () => {
    const showCursor = idle && onTrack && tick === getTransport().ticks;
    if (!showCursor) return null;
    const bgColor = onPatternTrack ? "bg-emerald-500" : "bg-sky-500";
    const className = `${bgColor} w-[2px] -left-[2px] h-full absolute pointer-events-none`;
    return <div className={className} />;
  };

  // Render the cell with a cursor
  return (
    <div
      ref={drop}
      className={props.className}
      onClick={() => dispatch(onCellClick(columnIndex, props.row.id))}
    >
      <Cursor />
    </div>
  );
}
