import { useCallback } from "react";
import classNames from "classnames";
import { ClipComponentProps } from "../TimelineClips";
import { useClipDrag } from "../useClipDnd";
import { use, useProjectDispatch } from "types/hooks";
import { PatternClip } from "types/Clip/ClipTypes";
import { Portaled } from "types/Portal/PortalTypes";
import { selectClosestPoseClipId } from "types/Arrangement/ArrangementSelectors";
import {
  removeClipIdsFromSelection,
  toggleClipIdInSelection,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import { PatternClipDropdown } from "./PatternClipDropdown";
import { PatternClipHeader } from "./PatternClipHeader";
import { PatternClipStream } from "./PatternClipStream";
import { useToggledState } from "hooks/useToggledState";
import { DivMouseEvent } from "utils/html";
import { useDragState } from "types/Media/MediaTypes";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import { Timed } from "types/units";
import { usePatternClipStyle } from "./usePatternClipStyle";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";

export const CLIP_NAME_HEIGHT = 24;
export const CLIP_STREAM_MARGIN = 8;

export interface PatternClipRendererProps extends ClipComponentProps {
  clip: Timed<PatternClip>;
  portaledClip: Portaled<PatternClip>;
}

export function PatternClipRenderer(props: PatternClipRendererProps) {
  const { clip, portaledClip, holdingI, selectedTrackId } = props;
  const { isAdding, isLive, isSelected, isPortaling } = props;
  const pcId = portaledClip.id;
  const dispatch = useProjectDispatch();

  // Each pattern clip has a dropdown to show its score */
  const score = useToggledState(`score_${pcId}`);
  const showScore = score.isOpen;

  // Each pattern clip listens to the closest overlapping pose clip */
  const poseClipId = use((_) => selectClosestPoseClipId(_, pcId));
  const poseClipDropdown = useToggledState(`dropdown_${poseClipId}`);
  const isPoseClipOpen = poseClipDropdown.isOpen;

  // Each pattern clip can be dragged into any cell in a pattern track. */
  const dragState = useDragState();
  const [{ isDragging }, drag] = useClipDrag({ id: pcId, type: "pattern" });
  const isDraggingOtherMedia = dragState.any;

  // Each pattern clip goes live when its track and pose clip are selected
  const onTrack = selectedTrackId === clip.trackId;
  const isClipLive = isLive && onTrack && !!poseClipId && isPoseClipOpen;

  // Each pattern clip checks for regular, meta, and alt clicks
  const onClick = useCallback(
    (e: DivMouseEvent) => {
      if (e.altKey) {
        dispatch(toggleClipIdInSelection(clip.id));
      } else if (e.metaKey) {
        score.toggle();
      } else if (isSelected) {
        if (score.isOpen) {
          dispatch(removeClipIdsFromSelection({ data: [clip.id] }));
        }
        score.toggle();
      } else {
        dispatch(onClipClick(e, clip, { eyedropping: holdingI }));
      }
    },
    [clip, isSelected, score, holdingI]
  );

  // Each portaled clip has a different style
  const style = usePatternClipStyle({
    ...props,
    isDragging: isDraggingOtherMedia,
  });
  const { top, left, width, height, fontSize } = style;

  // Compile the classname
  const fullDim = isDragging || isPortaling;
  const lightDim = isDraggingOtherMedia && isSelected;
  const className = classNames(
    props.className,
    "flex flex-col rounded-lg rounded-b-none",
    showScore ? "min-w-min z-[25]" : "border-2",
    { "border-white/0": showScore },
    { "border-slate-100": isSelected && !showScore },
    { "border-teal-500/50": !isSelected && !showScore },
    { "opacity-50 pointer-events-none": fullDim },
    { "opacity-80 pointer-events-none": lightDim && !fullDim },
    { "opacity-100 pointer-events-all": !fullDim && !lightDim },
    { "cursor-paintbrush hover:ring hover:ring-teal-500": isAdding },
    { "cursor-eyedropper hover:ring hover:ring-slate-300": holdingI },
    { "cursor-pointer": !isAdding && !holdingI }
  );

  if (isScaleTrackId(clip.trackId)) return null;
  // Render the pattern clip with a stream or score
  return (
    <div
      id={`${portaledClip.id}-clip`}
      ref={drag}
      style={{ top, left, width, height, fontSize }}
      onClick={onClick}
      className={className}
    >
      <PatternClipHeader {...props} isLive={isClipLive} showScore={showScore} />
      <PatternClipStream {...props} style={style} showScore={showScore} />
      {showScore ? (
        <PatternClipDropdown
          {...props}
          isLive={isClipLive}
          poseClipId={poseClipId}
        />
      ) : null}
    </div>
  );
}
