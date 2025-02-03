import { useMemo, useState } from "react";
import { useClipDrag } from "../useClipDnd";

import { useProjectDispatch, use, useDeep } from "types/hooks";
import { ClipComponentProps } from "../TimelineClips";
import {
  PortaledPoseClip,
  PortaledPoseClipId,
  PoseClipId,
} from "types/Clip/ClipTypes";
import { selectPoseById } from "types/Pose/PoseSelectors";
import { PoseClipDropdown } from "./PoseClipDropdown";
import { PoseClipHeader } from "./PoseClipHeader";
import { onClipClick } from "types/Timeline/thunks/TimelineClickThunks";
import { usePoseClipStyle } from "./usePoseClipStyle";
import {
  getPoseBlockFromStream,
  getPoseVectorAsJSX,
} from "types/Pose/PoseFunctions";
import { PoseClipCombos } from "./PoseClipCombos";
import {
  PoseBlock,
  PoseTransformation,
  PoseVector,
} from "types/Pose/PoseTypes";
import { toggleClipDropdown } from "types/Clip/ClipThunks";
import { createSelectedPortaledClipById } from "types/Arrangement/ArrangementSelectors";
import { selectTrackMap } from "types/Track/TrackSelectors";

export interface PoseClipRendererProps extends ClipComponentProps {
  id: PoseClipId;
  pcId: PortaledPoseClipId;
}

export type PoseClipView = "vector" | "stream";

export function PoseClipRenderer(props: PoseClipRendererProps) {
  const { holdingI, id, pcId } = props;
  const selectClip = useMemo(
    () => createSelectedPortaledClipById(pcId),
    [pcId]
  );
  const clip = useDeep(selectClip) as PortaledPoseClip;
  const pose = use((_) => selectPoseById(_, clip.poseId));
  const stream = pose?.stream ?? [];
  const dispatch = useProjectDispatch();

  // Each pose has a dropdown to reveal its editor
  const [field, setField] = useState<PoseClipView>("vector");

  // Each pose can be dragged into another cell
  const [_, drag] = useClipDrag({
    id: pcId,
    type: "pose",
    startDrag: props.startDrag,
    endDrag: props.endDrag,
  });

  // Any block can be selected by index, with depths for nested streams
  const [index, setIndex] = useState(0);
  const [depths, setDepths] = useState<number[]>([]);
  const vector = pose?.vector;
  const operations = pose?.operations;
  const block = pose?.stream
    ? getPoseBlockFromStream(stream, [...depths, index])
    : undefined;

  const clipProps = {
    vector,
    operations,
    block,
    index,
    setIndex,
    depths,
    setDepths,
    field,
    setField,
  };

  // Each pose has a style that depends on its state
  const { className, ...style } = usePoseClipStyle({
    ...props,
    ...clipProps,
    clip,
  });

  const trackMap = useDeep(selectTrackMap);
  const jsx = getPoseVectorAsJSX(
    pose?.vector ?? block?.vector,
    trackMap,
    false
  );

  return (
    <div
      ref={drag}
      className={className}
      style={style}
      onClick={(e) =>
        dispatch(onClipClick(e, { ...clip, id }, { eyedropping: holdingI }))
      }
      onDragStart={() =>
        dispatch(toggleClipDropdown({ data: { id: pcId, value: false } }))
      }
    >
      <PoseClipCombos id={clip.id} />
      <PoseClipHeader {...props} {...clipProps} clip={clip} />
      <PoseClipDropdown {...props} {...clipProps} clip={clip} />
      <div className="flex-1 text-[10px] flex flex-col overflow-scroll pl-1 text-white opacity-80 select-none">
        {!clip.isOpen ? jsx : null}
      </div>
    </div>
  );
}

export interface PoseClipComponentProps extends PoseClipRendererProps {
  vector?: PoseVector;
  operations?: PoseTransformation[];
  block?: PoseBlock;
  index: number;
  setIndex: (index: number) => void;
  depths: number[];
  setDepths: React.Dispatch<React.SetStateAction<number[]>>;
  field: PoseClipView;
  setField: (field: PoseClipView) => void;
}
