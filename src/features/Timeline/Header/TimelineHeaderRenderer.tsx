import { useLoopDrag, useLoopDrop } from "./useLoopDragAndDrop";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import {
  seekTransport,
  setTransportLoopEnd,
  setTransportLoopStart,
} from "redux/thunks";
import { selectTransport } from "redux/Transport";
import { selectColumnTicks, selectSubdivisionTicks } from "redux/Timeline";
import { inRange } from "lodash";
import { convertTicksToFormattedTime } from "types/Transport";
import { HeaderRendererProps } from "react-data-grid";
import { Row } from "../Timeline";
import classNames from "classnames";
import { useCallback } from "react";

interface HeaderProps extends HeaderRendererProps<Row> {}

export const TimelineHeaderRenderer: React.FC<HeaderProps> = (props) => {
  const dispatch = useProjectDispatch();
  const heldKeys = useHeldHotkeys(["s", "e"]);

  // Header tick properties
  const columnIndex = Number(props.column.key);
  const tickLength = useProjectSelector(selectSubdivisionTicks);
  const tick = useProjectSelector((_) => selectColumnTicks(_, columnIndex - 1));

  // Loop properties derived from the transport
  const transport = useProjectSelector(selectTransport);
  const { bpm, timeSignature, loop, loopStart, loopEnd } = transport;
  const inLoopRange = inRange(tick, loopStart, loopEnd);
  const onLoopStart = loopStart === tick;
  const onLoopEnd = loopEnd === tick + (tickLength - 1);

  /** Set the loop start */
  const setLoopStart = (column: number) => {
    const ticks = tickLength * (column - 1);
    dispatch(setTransportLoopStart(ticks));
  };

  /** Set the loop end */
  const setLoopEnd = (column: number) => {
    const ticks = tickLength * column;
    dispatch(setTransportLoopEnd(ticks - 1));
  };

  /** Custom hook for dragging the loop start point. */
  const [LoopStart, startDrag] = useLoopDrag({
    tick,
    onEnd: (item: any) => setLoopStart(item.hoverIndex),
  });

  /** Custom hook for dragging the loop end point. */
  const [LoopEnd, endDrag] = useLoopDrag({
    tick,
    onEnd: (item: any) => setLoopEnd(item.hoverIndex),
  });

  /** Custom hook for dropping the loop point into a header. */
  const [{ isOver }, drop] = useLoopDrop({ columnIndex, loopStart, loopEnd });

  /** The loop points are rendered only if the loop is active. */
  const LoopPoints = () => {
    if (!loop) return null;

    // The loop start point is rendered if the header is on the loop start tick.
    const LoopStartPoint = () => (
      <div
        ref={startDrag}
        className={`absolute top-0 left-0 w-full h-full border-indigo-700 hover:bg-slate-800 border-l-8 ${
          LoopStart.isDragging ? "opacity-80" : ""
        }`}
      />
    );

    // The loop end point is rendered if the header is on the loop end tick.
    const LoopEndPoint = () => (
      <div
        ref={endDrag}
        className={`absolute top-0 left-0 w-full h-full border-indigo-700 hover:bg-slate-800 border-r-8 ${
          LoopEnd.isDragging ? "opacity-80" : ""
        }`}
      />
    );

    // Render both loop points
    return (
      <>
        {!!onLoopStart && <LoopStartPoint />}
        {!!onLoopEnd && <LoopEndPoint />}
      </>
    );
  };

  /** The measure number is rendered if the cell is a measure. */
  const Measure = useCallback(() => {
    const formattedTime = convertTicksToFormattedTime(tick, {
      bpm,
      timeSignature,
    });
    const { bars, beats, sixteenths } = formattedTime;
    const isMeasure = beats === 0 && sixteenths === 0;

    // The font size is reduced for triple digit measures.
    const className = classNames(
      "select-none",
      { "pl-3": loop && onLoopStart },
      { "pr-3": loop && onLoopEnd },
      { "pl-1": !loop || (!onLoopStart && !onLoopEnd) },
      { "text-[9px]": bars > 99 }
    );
    return <>{!!isMeasure && <div className={className}>{bars}</div>}</>;
  }, [tick, bpm, timeSignature, loop, onLoopStart, onLoopEnd]);

  // Assemble the class names for the header cell
  const className = classNames(
    "rdg-header relative w-full h-full text-white hover:bg-slate-800 hover:border hover:border-slate-200/80 cursor-pointer",
    { "bg-indigo-800": isOver, "bg-black": !isOver },
    { "border-b-8 border-b-indigo-700": loop && inLoopRange },
    { "border-slate-50/20": !loop || !inLoopRange }
  );

  /** Seek the transport or update the loop points if holding S/E. */
  const onClick = () => {
    if (!loop) {
      dispatch(seekTransport(tick));
      return;
    }
    if (heldKeys.s) {
      setLoopStart(columnIndex);
    } else if (heldKeys.e) {
      setLoopEnd(columnIndex);
    }
  };

  // Render the time cell
  return (
    <div ref={drop} className={className} onClick={onClick}>
      <LoopPoints />
      <Measure />
    </div>
  );
};
