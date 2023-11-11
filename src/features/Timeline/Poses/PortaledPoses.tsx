import { PoseRenderer } from "./PoseRenderer";
import { createPortal } from "react-dom";
import { Pose } from "types/Pose";
import { useProjectSelector } from "redux/hooks";
import { TimelinePortalElement } from "../Timeline";
import { selectPortaledPoseMap, selectSelectedPoseIds } from "redux/selectors";
import { parsePortalChunkId } from "types/Portal";

export function PortaledPoses(props: TimelinePortalElement) {
  const poseMap = useProjectSelector(selectPortaledPoseMap);
  const selectedIds = useProjectSelector(selectSelectedPoseIds);
  const poses = Object.values(poseMap);
  const { element } = props.timeline;

  const renderPose = (portaledChunk: Pose) => {
    const chunkId = portaledChunk.id;
    const originalId = parsePortalChunkId(chunkId);
    const pose = { ...portaledChunk, id: originalId };
    const isSelected = selectedIds.includes(originalId);
    return (
      <PoseRenderer
        key={chunkId}
        chunkId={chunkId}
        pose={pose}
        isSelected={isSelected}
      />
    );
  };

  if (!element) return null;
  return createPortal(poses.map(renderPose), element);
}
