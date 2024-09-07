import { useState } from "react";
import { useClipDrag } from "../useClipDnd";

import { useProjectDispatch, useProjectSelector as use } from "types/hooks";
import classNames from "classnames";
import { ClipComponentProps } from "../TimelineClips";
import { PortaledPoseClip, PoseClip } from "types/Clip/ClipTypes";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { useHotkeys } from "react-hotkeys-hook";
import { PoseClipDropdown } from "./PoseClipDropdown";
import { PoseClipHeader } from "./PoseClipHeader";
import { Portaled } from "types/Portal/PortalTypes";
import { useToggledState } from "hooks/useToggledState";
import { useDragState } from "types/Media/MediaTypes";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import { Timed } from "types/units";
import { usePoseClipStyle } from "./usePoseClipStyle";

export interface PoseClipRendererProps extends ClipComponentProps {
  clip: Timed<PoseClip>;
  portaledClip: PortaledPoseClip;
}

export function PoseClipRenderer(props: PoseClipRendererProps) {
  const { clip, portaledClip, selectedTrackId, holdingI } = props;
  const { isAdding, isSlicing, isSelected, isPortaling, isLive } = props;
  const pcId = portaledClip.id;
  const pose = use((_) => selectPoseById(_, clip.poseId));
  const dispatch = useProjectDispatch();

  /** Each pose has a dropdown for editing offsets. */
  const dropdownState = useToggledState(`dropdown_${pcId}`);
  const isDropdownOpen = dropdownState.isOpen;
  useHotkeys("esc", dropdownState.close);

  /** A custom hook for dragging poses into cells */
  const dragState = useDragState();
  const [{ isDragging }, drag] = useClipDrag({ id: pcId, type: "pose" });
  const isDraggingOther = dragState.any;

  // Timeline info
  const [index, setIndex] = useState(0);
  const isActive = isDragging || isDraggingOther || isPortaling || isAdding;

  // Pose style
  const style = usePoseClipStyle(portaledClip);
  const isClipLive = isLive && isSelected && selectedTrackId === clip.trackId;
  const fullDim = isDragging || isPortaling;
  const lightDim = isDraggingOther && isSelected;

  // Render the pose clip
  const className = classNames(
    props.className,
    "flex flex-col bg-fuchsia-500 border border-b-0 rounded",
    isSelected ? "border-white" : "border-fuchsia-300",
    isClipLive ? "shadow-[0px_-5px_20px_#fa00dd] duration-300" : "",
    isDropdownOpen ? "z-30 min-w-min" : "",
    isActive ? "pointer-events-none" : "pointer-events-all",
    { "cursor-scissors": isSlicing },
    { "cursor-wand": isAdding },
    { "cursor-pointer": !holdingI },
    { "hover:ring hover:ring-fuchsia-400": isAdding },
    { "opacity-50": fullDim },
    { "opacity-80": lightDim && !fullDim },
    { "opacity-100": !fullDim && !lightDim }
  );

  return (
    <div
      ref={drag}
      className={className}
      style={style}
      onClick={(e) => dispatch(onClipClick(e, clip, { eyedropping: holdingI }))}
    >
      <PoseClipHeader
        {...props}
        pose={pose}
        portaledClip={portaledClip as Portaled<PoseClip>}
        index={index}
        setIndex={setIndex}
        isDropdownOpen={isDropdownOpen}
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
