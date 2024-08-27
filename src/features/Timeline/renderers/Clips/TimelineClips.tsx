import { createPortal } from "react-dom";

import { use, useDeep } from "types/hooks";
import { PatternClipRenderer } from "./PatternClipRenderer";
import { PoseClipRenderer } from "./PoseClipRenderer";
import { useCallback, useMemo } from "react";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { ScaleClipRenderer } from "./ScaleClipRenderer";
import {
  Clip,
  PatternClip,
  PortaledClip,
  PortaledPatternClip,
  PortaledPoseClip,
  PortaledScaleClip,
  PoseClip,
  ScaleClip,
  isPatternClip,
  isPoseClip,
  isScaleClip,
} from "types/Clip/ClipTypes";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";
import { Portaled } from "types/Portal/PortalTypes";
import { selectPortaledClips } from "types/Arrangement/ArrangementSelectors";
import {
  selectIsTimelinePortalingClips,
  selectIsTimelineSlicingClips,
  selectSelectedClipIdMap,
} from "types/Timeline/TimelineSelectors";
import { DataGridHandle } from "react-data-grid";
import classNames from "classnames";

export interface TimelineClipsProps {
  timeline?: DataGridHandle;
}

export function TimelineClips(props: TimelineClipsProps) {
  const element = props.timeline?.element;
  const portaledClips = useDeep(selectPortaledClips);
  const selectedIdMap = useDeep(selectSelectedClipIdMap);
  const { i: holdingI } = useHeldHotkeys(["i"]);
  const isSlicing = use(selectIsTimelineSlicingClips);
  const isPortaling = use(selectIsTimelinePortalingClips);

  // Return if a clip is selected or not
  const isClipSelected = useCallback(
    (clip: Clip) => selectedIdMap[clip.id],
    [selectedIdMap]
  );

  // Construct the base props for each clip
  const baseProps = useMemo(() => {
    return {
      isSlicing,
      isPortaling,
      holdingI,
      className: classNames(
        "group transition-all duration-75 absolute animate-in fade-in",
        {
          "cursor-eyedropper hover:ring hover:ring-slate-300 active:opacity-80":
            holdingI,
        }
      ),
    };
  }, [isSlicing, isPortaling, holdingI]);

  // Memoized render function for portaled clips
  const renderPortaledClip = useCallback(
    <T extends Clip = Clip>(portaledClip: Portaled<T>) => {
      const id = getOriginalIdFromPortaledClip(portaledClip.id);
      const clip = { ...portaledClip, id };
      const isSelected = isClipSelected(clip);

      // Render pattern clips
      if (isPatternClip(clip)) {
        return (
          <PatternClipRenderer
            {...baseProps}
            key={portaledClip.id}
            clip={clip as PatternClip}
            portaledClip={portaledClip as PortaledPatternClip}
            isSelected={isSelected}
          />
        );
      }

      // Render pose clips
      if (isPoseClip(clip)) {
        return (
          <PoseClipRenderer
            {...baseProps}
            key={portaledClip.id}
            clip={clip as PoseClip}
            portaledClip={portaledClip as PortaledPoseClip}
            isSelected={isSelected}
          />
        );
      }

      // Render scale clips
      if (isScaleClip(clip)) {
        return (
          <ScaleClipRenderer
            {...baseProps}
            key={portaledClip.id}
            clip={clip as ScaleClip}
            portaledClip={portaledClip as PortaledScaleClip}
            isSelected={isSelected}
          />
        );
      }
      return null;
    },
    [baseProps, isClipSelected]
  );

  // Portal the clips into the timeline element
  if (!element) return null;
  return createPortal(portaledClips.map(renderPortaledClip), element);
}

// The props passed down to each clip component
export interface ClipComponentProps {
  portaledClip: PortaledClip;
  isSelected: boolean;
  isSlicing: boolean;
  isPortaling: boolean;
  holdingI: boolean;
  className: string;
}
