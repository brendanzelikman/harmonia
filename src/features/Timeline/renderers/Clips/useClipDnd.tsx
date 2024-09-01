import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { capitalize } from "lodash";
import { useMemo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ClipId, IClipId } from "types/Clip/ClipTypes";
import { ClipType } from "types/Clip/ClipTypes";
import { useProjectDispatch } from "types/hooks";
import { onMediaDragEnd } from "types/Media/MediaThunks";
import { MediaDragState, useDragState } from "types/Media/MediaTypes";

interface ClipDragProps {
  id: IClipId;
  type: ClipType;
}

export function useClipDrag(props: ClipDragProps) {
  const dispatch = useProjectDispatch();
  const { id, type } = props;
  const dragField = useMemo(
    () => `dragging${capitalize(type)}Clip` as keyof MediaDragState,
    [type]
  );
  const dragState = useDragState();
  return useDrag({
    type: `${type}Clip`,
    item: () => {
      dragState.set(dragField, true);
      return { id };
    },
    collect(monitor) {
      return { id, isDragging: monitor.isDragging() };
    },
    end: (item: any, monitor: any) => {
      dragState.set(dragField, false);
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
