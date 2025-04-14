import { createPortal } from "react-dom";

import { useAppValue } from "hooks/useRedux";
import { useCallback, useMemo, useState } from "react";
import {
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

export interface TimelineClipsProps {
  element?: HTMLDivElement;
}

export function TimelineClips(props: TimelineClipsProps) {
  const element = props.element;
  const portaledClipIds = useAppValue(selectPortaledClipIds);

  // Blur clips if they are dragged
  const [isDragging, setIsDragging] = useState(false);
  useEvent("dragClip", (e) => setIsDragging(e.detail));

  const renderPortaledClipId = useCallback(
    (pcId: PortaledClipId) => {
      const id = getOriginalIdFromPortaledClip(pcId);

      // Render pattern clips
      if (isPatternClipId(id) && isPortaledPatternClipId(pcId)) {
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
    [isDragging]
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
  "data-[open=true]:min-w-min data-[open=true]:max-w-lg data-[open=false]:data-[type=pattern]:z-[30] data-[open=true]:data-[type=pattern]:z-40",
  "data-[open=true]:data-[type=pose]:z-[39] data-[open=false]:data-[type=pose]:z-[29] data-[type=pose]:bg-fuchsia-500 data-[type=scale]:bg-blue-500",
  "data-[selected=true]:border-slate-100 data-[selected=false]:data-[type=pattern]:border-teal-500/50 data-[selected=false]:data-[type=pose]:border-fuchsia-300/50 data-[selected=false]:data-[type=scale]:border-blue-500"
);
