import { useDrag, useDrop } from "react-dnd";
import { ClipId, IClipId } from "types/Clip/ClipTypes";
import { ClipType } from "types/Clip/ClipTypes";
import { useProjectDispatch } from "types/hooks";
import { onMediaDragEnd } from "types/Media/MediaThunks";

interface ClipDragProps {
  id: IClipId;
  type: ClipType;
  startDrag: () => void;
  endDrag: () => void;
}

export function useClipDrag(props: ClipDragProps) {
  const dispatch = useProjectDispatch();
  return useDrag({
    type: `${props.type}Clip`,
    item: () => {
      props.startDrag();
      return { id: props.id };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: any, monitor: any) => {
      props.endDrag();
      dispatch(onMediaDragEnd(item, monitor));
    },
  });
}

interface ClipDropProps {
  id: IClipId;
  type: ClipType;
  element?: any;
  onDrop: (dragId: ClipId, hoverId: ClipId) => void;
}

export function useClipDrop(props: ClipDropProps) {
  const { id, type } = props;
  return useDrop({
    accept: `${type}Clip`,
    collect(monitor) {
      return { id, isOver: monitor.isOver() };
    },
    drop(item: any) {
      if (!props.element) return;
      const dragId = props.id;
      const hoverId = item.id;
      if (dragId === hoverId) return;
      props.onDrop(dragId, hoverId);
    },
  });
}
