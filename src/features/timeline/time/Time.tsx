import { TimeProps } from ".";
import { useLoopDrag, useLoopDrop } from "./dnd";
import useKeyHolder from "hooks/useKeyHolder";

// The time is contained in the header
export function TimeFormatter(props: TimeProps) {
  const [LoopStart, startDrag] = useLoopDrag({
    ...props,
    onEnd: (item: any) =>
      props.setLoopStart(item.hoverIndex - 1, props.subdivision),
  });
  const [LoopEnd, endDrag] = useLoopDrag({
    ...props,
    onEnd: (item: any) =>
      props.setLoopEnd(item.hoverIndex - 1, props.subdivision),
  });
  const [{ isOver }, drop] = useLoopDrop(props);

  const Measure = ({ className }: { className?: string }) => (
    <div
      className={`absolute ${props.bars > 99 ? "text-[9px]" : ""} ${
        className ?? ""
      }`}
    >
      {props.bars}
    </div>
  );

  const heldKeys = useKeyHolder(["s", "e"]);
  const holdingS = heldKeys.s;
  const holdingE = heldKeys.e;

  const onClick = () => {
    if (props.looping && holdingS) {
      props.setLoopStart(props.columnIndex - 1, props.subdivision);
    } else if (props.looping && holdingE) {
      props.setLoopEnd(props.columnIndex - 1, props.subdivision);
    } else {
      props.onClick(props.tick);
    }
  };

  return (
    <div
      ref={drop}
      className={`rdg-time ${isOver ? "bg-indigo-800" : ""} ${props.className}`}
      onClick={onClick}
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
