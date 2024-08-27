import { use, useProjectDeepSelector } from "types/hooks";
import { selectPortals } from "types/Portal/PortalSelectors";
import { TimelinePortal } from "./PortalRenderer";
import { createPortal } from "react-dom";

import { hasKeys } from "utils/objects";
import { TimelinePortalElement } from "features/Timeline/Timeline";
import { Portal } from "types/Portal/PortalTypes";
import {
  isTimelineAddingPatternClips,
  isTimelineAddingPoseClips,
  isTimelinePortalingClips,
} from "types/Timeline/TimelineFunctions";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectSelectedPortalIds,
  selectTimeline,
  selectCellWidth,
  selectCellHeight,
  selectTimelineTickLeft,
} from "types/Timeline/TimelineSelectors";
import { selectTrackById } from "types/Track/TrackSelectors";

export function TimelinePortals(props: TimelinePortalElement) {
  const portals = useProjectDeepSelector(selectPortals);
  const selectedIds = use(selectSelectedPortalIds);
  const timeline = use(selectTimeline);
  const isClipping = isTimelineAddingPatternClips(timeline);
  const isTransposing = isTimelineAddingPoseClips(timeline);
  const isPortaling = isTimelinePortalingClips(timeline);
  const cellWidth = use(selectCellWidth);
  const cellHeight = use(selectCellHeight);

  // Get the fragment info
  const fragment = timeline.mediaDraft?.portal;
  const fragmentTrack = use((_) =>
    fragment?.trackId ? selectTrackById(_, fragment?.trackId) : undefined
  );
  const fragmentTop = use((_) => selectTrackTop(_, fragmentTrack?.id));
  const fragmentLeft = use((_) => selectTimelineTickLeft(_, fragment?.tick));

  const element = props.timeline?.element;
  if (!element) return null;

  // Render the portal with the given id
  const renderPortal = (portal: Portal) => {
    const isSelected = selectedIds.includes(portal.id);
    return (
      <TimelinePortal
        key={portal.id}
        portal={portal}
        width={cellWidth}
        height={cellHeight}
        isSelected={isSelected}
        isPortaling={isPortaling}
        isClipping={isClipping}
        isTransposing={isTransposing}
      />
    );
  };

  // Render the fragment
  const Fragment = () => {
    if (fragmentTop === undefined || fragmentLeft === undefined) return null;
    return (
      <TimelinePortal
        top={fragmentTop}
        left={fragmentLeft}
        width={cellWidth}
        height={cellHeight}
      />
    );
  };

  return (
    <>
      {createPortal(portals.map(renderPortal), element)}
      {isPortaling && hasKeys(fragment) && createPortal(<Fragment />, element)}
    </>
  );
}
