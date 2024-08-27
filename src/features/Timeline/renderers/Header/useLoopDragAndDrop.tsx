import { useDrag, useDrop } from "react-dnd";
import { Tick } from "types/units";

export interface LoopPoint {
  tick: Tick;
  hoverIndex: number;
}

export interface LoopDragProps {
  tick: Tick;
  onEnd: (item: any) => void;
}

export function useLoopDrag(props: LoopDragProps) {
  return useDrag(
    () => ({
      type: "loop",
      item: { tick: props.tick - 1, hoverIndex: props.tick },
      collect(monitor) {
        return { isDragging: monitor.isDragging() };
      },
      end(item: any) {
        props.onEnd(item);
      },
    }),
    [props.tick]
  );
}

export interface LoopDropProps {
  columnIndex: number;
  loopStart: Tick;
  loopEnd: Tick;
}

export function useLoopDrop(props: LoopDropProps) {
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
