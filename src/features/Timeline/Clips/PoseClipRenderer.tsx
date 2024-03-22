import { useMemo } from "react";
import {
  selectMediaDragState,
  selectClipName,
  selectPoseById,
  selectPoseClipPose,
} from "redux/selectors";
import { cancelEvent } from "utils/html";
import { usePoseClipDrag } from "./usePoseClipDrag";
import {
  onPoseClipClick,
  onPoseClipDoubleClick,
  selectClipWidth,
  selectTimelineObjectHeight,
  selectTimelineTickLeft,
  selectTrackedObjectTop,
  updateMediaDragState,
} from "redux/Timeline";
import { useProjectDispatch, useProjectSelector as use } from "redux/hooks";
import { BsMagic } from "react-icons/bs";
import { SlMagicWand } from "react-icons/sl";
import { POSE_HEIGHT } from "utils/constants";
import classNames from "classnames";
import { onMediaDragEnd } from "redux/Media";
import { PoseClip, PoseClipId } from "types/Clip";
import { ClipRendererProps } from "./TimelineClips";
import {
  getPoseAsString,
  getPoseBlockAsString,
  getPoseStreamAsString,
  getPoseVectorAsString,
  getPoseVectorModuleAsJSX,
  isPoseVectorModule,
} from "types/Pose";

interface PoseClipRendererProps extends ClipRendererProps {
  clip: PoseClip;
}

export function PoseClipRenderer(props: PoseClipRendererProps) {
  const {
    clip,
    portaledClip,
    isSelected,
    isAddingPatterns,
    isAddingPoses,
    isSlicingClips,
    isPortalingClips,
    heldKeys,
  } = props;
  const { tick } = clip;
  const dispatch = useProjectDispatch();

  /** Update the timeline when dragging poses. */
  const onDragStart = () => {
    dispatch(updateMediaDragState({ draggingPoseClip: true }));
  };

  /** Update the timeline when releasing poses and call the thunk. */
  const onDragEnd = (item: any, monitor: any) => {
    dispatch(updateMediaDragState({ draggingPoseClip: false }));
    dispatch(onMediaDragEnd(item, monitor));
  };

  /** A custom hook for dragging poses into cells */
  const [{ isDragging }, drag] = usePoseClipDrag({
    clip: { ...clip, id: portaledClip.id as PoseClipId },
    onDragStart,
    onDragEnd,
  });
  const dragState = use(selectMediaDragState);
  const { draggingPatternClip, draggingPortal } = dragState;

  // Timeline info
  const isActive = isPortalingClips || isDragging || isAddingPatterns;
  const isDraggingOther = draggingPatternClip || draggingPortal;
  const isEyedropping = heldKeys.i;

  // Pose dimensions
  const top = use((_) => selectTrackedObjectTop(_, clip));
  const left = use((_) => selectTimelineTickLeft(_, tick));
  const width = use((_) => selectClipWidth(_, portaledClip));
  const height = use((_) => selectTimelineObjectHeight(_, clip));

  /** The pose header sits above a clip and contains the pose label. */
  const name = use((_) => selectClipName(_, clip?.id));

  const PoseHeader = useMemo(() => {
    // The icon is a star wand when selected, magic wand otherwise
    const IconType = isSelected ? SlMagicWand : BsMagic;

    // The label is more visible when selected
    const wrapperClass = classNames(
      "flex relative items-center whitespace-nowrap pointer-events-none font-nunito",
      "gap-2 animate-in fade-in duration-75",
      isSelected ? "text-white font-semibold" : "text-white/80 font-light"
    );

    // The pose height refers to the notch above the clip
    const height = POSE_HEIGHT;

    return (
      <div
        className={wrapperClass}
        style={{ height }}
        draggable
        onDragStart={cancelEvent}
      >
        <IconType className="text-md ml-1 h-4" />
        {name}
      </div>
    );
  }, [isSelected, name]);

  /** The pose body is filled in behind a clip. */
  const PoseBody = useMemo(() => {
    return (
      <div className={`w-full animate-in fade-in duration-75 flex-grow`} />
    );
  }, []);

  // Assemble the classname
  const className = classNames(
    "group absolute flex flex-col",
    "bg-pose-clip border rounded",
    isSelected ? "overflow-visible" : "overflow-hidden",
    isSelected ? "border-white " : "border-slate-400",
    { "cursor-scissors": isSlicingClips },
    { "cursor-wand": isAddingPoses },
    { "cursor-eyedropper hover:ring hover:ring-slate-300": isEyedropping },
    { "cursor-pointer": !isEyedropping && !isAddingPoses },
    { "hover:animate-pulse hover:ring hover:ring-fuchsia-400": isAddingPoses },
    isActive || isDraggingOther ? "pointer-events-none" : "pointer-events-all",
    isDragging ? "opacity-50" : isDraggingOther ? "opacity-80" : "opacity-100"
  );

  // Render the pose clip
  return (
    <div
      ref={drag}
      className={className}
      style={{ top, left, width, height }}
      onClick={(e) => dispatch(onPoseClipClick(e, clip, isEyedropping))}
      onDoubleClick={() => dispatch(onPoseClipDoubleClick(clip))}
    >
      {PoseHeader}
      {PoseBody}
    </div>
  );
}
