import { createPortal } from "react-dom";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  TRACK_WIDTH,
} from "utils/constants";
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
  selectTrackById,
  selectOrderedTrackIds,
} from "types/Track/TrackSelectors";
import { TimelineCursor } from "./TimelineCursor";

interface BackgroundProps {
  element?: HTMLDivElement;
}

// Timeline background so that the tracks can be scrolled
export const TimelineGraphics = (props: BackgroundProps) => {
  // Cell dimensions
  const cellWidth = use(selectCellWidth);
  const cellHeight = use(selectCellHeight);

  // The track dimensions are derived from the last track
  const trackIds = useDeep(selectOrderedTrackIds);
  const trackCount = trackIds.length;
  const ltId = trackIds[trackCount - 1];
  const lt = useDeep((_) => selectTrackById(_, ltId));
  const ltHeight = lt
    ? lt.collapsed
      ? COLLAPSED_TRACK_HEIGHT
      : cellHeight
    : 0;
  const trackHeight = useDeep((_) => selectTrackTop(_, ltId));
  const tracksHeight = trackHeight + ltHeight;

  // Selected track dimensions
  const st = useDeep(selectSelectedTrack);
  const stTop = useDeep((_) => selectTrackTop(_, st?.id));
  const stHeight = st?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;

  // GetBackground dimensions
  const columns = useDeep(selectTimelineColumns);
  const width = columns * cellWidth;
  const height = HEADER_HEIGHT + cellHeight * trackCount;

  /** The timeline header background.  */
  const TimelineHeaderBackground = () => (
    <div
      className="sticky inset-0 z-20 bg-black pointer-events-none"
      style={{ width, height: HEADER_HEIGHT }}
    ></div>
  );

  /** The timeline tracks background.  */
  const TimelineTracksBackground = () => {
    return (
      <div className="-z-20 absolute inset-0 flex" style={{ width, height }}>
        <div
          className="bg-transparent"
          style={{ width: TRACK_WIDTH, height: tracksHeight }}
        ></div>
        <div
          className="flex-1 bg-slate-400/25 shadow-xl"
          style={{ height: tracksHeight }}
        />
      </div>
    );
  };

  /** The selected track has a lighter background than other tracks. */
  const SelectedTrackBackground = () => (
    <div
      className="-z-10 absolute inset-0 bg-slate-300/25 flex flex-col pointer-events-none"
      style={{ width, height: stHeight, top: stTop }}
    />
  );

  /** The top left corner of the timeline. */
  const TimelineTopLeftCorner = () => (
    <div
      className="sticky inset-0 -mb-20 z-[90] bg-gradient-to-r from-gray-800 to-gray-900"
      style={{ width: TRACK_WIDTH, height: HEADER_HEIGHT }}
    />
  );

  /**
   * The graphical elements of the timeline that depend on scrolling include:
   * * The top left corner.
   * * The header background.
   * * The selected track background.
   * * The tracks background.
   * * The cursor.
   */
  const TimelineGraphicalElements = (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ height, width }}
    >
      <div className="relative w-full h-full">
        <TimelineTopLeftCorner />
        <TimelineHeaderBackground />
        {!!st && <SelectedTrackBackground />}
        <TimelineCursor />
        <TimelinePlayhead />
        <TimelineTracksBackground />
      </div>
    </div>
  );

  // Render the graphical elements into the timeline element
  if (!props.element) return null;
  return createPortal(TimelineGraphicalElements, props.element);
};
