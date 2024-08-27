import { useCallback } from "react";
import { useClipDrag } from "./useClipDnd";
import {
  useProjectDispatch,
  useProjectSelector as use,
  useDeep,
} from "types/hooks";
import { BsMagic } from "react-icons/bs";
import { SlMagicWand } from "react-icons/sl";
import { POSE_HEIGHT } from "utils/constants";
import classNames from "classnames";
import { ClipComponentProps } from "./TimelineClips";
import { isFiniteNumber } from "types/util";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import { ScaleClip, ScaleClipId } from "types/Clip/ClipTypes";
import { isTimelineAddingScaleClips } from "types/Timeline/TimelineFunctions";
import { selectClipName } from "types/Clip/ClipSelectors";
import { selectClipWidth } from "types/Arrangement/ArrangementClipSelectors";
import {
  selectCellWidth,
  selectTimeline,
  selectTimelineTickLeft,
  selectTrackHeight,
  selectIsTimelineSlicingClips,
  selectIsTimelineAddingClips,
} from "types/Timeline/TimelineSelectors";
import {
  selectScaleTrackMap,
  selectTrackScale,
} from "types/Track/TrackSelectors";
import { getScaleNotes } from "types/Scale/ScaleFunctions";
import { selectScaleById } from "types/Scale/ScaleSelectors";
import {
  onScaleClipClick,
  onScaleClipDoubleClick,
} from "types/Timeline/TimelineThunks";
import { useDragState } from "types/Media/MediaTypes";

interface ScaleClipRenderer extends ClipComponentProps {
  clip: ScaleClip;
}

export function ScaleClipRenderer(props: ScaleClipRenderer) {
  const { clip, portaledClip, isSelected, isPortaling, holdingI } = props;
  const { tick } = clip;
  const dispatch = useProjectDispatch();
  const cellWidth = use(selectCellWidth);
  const trackMap = useDeep(selectScaleTrackMap);
  const timeline = use(selectTimeline);
  const isAddingClips = isTimelineAddingScaleClips(timeline);
  const trackScale = useDeep((_) => selectTrackScale(_, clip.trackId));
  const trackSize = getScaleNotes(trackScale).length;
  const clipScale = useDeep((_) => selectScaleById(_, clip.scaleId));
  const clipSize = getScaleNotes(clipScale).length;
  const isEqualSize = trackSize === clipSize;

  /** A custom hook for dragging poses into cells */
  const [{ isDragging }, drag] = useClipDrag({
    id: portaledClip.id as ScaleClipId,
    type: "scale",
  });

  const dragState = useDragState();
  const draggingPatternClip = dragState.draggingPatternClip;
  const draggingPoseClip = dragState.draggingPoseClip;
  const draggingPortal = dragState.draggingPortal;

  // Timeline info
  const addingSomeMedia = use(selectIsTimelineAddingClips);
  const isActive = addingSomeMedia || isDragging;
  const isDraggingOther =
    draggingPatternClip || draggingPoseClip || draggingPortal;

  // Pose dimensions
  const top = use((_) => selectTrackTop(_, clip.trackId));
  const left = use((_) => selectTimelineTickLeft(_, tick));
  const width = use((_) => selectClipWidth(_, portaledClip));
  const height = use((_) => selectTrackHeight(_, clip.trackId));

  /** The pose header contains a clip name and vector if it is a bucket. */
  const name = use((_) => selectClipName(_, clip?.id));
  const isInfinite = !isFiniteNumber(clip.duration);

  const Header = useCallback(() => {
    // The icon is a star wand when selected, magic wand otherwise
    const IconType = isSelected ? SlMagicWand : BsMagic;

    // The label is more visible when selected
    const wrapperClass = classNames(
      "flex text-sm relative items-center whitespace-nowrap pointer-events-none font-nunito",
      "gap-2 animate-in fade-in duration-75",
      isSelected ? "text-white font-semibold" : "text-white/80 font-light"
    );

    // The pose height refers to the notch above the clip
    const height = POSE_HEIGHT;

    return (
      <div className={wrapperClass} style={{ height }} draggable>
        <IconType className="flex flex-shrink-0 ml-1 w-4 h-4 select-none" />
        <>{name}</>
      </div>
    );
  }, [isSelected, isInfinite, name, trackMap]);

  /** The pose body is filled in behind a clip. */
  const Body = () => (
    <div className={`w-full animate-in fade-in duration-75 flex-grow`} />
  );

  const isSlicingClips = use(selectIsTimelineSlicingClips);

  // Assemble the classname
  const className = classNames(
    props.className,
    "flex flex-col",
    isInfinite ? "bg-blue-400" : "bg-blue-500",
    "border rounded",
    isSelected ? "border-white " : "border-slate-400",
    { "cursor-scissors": isSlicingClips },
    { "cursor-eyedropper hover:ring hover:ring-slate-300": holdingI },
    { "cursor-pointer": !holdingI && !isAddingClips },
    { "hover:animate-pulse hover:ring hover:ring-blue-400": isAddingClips },
    isActive || isDraggingOther || isPortaling
      ? "pointer-events-none"
      : isInfinite && isAddingClips
      ? "pointer-events-none"
      : "pointer-events-all",
    isDragging || !isEqualSize || isPortaling
      ? "opacity-50"
      : isDraggingOther
      ? "opacity-80"
      : "opacity-100"
  );

  // Render the pose clip
  return (
    <div
      ref={drag}
      className={className}
      style={{ top, left, width: isInfinite ? cellWidth : width, height }}
      onClick={(e) => dispatch(onScaleClipClick(e, clip, holdingI))}
      onDoubleClick={() => dispatch(onScaleClipDoubleClick(clip))}
    >
      {Header()}
      {Body()}
    </div>
  );
}
