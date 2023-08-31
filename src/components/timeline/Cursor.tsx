import { HEADER_HEIGHT, TRACK_WIDTH } from "appConstants";
import { ticksToColumns } from "appUtil";
import { DataGridHandle } from "react-data-grid";
import { createPortal } from "react-dom";
import { ConnectedProps, connect } from "react-redux";
import { selectCellWidth, selectRoot, selectTransport } from "redux/selectors";
import { RootState } from "redux/store";

const mapStateToProps = (state: RootState) => {
  const transport = selectTransport(state);
  const { selectedTrackId } = selectRoot(state);
  const cellWidth = selectCellWidth(state);

  const left =
    TRACK_WIDTH +
    cellWidth * ticksToColumns(transport.tick, transport.subdivision);

  return {
    isStarted: transport.state === "started",
    selectedTrackId,
    left,
    width: cellWidth,
    height: HEADER_HEIGHT,
  };
};

const mapDispatchToProps = () => {
  return {};
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

interface CursorProps extends Props {
  timeline: DataGridHandle;
}

export default connector(TimelineCursor);

function TimelineCursor(props: CursorProps) {
  if (!props.isStarted) return null;

  const element = props.timeline.element;
  if (!element) return null;

  const Cursor = () => (
    <div
      className={`bg-emerald-600 absolute rounded-sm z-[80]`}
      style={{
        left: props.left,
        width: props.width,
        height: props.height,
      }}
    ></div>
  );

  return createPortal(<Cursor />, element);
}
