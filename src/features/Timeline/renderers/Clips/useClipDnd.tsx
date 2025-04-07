import { useDrag } from "react-dnd";
import { useDispatch } from "types/hooks";
import { onMediaDragEnd } from "types/Media/MediaThunks";
import { PortaledClipId } from "types/Portal/PortalTypes";
import { dispatchCustomEvent } from "utils/html";

export function useClipDrag(id: PortaledClipId) {
  const dispatch = useDispatch();
  return useDrag({
    type: "clip",
    item: () => {
      dispatchCustomEvent(`dragClip`, true);
      return { id };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: any, monitor: any) => {
      dispatchCustomEvent(`dragClip`, false);
      dispatch(onMediaDragEnd(item, monitor));
    },
  });
}
