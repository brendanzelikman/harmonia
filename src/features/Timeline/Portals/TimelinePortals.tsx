import { useProjectDeepSelector, useProjectSelector } from "redux/hooks";
import { TimelinePortalElement } from "../Timeline";
import { selectPortalIds, selectPortals } from "redux/Portal/PortalSelectors";
import { Portal, PortalId } from "types/Portal";
import { TimelinePortal } from "./PortalRenderer";
import { createPortal } from "react-dom";
import {
  selectCell,
  selectTimeline,
  selectTrackedObjectTop,
  selectTimelineTickLeft,
  selectSelectedPortalIds,
} from "redux/Timeline";
import {
  isTimelineAddingClips,
  isTimelineAddingPoses,
  isTimelinePortalingMedia,
} from "types/Timeline";
import { selectTrackById } from "redux/Track";
import { hasKeys } from "utils/objects";

export function TimelinePortals(props: TimelinePortalElement) {
  const portals = useProjectDeepSelector(selectPortals);
  const selectedIds = useProjectSelector(selectSelectedPortalIds);
  const timeline = useProjectSelector(selectTimeline);
  const isClipping = isTimelineAddingClips(timeline);
  const isTransposing = isTimelineAddingPoses(timeline);
  const isPortaling = isTimelinePortalingMedia(timeline);
  const { width, height } = useProjectSelector(selectCell);

  // Get the fragment info
  const fragment = timeline.mediaDraft.portal;
  const fragmentTrack = useProjectSelector((_) =>
    selectTrackById(_, fragment?.trackId)
  );
  const fragmentTop = useProjectSelector((_) =>
    selectTrackedObjectTop(_, fragmentTrack)
  );
  const fragmentLeft = useProjectSelector((_) =>
    selectTimelineTickLeft(_, fragment?.tick)
  );

  const { element } = props.timeline;
  if (!element) return null;

  // Render the portal with the given id
  const renderPortal = (portal: Portal) => {
    const isSelected = selectedIds.includes(portal.id);
    return (
      <TimelinePortal
        key={portal.id}
        portal={portal}
        width={width}
        height={height}
        isSelected={isSelected}
        isPortaling={isPortaling}
        isClipping={isClipping}
        isTransposing={isTransposing}
      />
    );
  };

  // Render the fragment
  const Fragment = () => (
    <TimelinePortal
      top={fragmentTop}
      left={fragmentLeft}
      width={width}
      height={height}
    />
  );

  return (
    <>
      {createPortal(portals.map(renderPortal), element)}
      {isPortaling && hasKeys(fragment) && createPortal(<Fragment />, element)}
    </>
  );
}
