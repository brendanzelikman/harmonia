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
import {
  removeClipIdsFromSelection,
  toggleClipIdInSelection,
} from "types/Timeline/thunks/TimelineSelectionThunks";
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
import { selectIsClipSelected } from "types/Timeline/TimelineSelectors";
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

export function PatternClipRenderer(props: PatternClipRendererProps) {
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

  if (isScaleTrackId(!!clip?.trackId)) return null;

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
      <PatternClipHeader {...props} id={id} clip={clip} />
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
  (dispatch, getProject) => {
    if (!clip) return;
    const id = clip.id;
    const project = getProject();
    const isSelected = selectIsClipSelected(project, id);
    if (!clip) return;
    if (e.altKey) {
      dispatch(toggleClipIdInSelection(id));
    } else if (e.metaKey) {
      dispatch(toggleClipDropdown({ data: { id } }));
    } else if (isSelected) {
      if (clip.isOpen) {
        dispatch(removeClipIdsFromSelection({ data: [id] }));
      }
      dispatch(toggleClipDropdown({ data: { id } }));
    } else {
      dispatch(onClipClick(e, clip, { eyedropping: holdingI }));
    }
  };
