import { Column, DataGridHandle } from "react-data-grid";
import { Row } from "..";
import { createPortal } from "react-dom";
import { Transition } from "@headlessui/react";
import { RootState } from "redux/store";
import { selectCellHeight, selectCellWidth, selectRoot } from "redux/selectors";
import { ConnectedProps, connect } from "react-redux";
import { useMemo } from "react";
import { HEADER_HEIGHT, TRACK_WIDTH } from "appConstants";

interface BackgroundProps {
  rows: Row[];
  columns: Column<Row>[];
  timeline?: DataGridHandle;
}

const mapStateToProps = (state: RootState, ownProps: BackgroundProps) => {
  const { rows, columns } = ownProps;
  const { showingTour, tourStep } = selectRoot(state);
  // General dimensions
  const cellWidth = selectCellWidth(state);
  const cellHeight = selectCellHeight(state);
  const headerHeight = HEADER_HEIGHT;
  const tourLeft =
    tourStep === 3 || tourStep === 4 || tourStep === 5 ? TRACK_WIDTH : 0;

  // Track background height
  const trackRows = rows.filter((row) => !!row.trackId);
  const trackHeight = cellHeight * trackRows.length;

  // Background dimensions
  const width = columns.length * cellWidth;
  const height = headerHeight + cellHeight * rows.length;

  return {
    ...ownProps,
    tourLeft,
    tourStep,
    showingTour,
    width,
    height,
    cellWidth,
    headerHeight,
    trackHeight,
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
        className={`w-full h-full transition-all duration-75 absolute bg-slate-900/50 backdrop-blur z-[90] pointer-events-none`}
      />
    );
  }, [props.showingTour, props.tourLeft]);

  // Time background (currently rendered)
  const TimeBackground = useMemo(() => {
    return () => (
      <div
        className="sticky bg-black inset-0 rdg-time pointer-events-none"
        style={{ width, height: props.headerHeight }}
      />
    );
  }, [width, props.headerHeight]);

  // Time background (prerendered)
  const PrerenderedTimeBackground = useMemo(() => {
    return () => (
      <div
        className={`-z-10 absolute bg-black inset-0 pointer-events-none`}
        style={{
          height: props.headerHeight,
          width,
          left: TRACK_WIDTH,
        }}
      />
    );
  }, [width, props.headerHeight]);

  // Frozen track background
  const FrozenTrackBackground = useMemo(() => {
    return () => (
      <div
        className="-z-[10] sticky inset-0 h-screen flex flex-col bg-gradient-to-r from-sky-900 to-indigo-900/90 backdrop-blur"
        style={{ width: TRACK_WIDTH }}
      ></div>
    );
  }, []);

  // Track background
  const TrackBackground = useMemo(() => {
    return () => (
      <div
        className="-z-20 absolute inset-0 flex flex-col"
        style={{ width, height }}
      >
        <div
          className="w-full bg-slate-500/90 shadow-xl"
          style={{
            height: props.trackHeight,
            marginTop: props.headerHeight,
          }}
        />
      </div>
    );
  }, [props.trackHeight, props.headerHeight, width, height]);

  // Rendered backgrounds handled by the grid
  const RenderedBackgrounds = useMemo(() => {
    return () => (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ height, width }}
      >
        {TourBackground()}
        <div className="relative w-full h-full">
          {TimeBackground()}
          {FrozenTrackBackground()}
          {TrackBackground()}
        </div>
      </div>
    );
  }, [TourBackground, TimeBackground, TrackBackground]);

  return createPortal(
    <>
      {RenderedBackgrounds()}
      <PrerenderedTimeBackground />
    </>,
    element
  );
}
