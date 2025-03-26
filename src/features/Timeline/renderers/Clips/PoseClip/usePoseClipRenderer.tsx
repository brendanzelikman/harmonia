import { memo, useState } from "react";
import { useClipDrag } from "../useClipDnd";

import { useProjectDispatch, useDeep } from "types/hooks";
import { ClipComponentProps } from "../TimelineClips";
import { PortaledPoseClipId, PoseClipId } from "types/Clip/ClipTypes";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { PoseClipDropdown } from "./PoseClipDropdown";
import { PoseClipHeader } from "./PoseClipHeader";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";

import {
  PoseBlock,
  PoseTransformation,
  PoseVector,
} from "types/Pose/PoseTypes";
import { toggleClipDropdown } from "types/Clip/ClipThunks";
import { selectPortaledPoseClip } from "types/Arrangement/ArrangementClipSelectors";
import { selectClipWidth } from "types/Arrangement/ArrangementClipSelectors";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectIsAddingPortals,
  selectIsAddingPoseClips,
  selectIsClipSelected,
  selectTimelineTickLeft,
  selectTrackHeight,
} from "types/Timeline/TimelineSelectors";
import { ScaleNote } from "types/Scale/ScaleTypes";

export interface PoseClipRendererProps extends ClipComponentProps {
  id: PoseClipId;
  pcId: PortaledPoseClipId;
}

export type PoseClipView = "vector" | "stream";

export const PoseClipRenderer = memo((props: PoseClipRendererProps) => {
  const { id, pcId, className, isDragging } = props;

  const clip = useDeep((_) => selectPortaledPoseClip(_, pcId));
  const { trackId, tick, type, isOpen } = clip;
  const isSelected = useDeep((_) => selectIsClipSelected(_, id));

  const pose = useDeep((_) => selectPoseById(_, clip.poseId));
  const stream = pose?.stream ?? [];
  const dispatch = useProjectDispatch();
  const isAdding = useDeep(selectIsAddingPoseClips);
  const isPortaling = useDeep(selectIsAddingPortals);
  const isBlurred = isAdding || isPortaling || isDragging;

  // Each pose has a dropdown to reveal its editor
  const [field, setField] = useState<PoseClipView>("vector");

  // Each pose can be dragged into another cell
  const [_, drag] = useClipDrag(pcId);

  // Any block can be selected by index, with depths for nested streams
  const vector = pose?.vector;
  const scale = pose?.scale;
  const operations = pose?.operations;
  const block = pose?.stream ? stream[0] : undefined;

  const clipProps = {
    vector,
    scale,
    operations,
    block,
    field,
    setField,
  };

  // Each pose has a style that depends on its state
  const top = useDeep((_) => selectTrackTop(_, trackId));
  const left = useDeep((_) => selectTimelineTickLeft(_, tick));
  const width = useDeep((_) => selectClipWidth(_, pcId));
  const height = useDeep((_) => selectTrackHeight(_, trackId));
  if (!clip) return null;
  return (
    <div
      ref={drag}
      data-type={type}
      data-open={isOpen}
      data-selected={isSelected}
      data-blur={isBlurred}
      className={className}
      style={{ top, left, width, height }}
      onClick={(e) => dispatch(onClipClick(e, { ...clip, id }))}
      onDragStart={() =>
        dispatch(toggleClipDropdown({ data: { id: pcId, value: false } }))
      }
    >
      <PoseClipHeader id={id} isOpen={!!isOpen} />
      {isOpen && <PoseClipDropdown {...props} {...clipProps} clip={clip} />}
    </div>
  );
});

export interface PoseClipComponentProps extends PoseClipRendererProps {
  vector?: PoseVector;
  scale?: ScaleNote[];
  operations?: PoseTransformation[];
  block?: PoseBlock;
  field: PoseClipView;
  setField: (field: PoseClipView) => void;
}
