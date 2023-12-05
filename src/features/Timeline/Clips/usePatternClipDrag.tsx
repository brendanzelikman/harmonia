import { useDrag } from "react-dnd";
import { PatternClip } from "types/Clip";

interface PatternClipDragProps {
  clip: PatternClip;
  onDragStart: () => void;
  onDragEnd: (item: any, monitor: any) => void;
}

export function usePatternClipDrag(props: PatternClipDragProps) {
  const { clip } = props;
  return useDrag(
    () => ({
      type: "clip",
      item: () => {
        props.onDragStart();
        return { clip };
      },
      collect(monitor) {
        return { isDragging: monitor.isDragging() };
      },
      end: (item: any, monitor: any) => {
        if (!item.canDrop) return;
        props.onDragEnd(item, monitor);
      },
    }),
    [clip]
  );
}
