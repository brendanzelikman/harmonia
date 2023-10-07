import { Column, DataGridHandle } from "react-data-grid";
import { Row } from "..";
import { createPortal } from "react-dom";
import { Transition } from "@headlessui/react";
import { RootState } from "redux/store";
import {
  selectCellHeight,
  selectCellWidth,
  selectRoot,
  selectSelectedTrack,
  selectTimelineTickLeft,
  selectTimelineObjectTop,
  selectTransport,
  selectOrderedTrackIds,
  selectTrackById,
} from "redux/selectors";
import { ConnectedProps, connect } from "react-redux";
import { useMemo } from "react";
import {
  COLLAPSED_TRACK_HEIGHT,
  HEADER_HEIGHT,
  TRACK_WIDTH,
} from "appConstants";

interface BackgroundProps {
  rows: Row[];
  columns: Column<Row>[];
  timeline?: DataGridHandle;
}

const mapStateToProps = (state: RootState, ownProps: BackgroundProps) => {
  const { rows, columns } = ownProps;
  const { showingTour, tourStep } = selectRoot(state);
  const transport = selectTransport(state);

  // General dimensions
  const cellWidth = selectCellWidth(state);
  const cellHeight = selectCellHeight(state);
  const tourLeft =
    tourStep === 3 || tourStep === 4 || tourStep === 5 ? TRACK_WIDTH : 0;

  // Track background height
  const lastTrackId = selectOrderedTrackIds(state).at(-1);
  const lastTrack = lastTrackId
    ? selectTrackById(state, lastTrackId)
    : undefined;
  const tracksHeight = lastTrack
    ? selectTimelineObjectTop(state, lastTrack)
    : 0;
  const lastTrackHeight = lastTrack
    ? !!lastTrack.collapsed
      ? COLLAPSED_TRACK_HEIGHT
      : cellHeight
    : 0;

  // Selected track background
  const selectedTrack = selectSelectedTrack(state);
  const selectedTrackTop = selectedTrack
    ? selectTimelineObjectTop(state, selectedTrack)
    : 0;
  const selectedTrackHeight = selectedTrack
    ? !!selectedTrack.collapsed
      ? COLLAPSED_TRACK_HEIGHT
      : cellHeight
    : 0;

  // Cursor properties
  const cursorLeft = selectTimelineTickLeft(state, transport.tick);
  const cursorWidth = cellWidth - 4;
  const cursorHeight = cellHeight;
  const showCursor = transport.state === "started" && !transport.recording;

  // Background dimensions
  const width = columns.length * cellWidth;
  const height = HEADER_HEIGHT + cellHeight * rows.length;

  return {
    ...ownProps,
    tourLeft,
    tourStep,
    showingTour,
    cursorLeft,
    cursorWidth,
    cursorHeight,
    showCursor,
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

export default connector(TimelineBackground);

// Timeline background so that the tracks can be scrolled
function TimelineBackground(props: Props) {
  const { timeline, width, height } = props;
  const element = timeline?.element;
  if (!element) return null;

  // Onboarding tour background
  const TourBackground = useMemo(() => {
    return () => (
      <Transition
        show={props.showingTour}
        appear
        enter="transition-opacity ease-in-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity ease-in-out duration-300"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
        as="div"
        style={{ left: props.tourLeft }}
        className={`w-full h-screen transition-all duration-75 absolute bg-slate-900/50 backdrop-blur z-[90] pointer-events-none`}
      />
    );
  }, [props.showingTour, props.tourLeft]);

  // Timeline time cursor
  const TimelineCursor = useMemo(() => {
    if (!props.showCursor) return () => null;
    return () => (
      <div
        className="sticky inset-0 z-50 pointer-events-none"
        style={{ width, height: HEADER_HEIGHT }}
      >
        <div
          className="relative bg-green-500"
          style={{
            height: HEADER_HEIGHT,
            marginTop: -HEADER_HEIGHT,
            width: props.cursorWidth,
            left: props.cursorLeft,
          }}
        />
      </div>
    );
  }, [props.showCursor, props.cursorWidth, props.cursorLeft, width]);

  // Timeline time background
  const TimelineTimeBackground = useMemo(() => {
    return () => (
      <div
        className="sticky inset-0 z-20 bg-black pointer-events-none"
        style={{ width, height: HEADER_HEIGHT }}
      ></div>
    );
  }, [width, props.cursorWidth]);

  // Timeline track background
  const TimelineTrackBackground = useMemo(() => {
    return () => (
      <div
        className="z-[10] sticky inset-0 h-screen flex flex-col bg-gradient-to-r from-sky-900 to-indigo-900/90 backdrop-blur"
        style={{ width: TRACK_WIDTH }}
      ></div>
    );
  }, []);

  // Timeline background
  const TimelineBackground = useMemo(() => {
    return () => (
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
  }, [props.tracksHeight, props.lastTrackHeight, width, height]);

  // Timeline background
  const SelectedTrackBackground = useMemo(() => {
    return () => (
      <div
        className="-z-10 absolute inset-0 bg-slate-400/40 flex flex-col pointer-events-none"
        style={{
          width,
          height: props.selectedTrackHeight,
          top: props.selectedTrackTop,
        }}
      ></div>
    );
  }, [
    props.cellHeight,
    width,
    height,
    props.selectedTrack,
    props.selectedTrackTop,
    props.selectedTrackHeight,
  ]);

  // Timeline top left corner
  const TimelineTopLeftCorner = useMemo(() => {
    return () => (
      <div
        className="sticky inset-0 -mb-20 z-[90] bg-gradient-to-r from-gray-800 to-gray-900"
        style={{ width: TRACK_WIDTH, height: HEADER_HEIGHT }}
      ></div>
    );
  }, []);

  // Rendered backgrounds handled by the grid
  const RenderedBackgrounds = useMemo(() => {
    return () => (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ height, width }}
      >
        {TourBackground()}
        <div className="relative w-full h-full">
          <TimelineTopLeftCorner />
          <TimelineTimeBackground />
          <SelectedTrackBackground />
          <TimelineCursor />
          <TimelineBackground />
        </div>
      </div>
    );
  }, [
    TourBackground,
    TimelineTimeBackground,
    TimelineCursor,
    TimelineTrackBackground,
    TimelineBackground,
    SelectedTrackBackground,
  ]);

  return createPortal(<>{RenderedBackgrounds()}</>, element);
}
