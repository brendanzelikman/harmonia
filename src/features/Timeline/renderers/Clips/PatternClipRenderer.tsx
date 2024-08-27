import { useCallback, useState } from "react";
import classNames from "classnames";
import { ClipComponentProps } from "./TimelineClips";
import { useClipDrag } from "./useClipDnd";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { PatternClip } from "types/Clip/ClipTypes";
import { Portaled } from "types/Portal/PortalTypes";
import {
  selectClosestPoseClipId,
  selectPortaledClipStyle,
} from "types/Arrangement/ArrangementSelectors";
import {
  selectIsDraggingSomeMedia,
  selectIsLive,
  selectIsTimelineAddingPatternClips,
  selectIsTimelineLive,
  selectSelectedTrackId,
} from "types/Timeline/TimelineSelectors";
import {
  onPatternClipClick,
  removeClipIdsFromSelection,
  toggleClipIdInSelection,
} from "types/Timeline/TimelineThunks";
import { useHotkeys } from "react-hotkeys-hook";
import { PatternClipScore } from "./PatternClip/PatternClipScore";
import { PatternClipHeader } from "./PatternClip/PatternClipHeader";
import { PatternClipStream } from "./PatternClip/PatternClipStream";
import { useWindowedState } from "hooks/window/useWindowedState";
import { DivMouseEvent } from "utils/html";

export const CLIP_NAME_HEIGHT = 24;
export const CLIP_STREAM_MARGIN = 8;

export interface PatternClipRendererProps extends ClipComponentProps {
  clip: PatternClip;
  portaledClip: Portaled<PatternClip>;
}

export function PatternClipRenderer(props: PatternClipRendererProps) {
  const { clip, portaledClip, isSelected, isPortaling, holdingI } = props;
  const pcId = portaledClip.id;
  const dispatch = useProjectDispatch();

  // Each pattern clip has a dropdown to show its score */
  const [showScore, setShowScore] = useState(false);
  useHotkeys("esc", () => setShowScore(false));

  // Each pattern clip listens to the closest overlapping pose clip */
  const poseClipId = use((_) => selectClosestPoseClipId(_, pcId));
  const isPoseClipOpen = useWindowedState(`dropdown_${poseClipId}`).state;

  // Each pattern clip can be dragged into any cell in a pattern track. */
  const [{ isDragging }, drag] = useClipDrag({ id: pcId, type: "pattern" });
  const isDraggingSomeMedia = use(selectIsDraggingSomeMedia);

  // Each pattern clip goes live when its track and pose clip are selected
  const isTimelineLive = use(selectIsTimelineLive);
  const selectedTrackId = use(selectSelectedTrackId);
  const onTrack = selectedTrackId === clip.trackId;
  const isLive = isTimelineLive && onTrack && !!poseClipId && isPoseClipOpen;

  // Each pattern clip checks for regular, meta, and alt clicks
  const onClick = useCallback(
    (e: DivMouseEvent) => {
      if (e.altKey) {
        dispatch(toggleClipIdInSelection(clip.id));
      } else if (e.metaKey) {
        setShowScore((prev) => !prev);
      } else if (isSelected) {
        if (showScore)
          dispatch(removeClipIdsFromSelection({ data: [clip.id] }));
        setShowScore((prev) => !prev);
      } else {
        dispatch(onPatternClipClick(e, clip, holdingI));
      }
    },
    [clip, isSelected, showScore, holdingI]
  );

  // Each portaled clip has a different style
  const style = useDeep((_) => selectPortaledClipStyle(_, portaledClip.id));
  const { top, left, width, height, fontSize } = style;

  // Compile the classname
  const fullDim = isDragging || isPortaling;
  const lightDim = isDraggingSomeMedia && isSelected;
  const addingClips = use(selectIsTimelineAddingPatternClips);
  const className = classNames(
    props.className,
    "flex flex-col rounded-lg",
    showScore ? "min-w-min z-[25]" : "border-2",
    { "border-white/0": showScore && !isSelected },
    { "border-slate-100": isSelected && !showScore },
    { "border-teal-500/50": !isSelected && !showScore },
    { "opacity-50 pointer-events-none": fullDim && !lightDim },
    { "opacity-80 pointer-events-none": lightDim && !fullDim },
    { "opacity-100 pointer-events-all": !fullDim && !lightDim },
    { "cursor-paintbrush hover:ring hover:ring-teal-500": addingClips },
    { "cursor-eyedropper hover:ring hover:ring-slate-300": holdingI },
    { "cursor-pointer": !addingClips && !holdingI }
  );

  // Render the pattern clip with a stream or score
  return (
    <div
      ref={drag}
      className={className}
      style={{ top, left, width, height, fontSize }}
      onClick={onClick}
    >
      <PatternClipHeader {...props} isLive={isLive} showScore={showScore} />
      {showScore ? (
        <PatternClipScore {...props} isLive={isLive} poseClipId={poseClipId} />
      ) : (
        <PatternClipStream {...props} />
      )}
    </div>
  );
}
