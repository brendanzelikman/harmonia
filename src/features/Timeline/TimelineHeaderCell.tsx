import { useAppDispatch, useAppValue } from "hooks/useRedux";
import { inRange } from "lodash";
import { RenderHeaderCellProps } from "react-data-grid";
import classNames from "classnames";
import { useCallback, useMemo } from "react";
import { Row } from "./Timeline";
import { getBarsBeatsSixteenths } from "utils/duration";
import {
  selectColumnTicks,
  selectHasPortalFragment,
  selectIsAddingPortals,
  selectSubdivisionTicks,
} from "types/Timeline/TimelineSelectors";
import { selectTransport } from "types/Transport/TransportSelectors";
import { seekTransport } from "types/Transport/TransportTick";
import { updateFragment } from "types/Timeline/TimelineSlice";
import { toggleTimelineState } from "types/Timeline/TimelineThunks";
import { useDrag, useDrop } from "react-dnd";
import { Tick } from "types/units";
import { setLoopEnd, setLoopStart } from "types/Transport/TransportSlice";

export const TimelineHeaderCell = (props: RenderHeaderCellProps<Row>) => {
  const dispatch = useAppDispatch();
  const columnIndex = parseInt(props.column.key);
  const tick = useAppValue((_) => selectColumnTicks(_, columnIndex - 1));
  const isPortaling = useAppValue(selectIsAddingPortals);
  const hasFragment = useAppValue(selectHasPortalFragment);

  // Loop properties derived from the transport
  const tickLength = useAppValue(selectSubdivisionTicks);
  const { bpm, timeSignature, loop, loopStart, loopEnd } =
    useAppValue(selectTransport);

  const inLoopRange = inRange(tick, loopStart, loopEnd);
  const onLoopStart = loopStart === tick;
  const onLoopEnd = loopEnd === tick + (tickLength - 1);

  /** Custom hook for dragging the loop start point. */
  const [LoopStart, startDrag] = useDrag(() => ({
    type: "loop",
    item: { tick: tick - 1, hoverIndex: tick },
    collect(monitor) {
      return { isDragging: monitor.isDragging() };
    },
    end(item: any) {
      const ticks = Math.max(tickLength * (item.hoverIndex - 1), 0);
      dispatch(setLoopStart(ticks));
    },
  }));

  /** Custom hook for dragging the loop end point. */
  const [LoopEnd, endDrag] = useDrag(
    () => ({
      type: "loop",
      item: { tick: tick - 1, hoverIndex: tick },
      collect(monitor) {
        return { isDragging: monitor.isDragging() };
      },
      end(item: any) {
        const ticks = Math.max(tickLength * item.hoverIndex - 1, 0);
        dispatch(setLoopEnd(ticks));
      },
    }),
    [tickLength]
  );

  /** Custom hook for dropping the loop point into a header. */
  const [{ isOver }, drop] = useDrop(() => ({
    accept: "loop",
    collect: (monitor: any) => ({
      loopStart: loopStart,
      loopEnd: loopEnd,
      isOver: monitor.isOver(),
    }),
    hover: (item: { tick: Tick; hoverIndex: number }) => {
      item.hoverIndex = columnIndex;
    },
  }));

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
    () => getBarsBeatsSixteenths(tick, { bpm, timeSignature }),
    [tick, bpm, timeSignature]
  );

  /** The measure number is rendered if the cell is a measure. */
  const Measure = useCallback(() => {
    const { bars, beats, sixteenths } = formattedTime;
    const isMeasure = beats === 0 && sixteenths === 0;

    const isQuarter = !isMeasure && (columnIndex - 1) % 4 === 0;
    const isSixteenth = !isMeasure && (columnIndex - 1) % 4 !== 0;
    const isCenterSixteenth = !isMeasure && (columnIndex - 1) % 4 === 2;
    // The font size is reduced for triple digit measures.
    return (
      <>
        {isQuarter && (
          <div className="w-[2px] h-[8px] right left-0 bottom-0 absolute bg-slate-300/50 rounded-t" />
        )}
        {isCenterSixteenth ? (
          <div className="w-[1px] h-[4px] right left-0 bottom-0 absolute bg-gray-500/80 rounded-t" />
        ) : isSixteenth ? (
          <div className="w-[1px] h-[6px] right left-0 bottom-0 absolute bg-gray-500/80 rounded-t" />
        ) : columnIndex > 1 ? (
          <div className="w-[1px] h-[2px] right left-0 bottom-0 absolute bg-gray-500/80 rounded-t" />
        ) : null}
        {!!isMeasure && (
          <div
            className={classNames(
              "select-none pointer-events-none",
              { "pl-3": loop && onLoopStart },
              { "pr-3": loop && onLoopEnd },
              { "pl-1": !loop || (!onLoopStart && !onLoopEnd) },
              { "text-[9px]": bars > 99 }
            )}
          >
            {bars + 1}
          </div>
        )}
      </>
    );
  }, [formattedTime, loop, onLoopStart, onLoopEnd]);

  /** Seek the transport or update the loop points if holding S/E. */
  const onClick = useCallback(() => {
    if (isPortaling) {
      if (hasFragment) {
        dispatch(setLoopEnd(Math.max(tickLength * columnIndex - 1, 0)));
        dispatch(toggleTimelineState({ data: "portaling-clips" }));
      } else {
        dispatch(setLoopStart(Math.max(tickLength * (columnIndex - 1), 0)));
        dispatch(updateFragment({ data: { tick } }));
      }
    } else {
      dispatch(seekTransport({ data: tick }));
    }
  }, [tick, tickLength, columnIndex, isPortaling, hasFragment]);

  // Render the time cell
  return (
    <div
      data-over={isOver}
      ref={drop}
      className={classNames(
        "rdg-header bg-black data-[over=true]:bg-indigo-800 relative size-full total-center text-white hover:bg-slate-800 hover:border hover:border-slate-200/80 cursor-pointer",
        { "border-b-8 border-b-indigo-700": loop && inLoopRange },
        { "border-slate-50/20": !loop || !inLoopRange },
        { "cursor-portalguno": isPortaling && hasFragment },
        { "cursor-portalgunb": isPortaling && !hasFragment }
      )}
      onClick={onClick}
    >
      <LoopPoints />
      <Measure />
    </div>
  );
};
