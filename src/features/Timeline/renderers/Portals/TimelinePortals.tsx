import { use, useDeep } from "types/hooks";
import { selectPortals } from "types/Portal/PortalSelectors";
import { TimelinePortal } from "./PortalRenderer";
import { createPortal } from "react-dom";

import { TimelinePortalElement } from "features/Timeline/Timeline";
import { Portal } from "types/Portal/PortalTypes";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectSelectedPortalIds,
  selectTimeline,
  selectCellWidth,
  selectCellHeight,
  selectTimelineTickLeft,
  selectIsAddingPortals,
} from "types/Timeline/TimelineSelectors";
import { selectTrackById } from "types/Track/TrackSelectors";
import { Timed } from "types/units";
import { some } from "lodash";

export function TimelinePortals(props: TimelinePortalElement) {
  const portals = useDeep(selectPortals);
  const selectedIds = use(selectSelectedPortalIds);
  const timeline = use(selectTimeline);
  const isPortaling = use(selectIsAddingPortals);
  const cellWidth = use(selectCellWidth);
  const cellHeight = use(selectCellHeight);

  // Get the fragment info
  const fragment = timeline.draft?.portal;
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
        portal={{ ...portal, duration: 1 } as Timed<Portal>}
        width={cellWidth}
        height={cellHeight}
        isSelected={isSelected}
        isPortaling={isPortaling}
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
      {isPortaling && some(fragment) && createPortal(<Fragment />, element)}
    </>
  );
}
