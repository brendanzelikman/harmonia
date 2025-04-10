import { useSelect } from "hooks/useStore";
import { selectPortals } from "types/Portal/PortalSelectors";
import { TimelinePortal } from "./PortalRenderer";
import { createPortal } from "react-dom";

import { TimelineElement } from "../../Timeline";
import { Portal } from "types/Portal/PortalTypes";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectSelectedPortalIds,
  selectCellWidth,
  selectCellHeight,
  selectTimelineTickLeft,
  selectIsAddingPortals,
  selectPortalFragment,
} from "types/Timeline/TimelineSelectors";
import { selectTrackById } from "types/Track/TrackSelectors";
import { Timed } from "types/units";
import { some } from "lodash";

export function TimelinePortals(props: TimelineElement) {
  const portals = useSelect(selectPortals);
  const selectedIds = useSelect(selectSelectedPortalIds);
  const isPortaling = useSelect(selectIsAddingPortals);
  const cellWidth = useSelect(selectCellWidth);
  const cellHeight = useSelect(selectCellHeight);

  // Get the fragment info
  const fragment = useSelect(selectPortalFragment);
  const fragmentTrack = useSelect((_) =>
    fragment?.trackId ? selectTrackById(_, fragment?.trackId) : undefined
  );

  const fragmentTop = useSelect((_) => selectTrackTop(_, fragmentTrack?.id));
  const fragmentLeft = useSelect((_) =>
    selectTimelineTickLeft(_, fragment?.tick)
  );

  // Render the portal with the given id
  const renderPortal = (portal: Portal) => {
    const isSelected = selectedIds.includes(portal.id);
    if (!portal.trackId || !portal.portaledTrackId) return null;
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

  if (!props.element) return null;
  return (
    <>
      {createPortal(portals.map(renderPortal), props.element)}
      {isPortaling &&
        some(fragment) &&
        createPortal(<Fragment />, props.element)}
    </>
  );
}
