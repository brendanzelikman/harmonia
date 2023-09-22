import { inRange } from "lodash";
import { HeaderRendererProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import {
  selectBarsBeatsSixteenths,
  selectTimeline,
  selectTimelineTick,
  selectTransport,
} from "redux/selectors";
import {
  seekTransport,
  setTransportLoopEnd,
  setTransportLoopStart,
} from "redux/thunks/transport";
import { AppDispatch, RootState } from "redux/store";
import { Subdivision, Tick } from "types/units";
import { Row } from "..";
import { TimeFormatter } from "./Time";
import { subdivisionToTicks } from "utils";

function mapStateToProps(state: RootState, ownProps: HeaderRendererProps<Row>) {
  // Timeline properties
  const { subdivision } = selectTimeline(state);
  const tickLength = subdivisionToTicks(subdivision);

  // Tick properties
  const columnIndex = Number(ownProps.column.key);
  const tick = selectTimelineTick(state, columnIndex - 1);
  const { bars, beats, sixteenths } = selectBarsBeatsSixteenths(state, tick);
  const isMeasure = beats === 0 && sixteenths === 0;

  // Loop properties
  const { loop, loopStart, loopEnd } = selectTransport(state);
  const inLoopRange = inRange(tick, loopStart, loopEnd);
  const onLoopStart = loopStart === tick;
  const onLoopEnd = loopEnd === tick + (tickLength - 1);

  // Class properties
  const className = `relative w-full h-full text-white hover:border hover:border-slate-200/80 cursor-pointer ${
    loop && inLoopRange
      ? "bg-black hover:bg-slate-800 border-b-8 border-b-indigo-700"
      : `bg-black hover:bg-slate-800 border-slate-50/20`
  }`;

  return {
    ...ownProps,
    tick,
    columnIndex,
    bars,
    subdivision,
    isMeasure,
    className,
    loop,
    loopStart,
    onLoopStart,
    loopEnd,
    onLoopEnd,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    onClick: (tick: Tick) => {
      dispatch(seekTransport(tick));
    },
    setLoopStart: (column: number, subdivision: Subdivision) => {
      const ticks = subdivisionToTicks(subdivision) * column;
      dispatch(setTransportLoopStart(ticks));
    },
    setLoopEnd: (column: number, subdivision: Subdivision) => {
      const ticks = subdivisionToTicks(subdivision) * (column + 1);
      dispatch(setTransportLoopEnd(ticks - 1));
    },
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export interface TimeProps extends Props {}

export default connector(TimeFormatter);
