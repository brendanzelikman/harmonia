import { CellProps } from ".";
import { useCellDrop } from "./dnd";

export function CellComponent(props: CellProps) {
  const [{ isOver, canDrop }, drop] = useCellDrop(props);
  if (!props.trackId)
    return (
      <div
        className="w-full h-full bg-transparent"
        onClick={() => props.setSelectedTrack(undefined)}
      ></div>
    );
  const backgroundClass =
    isOver && canDrop ? "bg-sky-950/30" : props.backgroundClass;

  const onClick = () => props.onClick(props.tick, props.trackId);

  return (
    <div
      ref={drop}
      className={`relative cursor-pointer border-t border-t-white/20 text-white w-full h-full ${props.leftBorderClass} ${backgroundClass}`}
      onClick={onClick}
    >
      {props.showCursor ? (
        <div
          className={`w-[2px] h-full absolute -left-[2px] ${
            props.row.type === "patternTrack" ? "bg-emerald-500" : "bg-sky-500"
          } animate-pulse`}
        ></div>
      ) : null}
    </div>
  );
}
