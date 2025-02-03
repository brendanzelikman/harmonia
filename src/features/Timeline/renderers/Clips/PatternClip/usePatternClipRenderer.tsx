import { memo, useMemo } from "react";
import { ClipComponentProps } from "../TimelineClips";
import { useClipDrag } from "../useClipDnd";
import { use, useDeep, useProjectDispatch } from "types/hooks";
import {
  Clip,
  PatternClipId,
  PortaledPatternClip,
  PortaledPatternClipId,
} from "types/Clip/ClipTypes";
import {
  createSelectedPortaledClipById,
  selectClosestPoseClipId,
  selectPortaledClipById,
} from "types/Arrangement/ArrangementSelectors";
import { PatternClipDropdown } from "./PatternClipDropdown";
import { PatternClipHeader } from "./PatternClipHeader";
import { PatternClipStream } from "./PatternClipStream";
import { DivMouseEvent } from "utils/html";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import { Timed } from "types/units";
import { usePatternClipStyle } from "./usePatternClipStyle";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { toggleClipDropdown } from "types/Clip/ClipThunks";
import { Subdivision } from "utils/durations";
import { Thunk } from "types/Project/ProjectTypes";

export const CLIP_NAME_HEIGHT = 24;
export const CLIP_STREAM_MARGIN = 8;

export interface PatternClipRendererProps extends ClipComponentProps {
  id: PatternClipId;
  pcId: PortaledPatternClipId;
  doesOverlap: boolean;
  subdivision: Subdivision;
  cellWidth: number;
}

export const PatternClipRenderer = memo(_PatternClipRenderer);

export function _PatternClipRenderer(props: PatternClipRendererProps) {
  const { pcId, id } = props;
  const { holdingI, doesOverlap } = props;
  const dispatch = useProjectDispatch();
  const selectClip = useMemo(
    () => createSelectedPortaledClipById(pcId),
    [pcId]
  );
  const portaledClip = useDeep(selectClip) as PortaledPatternClip;
  const clip = { ...portaledClip, id };

  // Each pattern clip listens to the closest overlapping pose clip */
  const poseClipId = use((_) => selectClosestPoseClipId(_, pcId));
  const poseClip = useDeep((_) =>
    poseClipId ? selectPortaledClipById(_, poseClipId) : undefined
  );

  // Each pattern clip can be dragged into any cell in a pattern track. */
  const [{ isDragging }, drag] = useClipDrag({
    id: pcId,
    type: "pattern",
    startDrag: props.startDrag,
    endDrag: props.endDrag,
  });

  // Each portaled clip has a different style
  const style = usePatternClipStyle({
    ...props,
    clip: portaledClip,
    doesOverlap,
    isDragging,
  });
  const { top, left, width, height, fontSize } = style;

  const Stream = useMemo(() => {
    if (!!clip.isOpen) return null;
    return (
      <PatternClipStream
        {...style}
        id={id}
        pcId={pcId}
        isSlicing={props.isSlicing}
      />
    );
  }, [props.isSlicing, !!clip.isOpen, ...style]);

  if (isScaleTrackId(clip.trackId)) return null;

  // Render the pattern clip with a stream or score
  return (
    <div
      id={`${pcId}-clip`}
      ref={drag}
      style={{ top, left, width, height, fontSize }}
      onClick={(e) => dispatch(onClick(e, clip, holdingI))}
      onDragStart={() =>
        dispatch(toggleClipDropdown({ data: { id, value: false } }))
      }
      className={style.className}
    >
      <PatternClipHeader {...props} id={id} />
      {Stream}
      {!!clip.isOpen && (
        <PatternClipDropdown
          {...props}
          clip={clip}
          portaledClip={portaledClip}
          isPosed={!!poseClip?.isOpen}
        />
      )}
    </div>
  );
}

const onClick =
  (e: DivMouseEvent, clip?: Timed<Clip>, holdingI = false): Thunk =>
  (dispatch) => {
    if (!clip) return;
    dispatch(onClipClick(e, clip, { eyedropping: holdingI }));
  };
