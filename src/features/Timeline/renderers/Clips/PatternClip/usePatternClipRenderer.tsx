import { useCallback } from "react";
import { ClipComponentProps } from "../TimelineClips";
import { useClipDrag } from "../useClipDnd";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import { PatternClip } from "types/Clip/ClipTypes";
import { Portaled } from "types/Portal/PortalTypes";
import {
  selectClosestPoseClipId,
  selectOverlappingPortaledClipIds,
  selectPatternClipMidiStream,
  selectPortaledClipById,
} from "types/Arrangement/ArrangementSelectors";
import {
  removeClipIdsFromSelection,
  toggleClipIdInSelection,
} from "types/Timeline/thunks/TimelineSelectionThunks";
import { PatternClipDropdown } from "./PatternClipDropdown";
import { PatternClipHeader } from "./PatternClipHeader";
import { PatternClipStream } from "./PatternClipStream";
import { DivMouseEvent } from "utils/html";
import { useDragState } from "types/Media/MediaTypes";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import { Timed } from "types/units";
import { usePatternClipStyle } from "./usePatternClipStyle";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { toggleClipDropdown } from "types/Clip/ClipThunks";

export const CLIP_NAME_HEIGHT = 24;
export const CLIP_STREAM_MARGIN = 8;

export interface PatternClipRendererProps extends ClipComponentProps {
  clip: Timed<PatternClip>;
  portaledClip: Portaled<PatternClip>;
}

export function PatternClipRenderer(props: PatternClipRendererProps) {
  const { clip, portaledClip, holdingI, selectedTrackId } = props;
  const { isLive, isSelected, isOpen } = props;
  const pcId = portaledClip.id;
  const dispatch = useProjectDispatch();

  // Each pattern clip listens to the closest overlapping pose clip */
  const stream = useDeep((_) => selectPatternClipMidiStream(_, pcId));
  const poseClipId = use((_) => selectClosestPoseClipId(_, pcId));
  const poseClip = useDeep((_) =>
    poseClipId ? selectPortaledClipById(_, poseClipId) : undefined
  );
  const overlaps = useDeep((_) => selectOverlappingPortaledClipIds(_, pcId));
  const doesOverlap = !!overlaps.length;

  // Each pattern clip can be dragged into any cell in a pattern track. */
  const dragState = useDragState();
  const [{ isDragging }, drag] = useClipDrag({ id: pcId, type: "pattern" });
  const isDraggingOtherMedia = dragState.any;

  // Each pattern clip goes live when its track and pose clip are selected
  const onTrack = selectedTrackId === clip.trackId;
  const isClipLive = isLive && onTrack && !!poseClipId && !!isOpen;

  // Each pattern clip checks for regular, meta, and alt clicks
  const onClick = useCallback(
    (e: DivMouseEvent) => {
      if (e.altKey) {
        dispatch(toggleClipIdInSelection(clip.id));
      } else if (e.metaKey) {
        dispatch(toggleClipDropdown({ data: { id: clip.id } }));
      } else if (isSelected) {
        if (isOpen) {
          dispatch(removeClipIdsFromSelection({ data: [clip.id] }));
        }
        dispatch(toggleClipDropdown({ data: { id: clip.id } }));
      } else {
        dispatch(onClipClick(e, clip, { eyedropping: holdingI }));
      }
    },
    [clip, isSelected, isOpen, holdingI]
  );

  // Each portaled clip has a different style
  const style = usePatternClipStyle({
    ...props,
    isDragging,
    isDraggingOtherMedia,
    stream,
    doesOverlap,
  });
  const { top, left, width, height, fontSize } = style;
  if (isScaleTrackId(clip.trackId)) return null;

  // Render the pattern clip with a stream or score
  return (
    <div
      id={`${portaledClip.id}-clip`}
      ref={drag}
      style={{ top, left, width, height, fontSize }}
      onClick={onClick}
      onDragStart={() =>
        dispatch(toggleClipDropdown({ data: { id: clip.id, value: false } }))
      }
      className={style.className}
    >
      <PatternClipHeader {...props} isLive={isClipLive} />
      {!isOpen && <PatternClipStream {...props} style={style} />}
      <PatternClipDropdown
        {...props}
        isLive={isClipLive}
        isPosed={!!poseClip?.isOpen}
      />
    </div>
  );
}
