import { selectClipWidth } from "types/Arrangement/ArrangementClipSelectors";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import { use } from "types/hooks";
import {
  selectIsClipLive,
  selectIsClipSelected,
  selectTimelineTickLeft,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import classNames from "classnames";
import { PoseClipComponentProps } from "./usePoseClipRenderer";
import { PortaledPoseClip } from "types/Clip/ClipTypes";

interface PoseClipStyleProps extends PoseClipComponentProps {
  clip: PortaledPoseClip;
}

export const usePoseClipStyle = (props: PoseClipStyleProps) => {
  const { id, isAdding, isPortaling, isSlicing } = props;
  const { clip, holdingI, isDraggingAny } = props;
  const isFullyDim = isPortaling;
  const isSelected = use((_) => selectIsClipSelected(_, id));
  const isLive = use((_) => selectIsClipLive(_, id));
  const isActive = isPortaling || isDraggingAny;

  // The position and dimensions are based on the clip
  const top = use((_) => selectTrackTop(_, clip.trackId));
  const left = use((_) => selectTimelineTickLeft(_, clip.tick));
  const width = use((_) => selectClipWidth(_, clip));
  const height = use((_) => selectTrackHeight(_, clip.trackId));

  // The class name is compiled with info from the timeline
  const className = classNames(
    props.className,
    "flex flex-col bg-fuchsia-500 border border-b-0 rounded",
    isSelected ? "border-white" : "border-fuchsia-300",
    isLive ? "shadow-[0px_-5px_20px_#fa00dd] duration-300" : "",
    clip.isOpen ? "z-30 min-w-min" : "",
    isActive ? "pointer-events-none" : "pointer-events-all",
    { "cursor-scissors": isSlicing },
    { "cursor-wand": isAdding },
    { "cursor-pointer": !holdingI },
    { "hover:ring hover:ring-fuchsia-400": isAdding },
    { "opacity-50": isFullyDim },
    { "opacity-100": !isFullyDim }
  );

  return {
    top,
    left,
    width,
    minHeight: height,
    height: clip.isOpen ? undefined : height,
    className,
  };
};
