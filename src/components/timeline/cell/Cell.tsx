import { useCallback } from "react";
import { CellProps } from ".";
import { useCellDrop } from "./dnd";

export function CellComponent(props: CellProps) {
  const [{ isOver, canDrop }, drop] = useCellDrop(props);

  const Cursor = useCallback(() => {
    if (props.addingClip || props.transposingClip) return null;
    if (!props.onTime || props.selectedTrackId !== props.trackId) return null;
    if (props.isStarted) return null;

    return (
      <div
        className={`w-[2px] h-full absolute -left-[2px] ${
          props.row.type === "patternTrack" ? "bg-emerald-500" : "bg-sky-500"
        } animate-pulse`}
      ></div>
    );
  }, [
    props.addingClip,
    props.row.type,
    props.transposingClip,
    props.onTime,
    props.selectedTrackId,
    props.trackId,
    props.isStarted,
  ]);

  if (!props.trackId)
    return (
      <div
        className="w-full h-full bg-transparent"
        onClick={() => props.setSelectedTrack(undefined)}
      ></div>
    );

  const backgroundClass =
    props.addingClip && props.isPatternTrack
      ? "animate-pulse cursor-brush bg-sky-400/25 hover:bg-sky-700/50"
      : props.transposingClip && props.trackId
      ? "animate-pulse cursor-wand hover:bg-fuchsia-500/50 bg-fuchsia-500/25"
      : isOver && canDrop
      ? "bg-sky-950/30"
      : props.selectedTrackId === props.trackId
      ? "bg-slate-400/40"
      : "bg-slate-500/50";

  const leftBorderClass =
    props.isMeasure && props.columnIndex > 1
      ? "border-l-2 border-l-white/20"
      : props.isQuarter
      ? "border-l border-l-white/20"
      : "border-l-0.5 border-l-slate-700/50";

  return (
    <div
      ref={drop}
      className={`relative cursor-pointer border-t border-t-white/20 text-white w-full h-full ${leftBorderClass} ${backgroundClass}`}
      onClick={() => props.onClick(props.columnIndex, props.trackId)}
    >
      <Cursor />
    </div>
  );
}
