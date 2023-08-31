import { useDrag, useDrop } from "react-dnd";
import { Tick } from "types/units";
import { TimeProps } from ".";

export interface LoopProps extends TimeProps {
  onEnd: (item: any) => void;
}

interface LoopPoint {
  tick: Tick;
  hoverIndex: number;
}

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
    []
  );
}

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
        item.hoverIndex = props.tick;
      },
    }),
    [props]
  );
}
