import { HEADER_HEIGHT } from "appConstants";
import { DataGridHandle } from "react-data-grid";
import { createPortal } from "react-dom";
import { ConnectedProps, connect } from "react-redux";
import {
  selectCellWidth,
  selectTimelineTickOffset,
  selectTransport,
} from "redux/selectors";
import { RootState } from "redux/store";
import { useMemo } from "react";

const mapStateToProps = (state: RootState) => {
  // Transport properties
  const transport = selectTransport(state);
  const isStarted = transport.state === "started";
  const recording = transport.recording;

  // Cursor properties
  const left = selectTimelineTickOffset(state, transport.tick);
  const width = selectCellWidth(state) - 4;
  const height = HEADER_HEIGHT;

  return {
    isStarted,
    recording,
    left,
    width,
    height,
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
  const element = props.timeline.element;
  if (!props.isStarted || props.recording || !element) return null;

  const Cursor = useMemo(() => {
    return () => (
      <div
        className={`bg-emerald-600 absolute pointer-events-none z-[70] rounded-sm transition-all duration-75`}
        style={{
          left: props.left,
          width: props.width,
          height: props.height,
        }}
      />
    );
  }, [props.left, props.width, props.height]);

  return createPortal(<Cursor />, element);
}
