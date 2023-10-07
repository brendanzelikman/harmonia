import { useCallback } from "react";
import { TimeProps } from ".";
import { useLoopDrag, useLoopDrop } from "./dnd";
import useKeyHolder from "hooks/useKeyHolder";

// The time is contained in the header
export function TimeFormatter(props: TimeProps) {
  const { loop, onLoopStart, onLoopEnd } = props;
  const heldKeys = useKeyHolder(["s", "e"]);

  // Loop start drag hook
  const [LoopStart, startDrag] = useLoopDrag({
    ...props,
    onEnd: (item: any) =>
      props.setLoopStart(item.hoverIndex - 1, props.subdivision),
  });
  // Loop end drag hook
  const [LoopEnd, endDrag] = useLoopDrag({
    ...props,
    onEnd: (item: any) =>
      props.setLoopEnd(item.hoverIndex - 1, props.subdivision),
  });

  // Loop point drop hook
  const [{ isOver }, drop] = useLoopDrop(props);

  // On click handler
  const onClick = useCallback(() => {
    // If holding s, set loop start
    if (loop && heldKeys.s) {
      props.setLoopStart(props.columnIndex - 1, props.subdivision);
      return;
    }
    // If holding e, set loop end
    if (loop && heldKeys.e) {
      props.setLoopEnd(props.columnIndex - 1, props.subdivision);
      return;
    }
    // Otherwise, click on tick
    props.onClick(props.tick);
  }, [loop, props.subdivision, heldKeys.s, heldKeys.e]);

  const padding = loop
    ? onLoopStart
      ? "pl-3"
      : onLoopEnd
      ? "pr-3"
      : "pl-1"
    : "pl-1";

  return (
    <div
      ref={drop}
      className={`rdg-time ${isOver ? "bg-indigo-800" : ""} ${props.className}`}
      onClick={onClick}
    >
      {loop ? (
        <>
          {onLoopStart ? (
            <LoopPoint
              isDragging={LoopStart.isDragging}
              dragRef={startDrag}
              className="border-l-8"
            />
          ) : null}
          {onLoopEnd ? (
            <LoopPoint
              isDragging={LoopEnd.isDragging}
              dragRef={endDrag}
              className="border-r-8"
            />
          ) : null}
        </>
      ) : null}
      {props.isMeasure ? (
        <div
          className={`absolute ${
            props.bars > 99 ? "text-[9px]" : ""
          } ${padding}`}
        >
          {props.bars}
        </div>
      ) : null}
    </div>
  );
}

const LoopPoint = (props: {
  className?: string;
  isDragging: boolean;
  dragRef: any;
}) => (
  <div
    className={`absolute top-0 left-0 w-full h-full border-indigo-700 hover:bg-slate-800 ${
      props.className ?? ""
    }`}
    style={{
      opacity: props.isDragging ? 0.9 : 1,
    }}
    ref={props.dragRef}
  ></div>
);
