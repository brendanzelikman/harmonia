import { useDrag } from "react-dnd";
import { ClipProps } from "../Clip";

export function useClipDrag(props: ClipProps) {
  const { clip } = props;
  return useDrag(() => ({
    type: "clip",
    item: { clip, trackId: clip?.trackId },
    collect(monitor) {
      return { isDragging: monitor.isDragging() };
    },
    end: (item: any, monitor: any) => {
      if (!item.canDrop) return;
      props.onDragEnd(item, monitor);
    },
  }));
}
