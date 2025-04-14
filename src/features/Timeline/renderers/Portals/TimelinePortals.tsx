import { useAppValue } from "hooks/useRedux";
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
import { Timed } from "types/units";
import { some } from "lodash";
import { useMemo } from "react";

export function TimelinePortals(props: TimelineElement) {
  const portals = useAppValue(selectPortals);
  const selectedIds = useAppValue(selectSelectedPortalIds);
  const isPortaling = useAppValue(selectIsAddingPortals);
  const cellWidth = useAppValue(selectCellWidth);
  const cellHeight = useAppValue(selectCellHeight);

  // Get the fragment info
  const fragment = useAppValue(selectPortalFragment);
  const fragmentTop = useAppValue((_) => selectTrackTop(_, fragment?.trackId));
  const fragmentLeft = useAppValue((_) =>
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

  const hasFragment = useMemo(
    () => isPortaling && some(fragment),
    [isPortaling, fragment]
  );

  if (!props.element) return null;
  return (
    <>
      {createPortal(portals.map(renderPortal), props.element)}
      {hasFragment && createPortal(<Fragment />, props.element)}
    </>
  );
}
