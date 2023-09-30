import { CellProps } from ".";
import { useCellDrop } from "./dnd";

export function CellComponent(props: CellProps) {
  const { trackId, showCursor, backgroundClass, row } = props;

  // Cell drop hook with react-dnd
  const [{ isOver, canDrop }, drop] = useCellDrop(props);

  // If the cell is empty, then deselect the selected track
  if (!trackId) {
    return (
      <div
        className="w-full h-full bg-transparent"
        onClick={() => props.setSelectedTrack(undefined)}
      />
    );
  }

  const background = isOver && canDrop ? "bg-sky-950/30" : backgroundClass;
  return (
    <div
      ref={drop}
      className={`relative border-t border-t-white/20 text-white w-full h-full ${props.leftBorderClass} ${background}`}
      onClick={props.onClick}
    >
      {showCursor ? (
        <div
          className={`w-[2px] h-full absolute -left-[2px] ${
            row.type === "patternTrack" ? "bg-emerald-500" : "bg-sky-500"
          } animate-pulse`}
        />
      ) : null}
    </div>
  );
}
