import { TranspositionRenderer } from "./TranspositionRenderer";
import { createPortal } from "react-dom";
import { Transposition } from "types/Transposition";
import { useProjectSelector } from "redux/hooks";
import { TimelinePortalElement } from "../Timeline";
import {
  selectPortaledTranspositionMap,
  selectSelectedPoseIds,
} from "redux/selectors";
import { parsePortalChunkId } from "types/Portal";

export function PortaledTranspositions(props: TimelinePortalElement) {
  const transpositionMap = useProjectSelector(selectPortaledTranspositionMap);
  const selectedIds = useProjectSelector(selectSelectedPoseIds);
  const transpositions = Object.values(transpositionMap);
  const { element } = props.timeline;

  const renderTransposition = (portaledChunk: Transposition) => {
    const chunkId = portaledChunk.id;
    const originalId = parsePortalChunkId(chunkId);
    const transposition = { ...portaledChunk, id: originalId };
    const isSelected = selectedIds.includes(originalId);
    return (
      <TranspositionRenderer
        key={chunkId}
        chunkId={chunkId}
        transposition={transposition}
        isSelected={isSelected}
      />
    );
  };

  if (!element) return null;
  return createPortal(transpositions.map(renderTransposition), element);
}
