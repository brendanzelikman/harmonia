import { createPortal } from "react-dom";

import { use, useDeep } from "types/hooks";
import { PatternClipRenderer } from "./PatternClip/usePatternClipRenderer";
import { useCallback, useMemo, useState } from "react";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import {
  IPortaledClipId,
  PatternClipId,
  PortaledPoseClipId,
  PortaledScaleClipId,
  PoseClipId,
  ScaleClipId,
  isPortaledPatternClipId,
  isPortaledPoseClipId,
  isPortaledScaleClipId,
} from "types/Clip/ClipTypes";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";

import {
  selectCellWidth,
  selectIsAddingClips,
  selectIsAddingPortals,
  selectIsSlicingClips,
  selectSubdivision,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import classNames from "classnames";
import {
  selectPortaledClipIds,
  selectPortaledClipIdTickMap,
} from "types/Arrangement/ArrangementSelectors";
import { ScaleClipRenderer } from "./ScaleClip/useScaleClipRenderer";
import { PoseClipRenderer } from "./PoseClip/usePoseClipRenderer";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { getTickColumns } from "utils/durations";
import { TRACK_WIDTH } from "utils/constants";
import { useDragState } from "types/Media/MediaTypes";
import { PortaledClipId } from "types/Portal/PortalTypes";

export interface TimelineClipsProps {
  element?: HTMLDivElement;
}

export function TimelineClips(props: TimelineClipsProps) {
  const element = props.element;
  const _portaledClipIds = useDeep(selectPortaledClipIds);
  const portaledClipIds = useMemo(
    () => _portaledClipIds.sort((a) => (a.startsWith("pattern") ? 1 : -1)),
    [_portaledClipIds]
  );
  const clipTickMap = useDeep(selectPortaledClipIdTickMap);
  const holding = useHeldHotkeys("i");
  const holdingI = holding.i;
  const isSlicing = use(selectIsSlicingClips);
  const isPortaling = use(selectIsAddingPortals);
  const isAdding = use(selectIsAddingClips);
  const type = use(selectTimelineType);
  const subdivision = use(selectSubdivision);
  const cellWidth = use(selectCellWidth);
  const dragState = useDragState();

  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollRight, setScrollRight] = useState(window.innerWidth);
  const onScrollLeft = useCallback(
    (e: CustomEvent<any>) => setScrollLeft(e.detail),
    []
  );
  const onScrollRight = useCallback(
    (e: CustomEvent<any>) => setScrollRight(e.detail),
    []
  );
  useCustomEventListener("scrollLeft", onScrollLeft);
  useCustomEventListener("scrollRight", onScrollRight);

  const renderPortaledClipId = useCallback(
    (pcId: PortaledClipId) => {
      const baseProps = {
        isSlicing,
        isPortaling,
        holdingI,
        className: classNames("group absolute", {
          "cursor-eyedropper hover:ring hover:ring-orange-300/25 active:opacity-80":
            holdingI,
        }),
      };

      const id = getOriginalIdFromPortaledClip(pcId);
      const doesOverlap = isPortaledPatternClipId(id);

      const tick = clipTickMap[pcId]?.tick;
      const duration = clipTickMap[pcId]?.duration;
      const left = TRACK_WIDTH + getTickColumns(tick, subdivision) * cellWidth;
      const width = (getTickColumns(duration, subdivision) || 1) * cellWidth;
      if (scrollLeft > left + width) return null;
      if (scrollRight < left) return null;

      // Render pattern clips
      if (isPortaledPatternClipId(pcId)) {
        return (
          <PatternClipRenderer
            {...baseProps}
            key={pcId}
            id={id as PatternClipId}
            pcId={pcId}
            doesOverlap={doesOverlap}
            subdivision={subdivision}
            cellWidth={cellWidth}
            isAdding={isAdding && type === "pattern"}
            isAddingAny={isAdding}
            isDraggingAny={dragState.any}
            isDraggingOther={dragState.any && !dragState.draggingPatternClip}
            startDrag={() => dragState.set("draggingPatternClip", true)}
            endDrag={() => dragState.set("draggingPatternClip", false)}
          />
        );
      }

      // Render pose clips
      if (isPortaledPoseClipId(pcId)) {
        return (
          <PoseClipRenderer
            {...baseProps}
            key={pcId}
            id={id as PoseClipId}
            isAdding={isAdding && type === "pose"}
            isAddingAny={isAdding}
            pcId={pcId as PortaledPoseClipId}
            isDraggingAny={dragState.any}
            isDraggingOther={dragState.any && !dragState.draggingPoseClip}
            startDrag={() => dragState.set("draggingPoseClip", true)}
            endDrag={() => dragState.set("draggingPoseClip", false)}
          />
        );
      }

      // Render scale clips
      if (isPortaledScaleClipId(pcId)) {
        return (
          <ScaleClipRenderer
            {...baseProps}
            key={pcId}
            id={id as ScaleClipId}
            isAdding={isAdding && type === "scale"}
            isAddingAny={isAdding}
            pcId={pcId as PortaledScaleClipId}
            isDraggingAny={dragState.any}
            isDraggingOther={dragState.any && !dragState.draggingScaleClip}
            startDrag={() => dragState.set("draggingScaleClip", true)}
            endDrag={() => dragState.set("draggingScaleClip", false)}
          />
        );
      }
      return null;
    },
    [
      cellWidth,
      isAdding,
      type,
      isSlicing,
      isPortaling,
      holdingI,
      dragState,
      scrollLeft,
      scrollRight,
      clipTickMap,
    ]
  );

  const children = useMemo(
    () => portaledClipIds.map((pcId) => renderPortaledClipId(pcId)),
    [portaledClipIds, renderPortaledClipId]
  );

  // Portal the clips into the timeline element
  if (!element) return null;
  return createPortal(children, element);
}

// The props passed down to each clip component
export interface ClipComponentProps {
  isAdding: boolean;
  isAddingAny: boolean;
  isDraggingAny: boolean;
  isDraggingOther: boolean;
  startDrag: () => void;
  endDrag: () => void;
  isSlicing: boolean;
  isPortaling: boolean;
  holdingI: boolean;
  className: string;
}
