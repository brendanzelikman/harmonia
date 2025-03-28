import { createPortal } from "react-dom";

import { useDeep } from "types/hooks";
import { PatternClipRenderer } from "./PatternClip/usePatternClipRenderer";
import { useCallback, useMemo, useState } from "react";
import {
  isPatternClipId,
  isPortaledPatternClipId,
  isPortaledPoseClipId,
  isPoseClipId,
} from "types/Clip/ClipTypes";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";

import { selectPortaledClipIds } from "types/Arrangement/ArrangementSelectors";
import { selectPortaledClipBoundMap } from "types/Arrangement/ArrangementClipSelectors";
import { PoseClipRenderer } from "./PoseClip/usePoseClipRenderer";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { PortaledClipId } from "types/Portal/PortalTypes";
import classNames from "classnames";

export interface TimelineClipsProps {
  element?: HTMLDivElement;
}

export function TimelineClips(props: TimelineClipsProps) {
  const element = props.element;
  const portaledClipIds = useDeep(selectPortaledClipIds);
  const boundaries = useDeep(selectPortaledClipBoundMap);

  // Virtualize clips using scroll position
  const [{ scrollLeft, scrollRight }, setBounds] = useState({
    scrollLeft: element?.scrollLeft ?? 0,
    scrollRight: (element?.scrollLeft ?? 0) + window.innerWidth,
  });
  useCustomEventListener("scroll", (e) => setBounds(e.detail));

  // Blur clips if they are dragged
  const [isDragging, setIsDragging] = useState(false);
  useCustomEventListener("dragClip", (e) => setIsDragging(e.detail));

  const renderPortaledClipId = useCallback(
    (pcId: PortaledClipId) => {
      // Check that the clip is within scroll bounds
      const { left, right } = boundaries[pcId];
      const padding = 500;
      if (scrollLeft > right + padding) return null;
      if (scrollRight < left - padding) return null;

      // Get the base props for all clips
      const id = getOriginalIdFromPortaledClip(pcId);

      const className = classNames(
        "group absolute flex flex-col border-2 border-b-0 rounded-lg rounded-b-none",
        "data-[blur=true]:opacity-50 data-[blur=true]:pointer-events-none",
        "data-[open=true]:min-w-min data-[open=true]:max-w-lg data-[open=false]:data-[type=pattern]:z-[30] data-[open=true]:data-[type=pattern]:z-40",
        "data-[open=true]:data-[type=pose]:z-[39] data-[open=false]:data-[type=pose]:z-[29] data-[type=pose]:bg-fuchsia-500 data-[type=scale]:bg-blue-500",
        "data-[selected=true]:border-slate-100 data-[selected=false]:data-[type=pattern]:border-teal-500/50 data-[selected=false]:data-[type=pose]:border-fuchsia-300/50 data-[selected=false]:data-[type=scale]:border-blue-500"
      );
      const props = { isDragging, className };

      // Render pattern clips
      if (isPatternClipId(id) && isPortaledPatternClipId(pcId)) {
        return (
          <PatternClipRenderer {...props} key={pcId} pcId={pcId} id={id} />
        );
      }

      // Render pose clips
      if (isPoseClipId(id) && isPortaledPoseClipId(pcId)) {
        return <PoseClipRenderer {...props} key={pcId} pcId={pcId} id={id} />;
      }

      return null;
    },
    [scrollLeft, scrollRight, isDragging, boundaries]
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
  className: string;
  isDragging: boolean;
}
