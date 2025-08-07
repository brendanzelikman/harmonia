import { createPortal } from "react-dom";

import { useAppDispatch, useAppValue } from "hooks/useRedux";
import { useCallback, useMemo, useState } from "react";
import {
  ClipId,
  isPatternClipId,
  isPortaledPatternClipId,
  isPortaledPoseClipId,
  isPoseClipId,
} from "types/Clip/ClipTypes";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";

import { selectPortaledClipIds } from "types/Arrangement/ArrangementSelectors";
import { useEvent } from "hooks/useEvent";
import { PortaledClipId } from "types/Portal/PortalTypes";
import classNames from "classnames";
import { PatternClipRenderer } from "./renderers/PatternClip/usePatternClipRenderer";
import { PoseClipRenderer } from "./renderers/PoseClip/usePoseClipRenderer";
import { useDrag } from "react-dnd";
import { onMediaDragEnd } from "types/Media/MediaThunks";
import { dispatchCustomEvent } from "utils/event";
import { selectCellWidth } from "types/Timeline/TimelineSelectors";

export interface TimelineClipsProps {
  element?: HTMLDivElement;
}

export function TimelineClips(props: TimelineClipsProps) {
  const element = props.element;
  const portaledClipIds = useAppValue(selectPortaledClipIds);

  // Keep track of timeline scroll
  const [scroll, setScroll] = useState({
    scrollLeft: 0,
    scrollRight: window.innerWidth,
  });
  useEvent("scrollTimeline", (e) => setScroll(e.detail));

  // Blur clips if they are dragged
  const [isDragging, setIsDragging] = useState(false);
  useEvent("dragClip", (e) => setIsDragging(e.detail));

  const renderPortaledClipId = useCallback(
    (pcId: PortaledClipId) => {
      const id = getOriginalIdFromPortaledClip(pcId);

      if (isPatternClipId(id) && isPortaledPatternClipId(pcId)) {
        // Render pattern clips
        return (
          <PatternClipRenderer
            isDragging={isDragging}
            key={pcId}
            pcId={pcId}
            id={id}
          />
        );
      }

      // Render pose clips
      if (isPoseClipId(id) && isPortaledPoseClipId(pcId)) {
        return (
          <PoseClipRenderer
            isDragging={isDragging}
            key={pcId}
            pcId={pcId}
            id={id}
          />
        );
      }

      return null;
    },
    [isDragging, scroll]
  );

  // Portal the clips into the timeline element
  const children = useMemo(
    () => portaledClipIds.map((pcId) => renderPortaledClipId(pcId)),
    [portaledClipIds, renderPortaledClipId]
  );
  if (!element) return null;
  return createPortal(children, element);
}

// The props passed down to each clip component
export interface ClipComponentProps {
  isDragging: boolean;
}

export const clipClassName = classNames(
  "group absolute flex flex-col border-2 border-b-0 rounded-lg rounded-b-none",
  "animate-in fade-in data-[type=pose]:zoom-in slide-in-from-left-2",
  "data-[blur=true]:opacity-50 data-[blur=true]:pointer-events-none",
  "data-[open=true]:min-w-min data-[open=false]:data-[type=pattern]:z-[30] data-[open=true]:data-[type=pattern]:z-40",
  "data-[open=true]:data-[type=pose]:z-[39] data-[open=false]:data-[type=pose]:z-[29] data-[type=pose]:bg-fuchsia-500 data-[type=scale]:bg-blue-500",
  "data-[selected=true]:data-[open=false]:border-white data-[selected=true]:data-[open=true]:border-white/20 data-[selected=false]:data-[type=pattern]:border-teal-500/50 data-[selected=false]:data-[type=pose]:border-fuchsia-300/50 data-[selected=false]:data-[type=scale]:border-blue-500"
);

export const useClipDrag = (pcId: PortaledClipId) => {
  const dispatch = useAppDispatch();
  const cellWidth = useAppValue(selectCellWidth);
  return useDrag({
    type: "clip",
    item: (monitor: any) => {
      dispatchCustomEvent(`dragClip`, true);
      const clip = document.getElementById(pcId);
      if (!clip) return { id: pcId };
      const clientOffset = monitor.getClientOffset();
      const clipRect = clip.getBoundingClientRect();
      const offsetX = clientOffset ? clientOffset.x - clipRect.left : 0;
      const isSmall = clipRect.width - cellWidth < 1;
      const isPast = offsetX > clipRect.width - cellWidth;
      const isResizing = !isSmall && isPast;
      return { id: pcId, offsetX, isResizing };
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item: any, monitor: any) => {
      dispatchCustomEvent(`dragClip`, false);
      dispatch(onMediaDragEnd(item, monitor));
    },
  });
};

export const useClipDropdown = (id: ClipId) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleDropdown = useCallback(
    (e: CustomEvent<any>) => {
      if (e.detail.id === undefined || e.detail.id === id) {
        setIsOpen(e.detail.value === undefined ? !isOpen : e.detail.value);
      }
    },
    [isOpen]
  );
  useEvent("clipDropdown", handleDropdown);
  return isOpen;
};
