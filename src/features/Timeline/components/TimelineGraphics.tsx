import { DataGridHandle } from "react-data-grid";
import { createPortal } from "react-dom";
import {
  selectCellHeight,
  selectCellWidth,
  selectSelectedTrack,
  selectTrackedObjectTop,
  selectTrackIds,
  selectTrackById,
  selectTimelineColumns,
} from "redux/selectors";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  TRACK_WIDTH,
} from "utils/constants";
import TimelineCursor from "./TimelineCursor";
import { useProjectSelector as use } from "redux/hooks";

interface BackgroundProps {
  timeline?: DataGridHandle;
}

// Timeline background so that the tracks can be scrolled
export const TimelineGraphics = (props: BackgroundProps) => {
  const { timeline } = props;

  // Cell dimensions
  const cellWidth = use(selectCellWidth);
  const cellHeight = use(selectCellHeight);

  // The track dimensions are derived from the last track
  const trackIds = use(selectTrackIds);
  const trackCount = trackIds.length;
  const ltId = trackIds.at(-1);
  const lt = use((_) => selectTrackById(_, ltId));
  const ltHeight = lt?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
  const tracksHeight = ltHeight + use((_) => selectTrackedObjectTop(_, lt));

  // Selected track dimensions
  const st = use(selectSelectedTrack);
  const stTop = use((_) => selectTrackedObjectTop(_, st));
  const stHeight = st?.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;

  // GetBackground dimensions
  const columns = use(selectTimelineColumns);
  const width = columns * cellWidth;
  const height = HEADER_HEIGHT + cellHeight * trackCount;
  const element = timeline?.element;

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
        <TimelineTracksBackground />
      </div>
    </div>
  );

  // Render the graphical elements into the timeline element
  if (!element) return null;
  return createPortal(TimelineGraphicalElements, element);
};
