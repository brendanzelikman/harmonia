import TimelineClip from "./Clip";
import { createPortal } from "react-dom";
import { ClipId } from "types/Clip";
import { TimelinePortalElement } from "..";
import { selectClipIds } from "redux/Clip";
import { useProjectDeepSelector } from "redux/hooks";

export function TimelineClips(props: TimelinePortalElement) {
  const clipIds = useProjectDeepSelector(selectClipIds);
  const { element } = props.timeline;
  if (!element || !clipIds.length) return null;

  const renderClip = (id: ClipId) => <TimelineClip key={id} id={id} />;

  return createPortal(clipIds.map(renderClip), element);
}
