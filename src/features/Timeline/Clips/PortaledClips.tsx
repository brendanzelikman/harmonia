import { createPortal } from "react-dom";
import { Clip } from "types/Clip";
import { TimelinePortalElement } from "..";
import { useProjectSelector } from "redux/hooks";
import { selectPortaledClipMap, selectSelectedClipIds } from "redux/selectors";
import { parsePortalChunkId } from "types/Portal";
import { ClipRenderer } from "./ClipRenderer";

export function PortaledClips(props: TimelinePortalElement) {
  const clipMap = useProjectSelector(selectPortaledClipMap);
  const selectedIds = useProjectSelector(selectSelectedClipIds);
  const clips = Object.values(clipMap);
  const { element } = props.timeline;

  const renderClip = (portaledChunk: Clip) => {
    const chunkId = portaledChunk.id;
    const originalId = parsePortalChunkId(chunkId);
    const clip = { ...portaledChunk, id: originalId };
    const isSelected = selectedIds.includes(originalId);
    return (
      <ClipRenderer
        key={chunkId}
        chunkId={chunkId}
        clip={clip}
        isSelected={isSelected}
      />
    );
  };

  if (!element) return null;
  return createPortal(clips.map(renderClip), element);
}
