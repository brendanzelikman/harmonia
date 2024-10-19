import { createPortal } from "react-dom";

import { use, useDeep } from "types/hooks";
import { PatternClipRenderer } from "./PatternClip/usePatternClipRenderer";
import { PoseClipRenderer } from "./PoseClip/usePoseClipRenderer";
import { useCallback, useMemo } from "react";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { ScaleClipRenderer } from "./ScaleClip/useScaleClipRenderer";
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

import {
  selectIsAddingClips,
  selectIsAddingPortals,
  selectIsLive,
  selectIsSlicingClips,
  selectSelectedClipIdMap,
  selectSelectedTrackId,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import classNames from "classnames";
import { Timed } from "types/units";
import { TrackId } from "types/Track/TrackTypes";
import { useDragState } from "types/Media/MediaTypes";
import { selectPortaledClips } from "types/Arrangement/ArrangementSelectors";

export interface TimelineClipsProps {
  element?: HTMLDivElement;
}

export function TimelineClips(props: TimelineClipsProps) {
  const element = props.element;
  const portaledClips = useDeep(selectPortaledClips);
  const selectedIdMap = useDeep(selectSelectedClipIdMap);
  const holding = useHeldHotkeys("i");
  const holdingI = holding.i;
  const isLive = use(selectIsLive);
  const isSlicing = use(selectIsSlicingClips);
  const isPortaling = use(selectIsAddingPortals);
  const selectedTrackId = use(selectSelectedTrackId);
  const isAdding = use(selectIsAddingClips);
  const type = use(selectTimelineType);
  const dragState = useDragState();

  // Return if a clip is selected or not
  const isClipSelected = useCallback(
    (clip: Clip) => selectedIdMap[clip.id],
    [selectedIdMap]
  );

  // Return if a clip is live or not
  const isClipLive = useCallback(
    (clip: Clip) => {
      const isSelected = isClipSelected(clip);
      const onTrack = selectedTrackId === clip.trackId;
      return isLive && isSelected && onTrack;
    },
    [isLive, selectedTrackId, isClipSelected]
  );

  // Construct the base props for each clip
  const baseProps = useMemo(
    () => ({
      isLive,
      isSlicing,
      isPortaling,
      holdingI,
      selectedTrackId,
      className: classNames(
        "group transition-all duration-75 absolute animate-in fade-in",
        {
          "cursor-eyedropper hover:ring hover:ring-orange-300/25 active:opacity-80":
            holdingI,
        }
      ),
    }),
    [isLive, isSlicing, holdingI, isPortaling, selectedTrackId]
  );

  // Memoized render function for portaled clips
  const renderPortaledClip = useCallback(
    <T extends Clip = Clip>(portaledClip: Portaled<T>) => {
      const id = getOriginalIdFromPortaledClip(portaledClip.id);
      const clip = { ...portaledClip, id };
      const isSelected = isClipSelected(clip);
      const isLive = isClipLive(clip);

      // Render pattern clips
      if (isPatternClip(clip)) {
        return (
          <PatternClipRenderer
            {...baseProps}
            key={portaledClip.id}
            clip={clip as Timed<PatternClip>}
            portaledClip={portaledClip as PortaledPatternClip}
            isOpen={!!clip.isOpen}
            isSelected={isSelected}
            isAdding={isAdding && type === clip.type}
            isAddingAny={isAdding}
            isDragging={!!dragState.draggingPatternClip}
            isDraggingAny={!!dragState.any}
          />
        );
      }

      // Render pose clips
      if (isPoseClip(clip)) {
        return (
          <PoseClipRenderer
            {...baseProps}
            key={portaledClip.id}
            clip={clip as Timed<PoseClip>}
            portaledClip={portaledClip as PortaledPoseClip}
            isOpen={!!clip.isOpen}
            isSelected={isSelected}
            isAdding={isAdding && type === clip.type}
            isAddingAny={isAdding}
            isDragging={!!dragState.draggingPoseClip}
            isDraggingAny={!!dragState.any}
            isLive={isLive}
          />
        );
      }

      // Render scale clips
      if (isScaleClip(clip)) {
        return (
          <ScaleClipRenderer
            {...baseProps}
            key={portaledClip.id}
            clip={clip as Timed<ScaleClip>}
            portaledClip={portaledClip as PortaledScaleClip}
            isOpen={!!clip.isOpen}
            isSelected={isSelected}
            isAdding={isAdding && type === clip.type}
            isAddingAny={isAdding}
            isDragging={!!dragState.draggingScaleClip}
            isDraggingAny={!!dragState.any}
          />
        );
      }
      return null;
    },
    [baseProps, isClipSelected, isClipLive, isAdding, dragState, type]
  );

  // Portal the clips into the timeline element
  if (!element) return null;
  return createPortal(portaledClips.map(renderPortaledClip), element);
}

// The props passed down to each clip component
export interface ClipComponentProps {
  portaledClip: PortaledClip;
  isOpen: boolean;
  isLive: boolean;
  isSelected: boolean;
  isAdding: boolean;
  isAddingAny: boolean;
  isDragging: boolean;
  isDraggingAny: boolean;
  isSlicing: boolean;
  isPortaling: boolean;
  holdingI: boolean;
  className: string;
  selectedTrackId?: TrackId;
}
