import { CellProps } from ".";
import { useCellDrop } from "./dnd";

export function CellComponent(props: CellProps) {
  const [{ isOver, canDrop }, drop] = useCellDrop(props);
  if (!props.trackId) return null;

  const droppingClass = isOver && canDrop ? "bg-slate-600" : "";

  const addingClipClass =
    props.addingClip && props.isPatternTrack
      ? "animate-pulse cursor-brush bg-sky-400/20 hover:bg-sky-700/50 hover:ring-inset hover:ring-1 hover:ring-gray-300/80"
      : "";

  const transposingClipClass =
    props.transposingClip && props.trackId
      ? "animate-pulse cursor-wand hover:bg-fuchsia-500/50 bg-fuchsia-500/20"
      : "";

  const measureClass =
    props.isMeasure && props.columnIndex > 1
      ? "border-l-2 border-l-white/20"
      : props.isQuarter
      ? "border-l border-l-white/20"
      : "border-l-0.5 border-l-slate-700/50";

  return (
    <div
      ref={drop}
      className={`cursor-pointer border-t border-t-white/20 text-white w-full h-full ${measureClass} ${droppingClass} ${addingClipClass} ${transposingClipClass}`}
      onClick={() => props.onClick(props.columnIndex, props.trackId)}
    ></div>
  );
}
