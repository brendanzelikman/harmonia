import { useDrag } from "react-dnd";
import { Pose } from "types/Pose";

interface PoseDragProps {
  pose: Pose;
  onDragStart: () => void;
  onDragEnd: (item: any, monitor: any) => void;
}

export function usePoseDrag(props: PoseDragProps) {
  const { pose } = props;
  return useDrag(
    () => ({
      type: "pose",
      item: () => {
        props.onDragStart();
        return { pose };
      },
      collect(monitor) {
        return { isDragging: monitor.isDragging() };
      },
      end: (item: any, monitor: any) => {
        if (!item.canDrop) return;
        props.onDragEnd(item, monitor);
      },
    }),
    [pose]
  );
}
