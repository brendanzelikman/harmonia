import { createPortal } from "react-dom";
import {
  Clip,
  PatternClip,
  PoseClip,
  isPatternClip,
  isPoseClip,
} from "types/Clip";
import { TimelinePortalElement } from "..";
import { useProjectDeepSelector, useProjectSelector } from "redux/hooks";
import {
  selectPortaledClipMap,
  selectSelectedClipIds,
  selectTimeline,
} from "redux/selectors";
import { Portaled, getOriginalIdFromPortaledClip } from "types/Portal";
import { PatternClipRenderer } from "./PatternClipRenderer";
import { PoseClipRenderer } from "./PoseClipRenderer";
import { useCallback } from "react";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import {
  isTimelineAddingPatternClips,
  isTimelineAddingPoseClips,
  isTimelineSlicingClips,
  isTimelinePortalingClips,
  TimelineCell,
} from "types/Timeline";
import { Subdivision } from "utils/durations";

export interface ClipRendererProps {
  portaledClip: Clip;
  isSelected: boolean;
  heldKeys: Record<string, boolean>;
  cell: TimelineCell;
  subdivision: Subdivision;
  isAddingPatterns: boolean;
  isAddingPoses: boolean;
  isSlicingClips: boolean;
  isPortalingClips: boolean;
}

export function TimelineClips(props: TimelinePortalElement) {
  const clipMap = useProjectDeepSelector(selectPortaledClipMap);
  const selectedIds = useProjectDeepSelector(selectSelectedClipIds);
  const clips = Object.values(clipMap);
  const heldKeys = useHeldHotkeys(["i", "n", "m", "`"]);
  const element = props.timeline?.element;
  const timeline = useProjectSelector(selectTimeline);
  const { cell, subdivision } = timeline;
  const isAddingPatterns = isTimelineAddingPatternClips(timeline);
  const isAddingPoses = isTimelineAddingPoseClips(timeline);
  const isSlicingClips = isTimelineSlicingClips(timeline);
  const isPortalingClips = isTimelinePortalingClips(timeline);

  const renderClip = useCallback(
    <T extends Clip = Clip>(portaledClip: Portaled<T>) => {
      const id = getOriginalIdFromPortaledClip(portaledClip.id);
      const clip = { ...portaledClip, id };
      const isSelected = selectedIds.includes(id);

      const props = {
        key: portaledClip.id,
        portaledClip,
        isSelected,
        heldKeys,
        cell,
        subdivision,
        isAddingPatterns,
        isAddingPoses,
        isSlicingClips,
        isPortalingClips,
      };

      if (isPatternClip(clip)) {
        return <PatternClipRenderer {...props} clip={clip as PatternClip} />;
      }

      if (isPoseClip(clip)) {
        return <PoseClipRenderer {...props} clip={clip as PoseClip} />;
      }

      return null;
    },
    [
      selectedIds,
      heldKeys,
      cell,
      subdivision,
      isAddingPatterns,
      isAddingPoses,
      isSlicingClips,
      isPortalingClips,
    ]
  );

  if (!element) return null;
  return createPortal(clips.map(renderClip), element);
}
