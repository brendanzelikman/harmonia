import { useCallback } from "react";
import { TimeProps } from ".";
import { useLoopDrag, useLoopDrop } from "./useLoopDragAndDrop";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";

export function TimeFormatter(props: TimeProps) {
  const { loop, onLoopStart, onLoopEnd, setLoopStart, setLoopEnd } = props;
  const subdivision = props.subdivision;
  const heldKeys = useHeldHotkeys(["s", "e"]);

  // Drag and drop loop points
  const [{ isOver }, drop] = useLoopDrop(props);
  const [LoopStart, startDrag] = useLoopDrag({
    ...props,
    onEnd: (item: any) => setLoopStart(item.hoverIndex, subdivision),
  });
  const [LoopEnd, endDrag] = useLoopDrag({
    ...props,
    onEnd: (item: any) => setLoopEnd(item.hoverIndex, subdivision),
  });

  /** The click handler for the time cell.
   * * If the user is holding s, set the loop start.
   * * If the user is holding e, set the loop end.
   * * Otherwise, seek the transport to the time.
   */
  const onClick = useCallback(() => {
    if (loop && heldKeys.s) {
      props.setLoopStart(props.columnIndex, subdivision);
      return;
    }
    if (loop && heldKeys.e) {
      props.setLoopEnd(props.columnIndex, subdivision);
      return;
    }
    props.onClick(props.tick);
  }, [loop, subdivision, heldKeys.s, heldKeys.e]);

  /**
   * The loop start point is rendered if on the loop start tick while looping.
   */
  const LoopStartPoint = onLoopStart ? (
    <LoopPoint
      isDragging={LoopStart.isDragging}
      dragRef={startDrag}
      className="border-l-8"
    />
  ) : null;

  /**
   * The loop end point is rendered if on the loop end tick while looping.
   */
  const LoopEndPoint = onLoopEnd ? (
    <LoopPoint
      isDragging={LoopEnd.isDragging}
      dragRef={endDrag}
      className="border-r-8"
    />
  ) : null;

  /**
   * The loop points are rendered only if the loop is active.
   */
  const LoopPoints = loop ? (
    <>
      {LoopStartPoint}
      {LoopEndPoint}
    </>
  ) : null;

  /**
   * The measure number is rendered if the cell is a measure.
   * If the measure is greater than 99, the font size is reduced.
   */
  const Measure = props.isMeasure ? (
    <div className={props.measureClass}>{props.bars}</div>
  ) : null;

  // Assemble the class name
  const background = isOver ? "bg-indigo-800" : "bg-black";
  const className = `rdg-time ${background} ${props.className}`;

  // Render the time cell
  return (
    <div ref={drop} className={className} onClick={onClick}>
      {LoopPoints}
      {Measure}
    </div>
  );
}

/**
 * The loop point is rendered as a draggable div.
 */
const LoopPoint = (props: {
  className?: string;
  isDragging: boolean;
  dragRef: any;
}) => (
  <div
    className={`absolute top-0 left-0 w-full h-full border-indigo-700 hover:bg-slate-800 ${
      props.className ?? ""
    }`}
    style={{ opacity: props.isDragging ? 0.9 : 1 }}
    ref={props.dragRef}
  ></div>
);
