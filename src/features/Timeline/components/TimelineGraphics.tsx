import { createPortal } from "react-dom";
import { COLLAPSED_TRACK_HEIGHT, HEADER_HEIGHT } from "utils/constants";
import { TimelinePlayhead } from "./TimelinePlayhead";
import { useProjectSelector as use, useDeep } from "types/hooks";
import { selectTrackTop } from "types/Arrangement/ArrangementTrackSelectors";
import {
  selectCellWidth,
  selectCellHeight,
  selectSelectedTrack,
  selectTimelineColumns,
} from "types/Timeline/TimelineSelectors";
import {
  selectOrderedTrackIds,
  selectCollapsedTrackMap,
} from "types/Track/TrackSelectors";
import { TimelineCursor } from "./TimelineCursor";
import { TimelineTopLeftCorner } from "./TimelineTopLeftCorner";
import { useCallback, useMemo } from "react";

interface BackgroundProps {
  element?: HTMLDivElement;
}

// Timeline background so that the tracks can be scrolled
export const TimelineGraphics = (props: BackgroundProps) => {
  const cellWidth = use(selectCellWidth);
  const cellHeight = use(selectCellHeight);

  // The track dimensions are derived from the last track
  const collapsedMap = useDeep(selectCollapsedTrackMap);
  const trackIds = useDeep(selectOrderedTrackIds);

  // Selected track dimensions
  const st = useDeep(selectSelectedTrack);
  const stTop = useDeep((_) => selectTrackTop(_, st?.id));
  const stHeight = st?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;

  // GetBackground dimensions
  const columns = useDeep(selectTimelineColumns);
  const width = columns * cellWidth;
  const height = trackIds.reduce(
    (acc, id) =>
      collapsedMap[id] ? acc + COLLAPSED_TRACK_HEIGHT : acc + cellHeight,
    0
  );

  /** The timeline header background.  */
  const TimelineHeaderBackground = useCallback(
    () => (
      <div
        className="sticky inset-0 z-20 bg-black pointer-events-none"
        style={{ width, height: HEADER_HEIGHT }}
      ></div>
    ),
    [width]
  );

  /** The selected track has a lighter background than other tracks. */
  const SelectedTrackBackground = useCallback(
    () => (
      <div
        className="-z-10 absolute inset-0 bg-slate-300/25 flex flex-col pointer-events-none"
        style={{ width, height: stHeight, top: stTop }}
      />
    ),
    [width, height, stHeight, stTop]
  );

  const children = useMemo(
    () => (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ height, width }}
      >
        <div className="relative w-full h-full">
          {TimelineTopLeftCorner}
          <TimelineHeaderBackground />
          {!!st && <SelectedTrackBackground />}
          <TimelineCursor />
          <TimelinePlayhead />
        </div>
      </div>
    ),
    [st, width, height]
  );

  /**
   * Render the graphical elements of the timeline that depend on scrolling, including:
   * * The top left corner.
   * * The header background.
   * * The selected track background.
   * * The tracks background.
   * * The cursor.
   */
  if (!props.element) return null;
  return createPortal(children, props.element);
};
