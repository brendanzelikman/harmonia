import { useLoopDrag, useLoopDrop } from "./useLoopDragAndDrop";
import { useProjectDispatch, use } from "types/hooks";
import { inRange } from "lodash";
import { RenderHeaderCellProps } from "react-data-grid";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { Row } from "features/Timeline/Timeline";
import { convertTicksToFormattedTime } from "types/Transport/TransportFunctions";
import {
  selectColumnTicks,
  selectSubdivisionTicks,
} from "types/Timeline/TimelineSelectors";
import { selectTransport } from "types/Transport/TransportSelectors";
import {
  setTransportLoopStart,
  setTransportLoopEnd,
  seekTransport,
} from "types/Transport/TransportThunks";

interface TimelineHeaderRendererProps {
  columnIndex: number;
  holdingS: boolean;
  holdingE: boolean;
}

export const TimelineHeaderRenderer: React.FC<TimelineHeaderRendererProps> = (
  props
) => {
  const dispatch = useProjectDispatch();

  const { columnIndex } = props;
  const tick = use((_) => selectColumnTicks(_, columnIndex - 1));

  // Loop properties derived from the transport
  const tickLength = use(selectSubdivisionTicks);
  const { bpm, timeSignature, loop, loopStart, loopEnd } = use(selectTransport);
  const inLoopRange = inRange(tick, loopStart, loopEnd);
  const onLoopStart = loopStart === tick;
  const onLoopEnd = loopEnd === tick + (tickLength - 1);

  /** Set the loop start */
  const setLoopStart = useCallback(
    (column: number) => {
      const ticks = tickLength * (column - 1);
      dispatch(setTransportLoopStart(ticks));
    },
    [tickLength]
  );

  /** Set the loop end */
  const setLoopEnd = useCallback(
    (column: number) => {
      const ticks = tickLength * column;
      dispatch(setTransportLoopEnd(ticks - 1));
    },
    [tickLength]
  );

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
  const LoopPoints = useCallback(() => {
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
  }, [loop, loopStart, loopEnd, onLoopStart, onLoopEnd]);

  const formattedTime = useMemo(
    () => convertTicksToFormattedTime(tick, { bpm, timeSignature }),
    [tick, bpm, timeSignature]
  );

  /** The measure number is rendered if the cell is a measure. */
  const Measure = useCallback(() => {
    const { bars, beats, sixteenths } = formattedTime;
    const isMeasure = beats === 0 && sixteenths === 0;

    // The font size is reduced for triple digit measures.
    return (
      <>
        {!!isMeasure && (
          <div
            className={classNames(
              "select-none",
              { "pl-3": loop && onLoopStart },
              { "pr-3": loop && onLoopEnd },
              { "pl-1": !loop || (!onLoopStart && !onLoopEnd) },
              { "text-[9px]": bars > 99 }
            )}
          >
            {bars}
          </div>
        )}
      </>
    );
  }, [formattedTime, loop, onLoopStart, onLoopEnd]);

  /** Seek the transport or update the loop points if holding S/E. */
  const onClick = () => {
    if (!loop) {
      dispatch(seekTransport({ data: tick }));
      return;
    }
    if (props.holdingS) {
      setLoopStart(columnIndex);
    } else if (props.holdingE) {
      setLoopEnd(columnIndex);
    }
  };

  // Render the time cell
  return (
    <div
      data-over={isOver}
      ref={drop}
      className={classNames(
        "rdg-header bg-black data-[over=true]:bg-indigo-800 relative w-full h-full total-center text-white hover:bg-slate-800 hover:border hover:border-slate-200/80 cursor-pointer",
        { "border-b-8 border-b-indigo-700": loop && inLoopRange },
        { "border-slate-50/20": !loop || !inLoopRange }
      )}
      onClick={onClick}
    >
      <LoopPoints />
      <Measure />
    </div>
  );
};
