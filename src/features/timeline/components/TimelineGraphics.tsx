import { DataGridHandle } from "react-data-grid";
import { createPortal } from "react-dom";
import { Transition } from "@headlessui/react";
import { RootState } from "redux/store";
import {
  selectCellHeight,
  selectCellWidth,
  selectRoot,
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
} from "appConstants";
import TimelineCursor from "./TimelineCursor";

interface BackgroundProps {
  timeline?: DataGridHandle;
}

const mapStateToProps = (state: RootState, ownProps: BackgroundProps) => {
  const { showingTour, tourStep } = selectRoot(state);
  const columns = selectTimelineColumnCount(state);

  // General dimensions
  const cellWidth = selectCellWidth(state);
  const cellHeight = selectCellHeight(state);
  const tourLeft =
    tourStep === 3 || tourStep === 4 || tourStep === 5 ? TRACK_WIDTH : 0;

  // Track background height
  const lastTrackId = selectOrderedTrackIds(state).at(-1);
  const lastTrack = selectTrackById(state, lastTrackId);
  const tracksHeight = selectTimelineObjectTop(state, lastTrack);
  const lastTrackHeight = lastTrack
    ? !!lastTrack.collapsed
      ? COLLAPSED_TRACK_HEIGHT
      : cellHeight
    : 0;

  // Selected track background
  const selectedTrack = selectSelectedTrack(state);
  const selectedTrackTop = selectTimelineObjectTop(state, selectedTrack);

  const selectedTrackHeight = selectedTrack
    ? !!selectedTrack.collapsed
      ? COLLAPSED_TRACK_HEIGHT
      : cellHeight
    : 0;

  // Cursor properties
  const cursorHeight = cellHeight;

  // Background dimensions
  const width = columns * cellWidth;
  const rowCount = selectOrderedTrackIds(state).length;
  const height = HEADER_HEIGHT + cellHeight * rowCount;

  return {
    ...ownProps,
    tourLeft,
    tourStep,
    showingTour,
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

  // Onboarding tour background
  const TourBackground = () => (
    <Transition
      show={props.showingTour}
      appear
      enter="transition-opacity ease-in-out duration-150"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity ease-in-out duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      as="div"
      style={{ left: props.tourLeft }}
      className={`w-full h-screen transition-all duration-300 absolute bg-slate-900/50 backdrop-blur z-[90] pointer-events-none`}
    />
  );

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

  const TimelineElements = () => (
    <div className="relative w-full h-full">
      <TimelineTopLeftCorner />
      <TimelineTimeBackground />
      <SelectedTrackBackground />
      <TimelineCursor />
      <TimelineBackground />
    </div>
  );

  // Rendered backgrounds handled by the grid
  const RenderedBackgrounds = (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ height, width }}
    >
      {TourBackground()}
      <TimelineElements />
    </div>
  );

  if (!element) return null;
  return createPortal(RenderedBackgrounds, element);
}
