import { useDrag, useDrop } from "react-dnd";
import { Tick } from "types/units";
import { TimeProps } from ".";

export interface LoopProps extends TimeProps {
  onEnd: (item: any) => void;
}

export interface LoopPoint {
  tick: Tick;
  hoverIndex: number;
}

/**
 * A hook for dragging loop points.
 */
export function useLoopDrag(props: LoopProps) {
  return useDrag(
    () => ({
      type: "loop",
      item: {
        tick: props.tick - 1,
        hoverIndex: props.tick,
      },
      collect(monitor) {
        return {
          isDragging: monitor.isDragging(),
        };
      },
      end(item: any) {
        props.onEnd(item);
      },
    }),
    [props.tick]
  );
}

/**
 * A hook for dropping loop points.
 */
export function useLoopDrop(props: TimeProps) {
  return useDrop(
    () => ({
      accept: "loop",
      collect: (monitor: any) => ({
        loopStart: props.loopStart,
        loopEnd: props.loopEnd,
        isOver: monitor.isOver(),
      }),
      hover: (item: LoopPoint) => {
        item.hoverIndex = props.columnIndex;
      },
    }),
    [props.loopStart, props.loopEnd]
  );
}
