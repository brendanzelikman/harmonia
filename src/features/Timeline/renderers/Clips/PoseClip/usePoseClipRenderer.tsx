import { useState } from "react";
import { useClipDrag } from "../useClipDnd";

import { useProjectDispatch, use } from "types/hooks";
import { ClipComponentProps } from "../TimelineClips";
import { PortaledPoseClip, PoseClip } from "types/Clip/ClipTypes";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { PoseClipDropdown } from "./PoseClipDropdown";
import { PoseClipHeader } from "./PoseClipHeader";
import { useDragState } from "types/Media/MediaTypes";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import { Timed } from "types/units";
import { usePoseClipStyle } from "./usePoseClipStyle";
import { getPoseBlockFromStream } from "types/Pose/PoseFunctions";
import { PoseClipCombos } from "./PoseClipCombos";
import { PoseBlock } from "types/Pose/PoseTypes";
import { toggleClipDropdown } from "types/Clip/ClipThunks";

export interface PoseClipRendererProps extends ClipComponentProps {
  clip: Timed<PoseClip>;
  portaledClip: PortaledPoseClip;
}

export type PoseClipView = "vector" | "stream";

export function PoseClipRenderer(props: PoseClipRendererProps) {
  const { clip, portaledClip, holdingI, isLive } = props;
  const pose = use((_) => selectPoseById(_, clip.poseId));
  const stream = pose?.stream ?? [];
  const pcId = portaledClip.id;
  const dispatch = useProjectDispatch();

  // Each pose has a dropdown to reveal its editor
  const [field, setField] = useState<PoseClipView>("vector");

  // Each pose can be dragged into another cell
  const dragState = useDragState();
  const [{ isDragging }, drag] = useClipDrag({ id: pcId, type: "pose" });
  const isDraggingOther = dragState.any;

  // Any block can be selected by index, with depths for nested streams
  const [index, setIndex] = useState(0);
  const [depths, setDepths] = useState<number[]>([]);
  const block = getPoseBlockFromStream(stream, [...depths, index]);

  // Each pose has a style that depends on its state
  const { className, ...style } = usePoseClipStyle({
    ...props,
    isDragging,
    isDraggingOther,
  });

  const clipProps = {
    block,
    index,
    setIndex,
    depths,
    setDepths,
    field,
    setField,
  };

  return (
    <div
      ref={drag}
      className={className}
      style={style}
      onClick={(e) => dispatch(onClipClick(e, clip, { eyedropping: holdingI }))}
      onDragStart={() =>
        dispatch(toggleClipDropdown({ data: { id: pcId, value: false } }))
      }
    >
      <PoseClipCombos isLive={isLive} />
      <PoseClipHeader {...props} {...clipProps} />
      <PoseClipDropdown {...props} {...clipProps} />
    </div>
  );
}

export interface PoseClipComponentProps extends PoseClipRendererProps {
  block?: PoseBlock;
  index: number;
  setIndex: (index: number) => void;
  depths: number[];
  setDepths: React.Dispatch<React.SetStateAction<number[]>>;
  field: PoseClipView;
  setField: (field: PoseClipView) => void;
}
