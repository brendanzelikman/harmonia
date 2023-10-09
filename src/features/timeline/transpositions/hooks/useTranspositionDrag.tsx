import { useDrag } from "react-dnd";
import { TranspositionProps } from "../Transposition";

export function useTranspositionDrag(props: TranspositionProps) {
  const { transposition } = props;
  return useDrag(() => ({
    type: "transposition",
    item: { transposition, trackId: transposition?.trackId },
    collect(monitor) {
      return { isDragging: monitor.isDragging() };
    },
    end: (item: any, monitor: any) => {
      if (!item.canDrop) return;
      props.onDragEnd(item, monitor);
    },
  }));
}
