import { useDrag } from "react-dnd";
import { ClipProps } from "../Clip";

/**
 * A hook for dragging clips.
 */
export function useClipDrag(props: ClipProps) {
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
