import { Column, DataGridHandle } from "react-data-grid";
import * as Constants from "appConstants";
import { Row } from "..";
import { createPortal } from "react-dom";
import { Transition } from "@headlessui/react";
import { RootState } from "redux/store";
import { selectCellWidth, selectRoot } from "redux/selectors";
import { ConnectedProps, connect } from "react-redux";

interface BackgroundProps {
  rows: Row[];
  columns: Column<Row>[];
  timeline?: DataGridHandle;
}

const mapStateToProps = (state: RootState, ownProps: BackgroundProps) => {
  const cellWidth = selectCellWidth(state);
  const { showingTour, tourStep, selectedTransformIds } = selectRoot(state);
  return {
    ...ownProps,
    cellWidth,
    tourStep,
    showingTour,
    selectedTransformIds,
  };
};

const mapDispatchToProps = {};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(TimelineBackground);

// Timeline background so that the tracks can be scrolled
function TimelineBackground(props: Props) {
  const { rows, columns, timeline } = props;

  const trackRows = rows.filter((row) => !!row.trackId);
  const clearRows = rows.filter((row) => !row.trackId);

  const headerHeight = Constants.HEADER_HEIGHT;
  const trackRowHeight = Constants.CELL_HEIGHT * trackRows.length;
  const clearRowHeight = Constants.CELL_HEIGHT * clearRows.length;
  const backgroundHeight = headerHeight + trackRowHeight + clearRowHeight;
  const backgroundWidth = columns.length * props.cellWidth;

  const element = timeline?.element;
  if (!element) return null;

  const left =
    props.tourStep === 3 || props.tourStep === 4 || props.tourStep === 5
      ? Constants.TRACK_WIDTH
      : 0;

  return (
    <>
      {createPortal(
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ height: backgroundHeight, width: backgroundWidth }}
        >
          {/* Tour Background */}
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
            style={{ left }}
            className={`w-full h-full transition-all duration-75 absolute bg-slate-900/50 backdrop-blur z-[90] pointer-events-none`}
          />
          {/* Live Background */}
          <Transition
            show={props.selectedTransformIds.length > 0}
            appear
            enter="transition-opacity ease-in-out duration-150"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in-out duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
            as="div"
            style={{ left: Constants.TRACK_WIDTH }}
            className={`w-full h-full background-pulse absolute bg-gradient-to-r from-fuchsia-500/20 to-fuchsia-400/20 z-10 pointer-events-none`}
          />

          <div className="relative w-full h-full">
            {/* Time Background */}
            <div
              className="sticky bg-black inset-0 rdg-time pointer-events-none"
              style={{ height: headerHeight, width: backgroundWidth }}
            />
            <div
              className="-z-20 absolute inset-0 flex flex-col bg-gradient-to-t from-[#083a8a] via-[#2c5387] to-[#514f7e]"
              style={{ height: backgroundHeight, width: backgroundWidth }}
            >
              <div
                className="w-full bg-slate-500/90 shadow-xl"
                style={{ height: trackRowHeight, marginTop: headerHeight }}
              />
            </div>
          </div>
        </div>,
        element
      )}
      {createPortal(
        <div
          className={`-z-10 absolute bg-black inset-0 pointer-events-none`}
          style={{
            height: headerHeight,
            width: backgroundWidth,
            left: Constants.TRACK_WIDTH,
          }}
        ></div>,
        document.getElementById("timeline") as HTMLDivElement
      )}
    </>
  );
}
