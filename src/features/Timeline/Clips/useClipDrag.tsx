import { useDrag } from "react-dnd";
import { Clip } from "types/Clip";

interface ClipDragProps {
  clip: Clip;
  onDragStart: () => void;
  onDragEnd: (item: any, monitor: any) => void;
}
export function useClipDrag(props: ClipDragProps) {
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
