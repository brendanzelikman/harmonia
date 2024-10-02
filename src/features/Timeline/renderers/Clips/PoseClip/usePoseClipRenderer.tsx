import { useRef, useState } from "react";
import { useClipDrag } from "../useClipDnd";

import {
  useProjectDispatch,
  useProjectSelector as use,
  useDeep,
} from "types/hooks";
import classNames from "classnames";
import { ClipComponentProps } from "../TimelineClips";
import { PortaledPoseClip, PoseClip } from "types/Clip/ClipTypes";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { PoseClipDropdown } from "./PoseClipDropdown";
import { PoseClipHeader } from "./PoseClipHeader";
import { Portaled } from "types/Portal/PortalTypes";
import { useToggledState } from "hooks/useToggledState";
import { useDragState } from "types/Media/MediaTypes";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import { Timed } from "types/units";
import { usePoseClipStyle } from "./usePoseClipStyle";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { getPoseVectorAsJSX } from "types/Pose/PoseFunctions";
import { PoseVector } from "types/Pose/PoseTypes";
import { selectTrackMap } from "types/Track/TrackSelectors";
import { getVectorKeys } from "utils/vector";

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
  const trackMap = useDeep(selectTrackMap);

  /** Each pose has a dropdown for editing offsets. */
  const dropdownState = useToggledState(`dropdown_${pcId}`);
  const isDropdownOpen = dropdownState.isOpen;

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

  const [vectors, setVectors] = useState<PoseVector[]>([]);
  const vectorCount = vectors.length;
  const comboTimeout = useRef<NodeJS.Timeout | null>(null);
  useCustomEventListener("add-shortcut", (e) => {
    const message = e.detail;
    if (!getVectorKeys(message).length) {
      setVectors([]);
      return;
    } else {
      setVectors((prev) => [...prev, message]);
      const timeout = comboTimeout.current;
      if (timeout) clearTimeout(timeout);
      comboTimeout.current = setTimeout(() => {
        setVectors([]);
      }, 3000);
    }
  });

  return (
    <div
      ref={drag}
      className={className}
      style={style}
      onClick={(e) => dispatch(onClipClick(e, clip, { eyedropping: holdingI }))}
    >
      {isClipLive && (
        <div
          className={classNames("absolute -top-12 p-1 text-white rounded", {
            "animate-in fade-in border border-white/50 bg-fuchsia-600/30 backdrop-blur":
              !!vectorCount,
          })}
        >
          <div className="flex gap-2 relative size-full whitespace-nowrap">
            {vectors.slice(0, 10).map((s, i) => (
              <div
                key={i}
                className="flex gap-2 total-center animate-in fade-in zoom-in"
              >
                <div className="border border-white/50 p-1 rounded bg-fuchsia-500">
                  {getPoseVectorAsJSX(s, trackMap)}
                </div>
                {i < vectorCount - 1 && <span className="text-white">+</span>}
                {i === 9 && vectorCount > 10 && (
                  <span className="text-white">{vectorCount - 10} more</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
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
