import { useDrag } from "react-dnd";
import { Portal } from "types/Portal/PortalTypes";
import { dispatchCustomEvent } from "utils/html";

interface PortalDragProps {
  portal?: Portal;
  isEntry: boolean;
  onDragStart: () => void;
  onDragEnd: (item: any, monitor: any) => void;
}

export function usePortalDrag(props: PortalDragProps) {
  const { portal, isEntry } = props;
  return useDrag({
    type: "portal",
    item: () => {
      props.onDragStart();
      dispatchCustomEvent("dragClip", true);
      if (!portal) return {};
      if (isEntry) {
        const { id, trackId, tick } = portal;
        return { portalEntry: { id, trackId, tick } };
      } else {
        const { id, portaledTrackId, portaledTick } = portal;
        return {
          portalExit: { id, trackId: portaledTrackId, tick: portaledTick },
        };
      }
    },
    collect(monitor) {
      return { isDragging: monitor.isDragging() };
    },
    end: (item: any, monitor: any) => {
      if (!item.canDrop) return;
      dispatchCustomEvent("dragClip", false);
      props.onDragEnd(item, monitor);
    },
  });
}
