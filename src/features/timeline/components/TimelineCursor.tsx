import { HEADER_HEIGHT } from "appConstants";
import { DataGridHandle } from "react-data-grid";
import { createPortal } from "react-dom";
import { ConnectedProps, connect } from "react-redux";
import {
  selectCellWidth,
  selectRoot,
  selectTimelineTickOffset,
  selectTransport,
} from "redux/selectors";
import { RootState } from "redux/store";

const mapStateToProps = (state: RootState) => {
  const transport = selectTransport(state);
  const { selectedTrackId } = selectRoot(state);
  const cellWidth = selectCellWidth(state);
  const left = selectTimelineTickOffset(state, transport.tick);

  return {
    isStarted: transport.state === "started",
    recording: transport.recording,
    selectedTrackId,
    left,
    width: cellWidth - 4,
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
  if (!props.isStarted || props.recording) return null;

  const element = props.timeline.element;
  if (!element) return null;

  const Cursor = () => (
    <div
      className={`bg-emerald-600 absolute rounded-sm z-[90] transition-all duration-75`}
      style={{
        left: props.left,
        width: props.width,
        height: props.height,
      }}
    ></div>
  );

  return createPortal(<Cursor />, element);
}
