import { DataGridHandle } from "react-data-grid";
import { createPortal } from "react-dom";
import { Project } from "types/Project";
import {
  selectCellHeight,
  selectCellWidth,
  selectSelectedTrack,
  selectTimelineObjectTop,
  selectOrderedTrackIds,
  selectTrackById,
  selectTimelineColumnCount,
} from "redux/selectors";
import { ConnectedProps, connect } from "react-redux";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  TRACK_WIDTH,
} from "utils/constants";
import TimelineCursor from "./TimelineCursor";

interface BackgroundProps {
  timeline?: DataGridHandle;
}

const mapStateToProps = (project: Project, ownProps: BackgroundProps) => {
  const columns = selectTimelineColumnCount(project);

  // General dimensions
  const cellWidth = selectCellWidth(project);
  const cellHeight = selectCellHeight(project);

  // Track background height
  const lastTrackId = selectOrderedTrackIds(project).at(-1);
  const lastTrack = selectTrackById(project, lastTrackId);
  const tracksHeight = selectTimelineObjectTop(project, lastTrack);
  const lastTrackHeight = lastTrack
    ? !!lastTrack.collapsed
      ? COLLAPSED_TRACK_HEIGHT
      : cellHeight
    : 0;

  // Selected track background
  const selectedTrack = selectSelectedTrack(project);
  const selectedTrackTop = selectTimelineObjectTop(project, selectedTrack);

  const selectedTrackHeight = selectedTrack
    ? !!selectedTrack.collapsed
      ? COLLAPSED_TRACK_HEIGHT
      : cellHeight
    : 0;

  // Cursor properties
  const cursorHeight = cellHeight;

  // Background dimensions
  const width = columns * cellWidth;
  const rowCount = selectOrderedTrackIds(project).length;
  const height = HEADER_HEIGHT + cellHeight * rowCount;

  return {
    ...ownProps,
    cursorHeight,
    width,
    height,
    cellWidth,
    cellHeight,
    tracksHeight,
    lastTrackHeight,
    selectedTrack,
    selectedTrackTop,
    selectedTrackHeight,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(TimelineGraphics);

// Timeline background so that the tracks can be scrolled
function TimelineGraphics(props: Props) {
  const { timeline, width, height } = props;
  const element = timeline?.element;

  // Timeline time background
  const TimelineTimeBackground = () => (
    <div
      className="sticky inset-0 z-20 bg-black pointer-events-none"
      style={{ width, height: HEADER_HEIGHT }}
    ></div>
  );

  // Timeline background
  const TimelineBackground = () => (
    <div
      className="-z-20 absolute inset-0 flex flex-col"
      style={{ width, height }}
    >
      <div
        className="w-full bg-slate-500/80 shadow-xl"
        style={{ height: props.tracksHeight + props.lastTrackHeight }}
      />
    </div>
  );

  // Timeline background
  const SelectedTrackBackground = () => (
    <div
      className="-z-10 absolute inset-0 bg-slate-400/40 flex flex-col pointer-events-none"
      style={{
        width,
        height: props.selectedTrackHeight,
        top: props.selectedTrackTop,
      }}
    ></div>
  );

  // Timeline top left corner
  const TimelineTopLeftCorner = () => (
    <div
      className="sticky inset-0 -mb-20 z-[90] bg-gradient-to-r from-gray-800 to-gray-900"
      style={{ width: TRACK_WIDTH, height: HEADER_HEIGHT }}
    ></div>
  );

  // All the rendered backgrounds
  const TimelineElements = (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ height, width }}
    >
      <div className="relative w-full h-full">
        <TimelineTopLeftCorner />
        <TimelineTimeBackground />
        <SelectedTrackBackground />
        <TimelineCursor />
        <TimelineBackground />
      </div>
    </div>
  );

  if (!element) return null;
  return createPortal(TimelineElements, element);
}
