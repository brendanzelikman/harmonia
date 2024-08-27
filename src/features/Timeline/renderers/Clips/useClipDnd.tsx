import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { capitalize } from "lodash";
import { useMemo } from "react";
import { useDrag, useDrop } from "react-dnd";
import { ClipId, IClipId } from "types/Clip/ClipTypes";
import { ClipType } from "types/Clip/ClipTypes";
import { useProjectDispatch } from "types/hooks";
import { onMediaDragEnd } from "types/Media/MediaThunks";
import { updateMediaDragState } from "types/Timeline/TimelineSlice";

interface ClipDragProps {
  id: IClipId;
  type: ClipType;
}

export function useClipDrag(props: ClipDragProps) {
  const dispatch = useProjectDispatch();
  const { id, type } = props;
  const dragField = useMemo(() => `dragging${capitalize(type)}Clip`, [type]);
  const startDrag = () => dispatch(updateMediaDragState({ [dragField]: true }));
  const endDrag = () => dispatch(updateMediaDragState({ [dragField]: false }));
  const heldKeys = useHeldHotkeys("`");
  return useDrag({
    type: `${type}Clip`,
    item: () => {
      // Update the drag after a delay to respond to UI changes
      setTimeout(startDrag, 50);
      return { id };
    },
    collect(monitor) {
      return { id, isDragging: monitor.isDragging() };
    },
    end: (item: any, monitor: any) => {
      endDrag();
      dispatch(onMediaDragEnd(item, monitor, heldKeys));
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
