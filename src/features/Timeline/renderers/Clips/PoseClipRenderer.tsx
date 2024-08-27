import { useState } from "react";
import { useClipDrag } from "./useClipDnd";

import { useProjectDispatch, useProjectSelector as use } from "types/hooks";
import classNames from "classnames";
import { ClipComponentProps } from "./TimelineClips";
import { isFiniteNumber } from "types/util";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import { PoseClip } from "types/Clip/ClipTypes";
import { selectClipWidth } from "types/Arrangement/ArrangementClipSelectors";
import { selectPoseById } from "types/Pose/PoseSelectors";
import {
  selectCellWidth,
  selectIsDraggingSomeMedia,
  selectIsLive,
  selectIsTimelineAddingClips,
  selectIsTimelineAddingPoseClips,
  selectIsTimelineSlicingClips,
  selectSelectedTrackId,
  selectTimelineTickLeft,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import { onPoseClipClick } from "types/Timeline/TimelineThunks";
import { useHotkeys } from "react-hotkeys-hook";
import { PoseClipDropdown } from "./PoseClip/PoseClipDropdown";
import { PoseClipHeader } from "./PoseClip/PoseClipHeader";
import { useCustomEventListener } from "hooks";
import { Portaled } from "types/Portal/PortalTypes";
import { useWindowedState } from "hooks/window/useWindowedState";

export interface PoseClipRendererProps extends ClipComponentProps {
  clip: PoseClip;
}

export function PoseClipRenderer(props: PoseClipRendererProps) {
  const { clip, portaledClip, isSelected, isPortaling, holdingI } = props;
  const { tick } = clip;
  const pcId = portaledClip.id;
  const dispatch = useProjectDispatch();
  const cellWidth = use(selectCellWidth);

  /** Each pose has a dropdown for editing offsets. */
  const dropdownState = useWindowedState(`dropdown_${clip.id}`);
  const isDropdownOpen = dropdownState.state;
  const setIsDropdownOpen = dropdownState.setState;
  useHotkeys("esc", () => setIsDropdownOpen(false));

  /** A custom hook for dragging poses into cells */
  const [{ isDragging }, drag] = useClipDrag({ id: pcId, type: "pose" });
  const isDraggingOther = use(selectIsDraggingSomeMedia);

  // Timeline info
  const [index, setIndex] = useState(0);
  const addingSomeMedia = use(selectIsTimelineAddingClips);
  const isActive = isDragging || addingSomeMedia;
  const isSlicingClips = use(selectIsTimelineSlicingClips);
  const isAddingPoses = use(selectIsTimelineAddingPoseClips);

  // Pose dimensions
  const pose = use((_) => selectPoseById(_, clip.poseId));
  const isLive = use(selectIsLive);
  const isInfinite = !isFiniteNumber(clip.duration);
  const top = use((_) => selectTrackTop(_, clip.trackId));
  const left = use((_) => selectTimelineTickLeft(_, tick));
  const width = use((_) => selectClipWidth(_, portaledClip));
  const height = use((_) => selectTrackHeight(_, clip.trackId));
  const selectedTrackId = use(selectSelectedTrackId);

  // Render the pose clip
  const poseWidth = isInfinite ? cellWidth : width;
  const className = classNames(
    props.className,
    "flex flex-col bg-fuchsia-500",
    isDropdownOpen ? "z-30 min-w-min" : "",
    "border border-b-0 rounded",
    isSelected && isLive && selectedTrackId === clip.trackId
      ? "shadow-[0px_-5px_20px_#fa00dd] duration-300"
      : "",
    isSelected ? "border-white" : "border-fuchsia-300",
    { "cursor-scissors": isSlicingClips },
    { "cursor-wand": isAddingPoses },
    { "cursor-pointer": !holdingI && !isAddingPoses },
    { "hover:ring hover:ring-fuchsia-400": isAddingPoses },
    isActive || isDraggingOther || isPortaling
      ? "pointer-events-none"
      : isInfinite && isAddingPoses
      ? "pointer-events-none"
      : "pointer-events-all",
    isDragging || isPortaling
      ? "opacity-50"
      : isDraggingOther && isSelected
      ? "opacity-80"
      : "opacity-100"
  );

  return (
    <div
      ref={drag}
      className={className}
      style={{ top, left, width: poseWidth, height }}
      onClick={(e) => dispatch(onPoseClipClick(e, clip, holdingI))}
    >
      <PoseClipHeader
        {...props}
        pose={pose}
        portaledClip={portaledClip as Portaled<PoseClip>}
        index={index}
        setIndex={setIndex}
        isDropdownOpen={isDropdownOpen}
        setIsDropdownOpen={setIsDropdownOpen}
      />
      <PoseClipDropdown
        clip={clip}
        pose={pose}
        index={index}
        isOpen={isDropdownOpen}
      />
    </div>
  );
}
