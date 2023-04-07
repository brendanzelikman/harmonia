import useEventListeners from "hooks/useEventListeners";
import { useCallback, useEffect, useState } from "react";
import { TimeProps } from ".";
import { useLoopDrag, useLoopDrop } from "./dnd";

// The time is contained in the header
export function TimeFormatter(props: TimeProps) {
  const [LoopStart, startDrag] = useLoopDrag({
    ...props,
    onEnd: (item: any) => props.setLoopStart(item.hoverIndex - 1),
  });
  const [LoopEnd, endDrag] = useLoopDrag({
    ...props,
    onEnd: (item: any) => props.setLoopEnd(item.hoverIndex - 1),
  });
  const [{ isOver }, drop] = useLoopDrop(props);

  const Measure = ({ className }: { className?: string }) => (
    <div className={`w-4 ${className ?? ""}`}>{props.measure}</div>
  );

  // Hold S + click to set loop start
  // Hold E + click to set loop end
  const [holdingS, setHoldingS] = useState(false);
  const [holdingE, setHoldingE] = useState(false);

  const handleKeyDown = useCallback((e: Event) => {
    if ((e as KeyboardEvent).key === "s") {
      setHoldingS(true);
    } else if ((e as KeyboardEvent).key === "e") {
      setHoldingE(true);
    }
  }, []);

  const handleKeyUp = useCallback((e: Event) => {
    if ((e as KeyboardEvent).key === "s") {
      setHoldingS(false);
    } else if ((e as KeyboardEvent).key === "e") {
      setHoldingE(false);
    }
  }, []);

  useEventListeners(
    {
      s: {
        keydown: handleKeyDown,
        keyup: handleKeyUp,
      },
      e: {
        keydown: handleKeyDown,
        keyup: handleKeyUp,
      },
    },
    []
  );

  return (
    <div
      ref={drop}
      className={`rdg-time ${isOver ? "bg-indigo-800" : ""} ${props.className}`}
      onClick={() => {
        if (props.looping && holdingS) {
          props.setLoopStart(props.columnIndex - 1);
        } else if (props.looping && holdingE) {
          props.setLoopEnd(props.columnIndex - 1);
        } else {
          props.onClick(props.columnIndex);
        }
      }}
    >
      {props.looping ? (
        <>
          {props.onLoopStart ? (
            <LoopPoint
              isDragging={LoopStart.isDragging}
              dragRef={startDrag}
              className="border-l-8"
            />
          ) : null}
          {props.onLoopEnd ? (
            <LoopPoint
              isDragging={LoopEnd.isDragging}
              dragRef={endDrag}
              className="border-r-8"
            />
          ) : null}
        </>
      ) : null}
      {props.isMeasure ? (
        <Measure
          className={
            props.looping
              ? props.onLoopStart
                ? "pl-3"
                : props.onLoopEnd
                ? "pr-3"
                : "pl-1"
              : "pl-1"
          }
        />
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
