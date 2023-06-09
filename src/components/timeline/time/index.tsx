import { TIMELINE_SUBDIVISION } from "appConstants";
import { inRange } from "lodash";
import { HeaderRendererProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import { selectTransport } from "redux/selectors";
import {
  seekTransport,
  setTransportLoopEnd,
  setTransportLoopStart,
} from "redux/slices/transport";
import { AppDispatch, RootState } from "redux/store";
import { Time } from "types/units";
import { Row } from "..";
import { TimeFormatter } from "./Time";

function mapStateToProps(state: RootState, ownProps: HeaderRendererProps<Row>) {
  const transport = selectTransport(state);
  const columnIndex = Number(ownProps.column.key);

  const onTime = transport.time === columnIndex && transport.time !== 0;
  const measure = Math.floor(columnIndex / TIMELINE_SUBDIVISION);
  const beat = columnIndex % TIMELINE_SUBDIVISION;
  const isMeasure = beat === 1;

  const looping = transport.loop;
  const loopStart = transport.loopStart + 1;
  const loopEnd = transport.loopEnd + 1;

  const inLoopRange = inRange(columnIndex, loopStart, loopEnd + 1);
  const onLoopStart = loopStart === columnIndex;
  const onLoopEnd = loopEnd === columnIndex;

  const className = `relative w-full h-full text-white hover:border hover:border-slate-200/80 cursor-pointer ${
    onTime
      ? "bg-gradient-to-b from-emerald-600 to-emerald-700 hover:bg-slate-800"
      : looping && inLoopRange
      ? "bg-black hover:bg-slate-800 border-b-8 border-b-indigo-700"
      : `bg-black hover:bg-slate-800 border-slate-50/20`
  }`;

  return {
    ...ownProps,
    columnIndex,
    measure,
    isMeasure,
    className,
    looping,
    loopStart,
    onLoopStart,
    loopEnd,
    onLoopEnd,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    onClick: (time: Time) => {
      dispatch(seekTransport(time));
    },
    setLoopStart: (time: Time) => {
      dispatch(setTransportLoopStart(time));
    },
    setLoopEnd: (time: Time) => {
      dispatch(setTransportLoopEnd(time));
    },
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export interface TimeProps extends Props {}

export default connector(TimeFormatter);
