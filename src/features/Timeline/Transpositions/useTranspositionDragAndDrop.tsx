import { useDrag } from "react-dnd";
import { Transposition } from "types/Transposition";

interface TranspositionDragProps {
  transposition: Transposition;
  onDragStart: () => void;
  onDragEnd: (item: any, monitor: any) => void;
}

export function useTranspositionDrag(props: TranspositionDragProps) {
  const { transposition } = props;
  return useDrag(
    () => ({
      type: "transposition",
      item: () => {
        props.onDragStart();
        return { transposition };
      },
      collect(monitor) {
        return { isDragging: monitor.isDragging() };
      },
      end: (item: any, monitor: any) => {
        if (!item.canDrop) return;
        props.onDragEnd(item, monitor);
      },
    }),
    [transposition]
  );
}
