import { useDrag } from "react-dnd";
import { PoseClip } from "types/Clip";

interface PoseClipDragProps {
  clip: PoseClip;
  onDragStart: () => void;
  onDragEnd: (item: any, monitor: any) => void;
}

export function usePoseClipDrag(props: PoseClipDragProps) {
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
