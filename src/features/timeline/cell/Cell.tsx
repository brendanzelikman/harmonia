import { CellProps } from ".";
import { useCellDrop } from "./useCellDnd";

export function CellComponent(props: CellProps) {
  // Cell drop hook with react-dnd
  const [{ isOver, canDrop }, drop] = useCellDrop(props);
  const backgroundClass =
    isOver && canDrop ? "bg-sky-950/30" : props.backgroundClass;

  // If not on a track, return a blank cell that can still seek the transport
  const EmptyCell = (
    <div className="w-full h-full bg-transparent" onClick={props.onClick} />
  );
  if (!props.trackId) return EmptyCell;

  // Otherwise, return the cell
  const className = `relative text-white w-full h-full ${props.borderClass} ${backgroundClass}`;
  return (
    <div ref={drop} className={className} onClick={props.onClick}>
      <div className={props.cursorClass} />
    </div>
  );
}
