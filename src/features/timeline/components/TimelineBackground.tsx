import { Column, DataGridHandle } from "react-data-grid";
import { Row } from "..";
import { createPortal } from "react-dom";
import { Transition } from "@headlessui/react";
import { RootState } from "redux/store";
import { selectCellWidth, selectRoot } from "redux/selectors";
import { ConnectedProps, connect } from "react-redux";
import { useMemo } from "react";
import { HEADER_HEIGHT, CELL_HEIGHT, TRACK_WIDTH } from "appConstants";

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
  const headerHeight = HEADER_HEIGHT;
  const tourLeft =
    tourStep === 3 || tourStep === 4 || tourStep === 5 ? TRACK_WIDTH : 0;

  // Track background height
  const trackRows = rows.filter((row) => !!row.trackId);
  const trackHeight = CELL_HEIGHT * trackRows.length;

  // Background dimensions
  const width = columns.length * cellWidth;
  const height = headerHeight + CELL_HEIGHT * rows.length;

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

  // Live transposition background (potentially expensive)
  // const LiveBackground = useCallback(() => {
  //   return (
  //     <Transition
  //       show={props.live}
  //       appear
  //       enter="transition-opacity ease-in-out duration-150"
  //       enterFrom="opacity-0"
  //       enterTo="opacity-100"
  //       leave="transition-opacity ease-in-out duration-150"
  //       leaveFrom="opacity-100"
  //       leaveTo="opacity-0"
  //       as="div"
  //       style={{ left: TRACK_WIDTH }}
  //       className={`w-full h-full background-pulse absolute bg-gradient-to-r from-fuchsia-500/20 to-fuchsia-400/20 z-10 pointer-events-none`}
  //     />
  //   );
  // }, [props.live]);

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

  // Track background
  const TrackBackground = useMemo(() => {
    return () => (
      <div
        className="-z-20 absolute inset-0 flex flex-col bg-gradient-to-t from-[#083a8a] via-[#2c5387] to-[#514f7e]"
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
        {/* {LiveBackground()} */}
        <div className="relative w-full h-full">
          {TimeBackground()}
          {TrackBackground()}
        </div>
      </div>
    );
  }, [TourBackground, TimeBackground, TrackBackground]);

  return createPortal(
    <>
      <RenderedBackgrounds />
      <PrerenderedTimeBackground />
    </>,
    element
  );
}
