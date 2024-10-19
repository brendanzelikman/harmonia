import { selectClipWidth } from "types/Arrangement/ArrangementClipSelectors";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import { use } from "types/hooks";
import {
  selectTimelineTickLeft,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import classNames from "classnames";
import { PoseClipRendererProps } from "./usePoseClipRenderer";

interface PoseClipStyleProps extends PoseClipRendererProps {
  isDragging: boolean;
  isDraggingOther: boolean;
}

export const usePoseClipStyle = (props: PoseClipStyleProps) => {
  const { clip, isSelected, isLive } = props;
  const { isAdding, isAddingAny, isPortaling, isSlicing } = props;
  const { isDragging, isDraggingOther, holdingI } = props;
  const isFullyDim = isDragging || isPortaling;
  const isLightlyDim = isDraggingOther && isSelected;
  const isActive = isDragging || isDraggingOther || isPortaling || isAddingAny;

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
    { "opacity-80": isLightlyDim && !isFullyDim },
    { "opacity-100": !isFullyDim && !isLightlyDim }
  );

  return { top, left, width, height, className };
};
