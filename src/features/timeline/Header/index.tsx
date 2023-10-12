import { inRange } from "lodash";
import { HeaderRendererProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import {
  selectTimeline,
  selectTickFromColumn,
  selectTransport,
} from "redux/selectors";
import {
  seekTransport,
  setTransportLoopEnd,
  setTransportLoopStart,
} from "redux/Transport";
import { AppDispatch, RootState } from "redux/store";
import { Subdivision, Tick } from "types/units";
import { Row } from "..";
import { HeaderFormatter } from "./Header";
import { subdivisionToTicks } from "utils";
import { convertTicksToBarsBeatsSixteenths } from "types/Transport";

function mapStateToProps(state: RootState, ownProps: HeaderRendererProps<Row>) {
  const transport = selectTransport(state);
  const { loop, loopStart, loopEnd } = transport;

  // Timeline properties
  const { subdivision } = selectTimeline(state);
  const tickLength = subdivisionToTicks(subdivision);

  // Tick properties
  const columnIndex = Number(ownProps.column.key);
  const tick = selectTickFromColumn(state, columnIndex - 1);
  const { bars, beats, sixteenths } = convertTicksToBarsBeatsSixteenths(
    transport,
    tick
  );
  const isMeasure = beats === 0 && sixteenths === 0;

  // Loop properties
  const inLoopRange = inRange(tick, loopStart, loopEnd);
  const onLoopStart = loopStart === tick;
  const onLoopEnd = loopEnd === tick + (tickLength - 1);

  // Measure properties
  const measurePadding = loop
    ? onLoopStart
      ? "pl-3"
      : onLoopEnd
      ? "pr-3"
      : "pl-1"
    : "pl-1";

  const measureClass = `${measurePadding} ${
    bars > 99 ? "text-[9px]" : ""
  } select-none`;

  // Class properties
  const border = `hover:border hover:border-slate-200/80 ${
    loop && inLoopRange
      ? "border-b-8 border-b-indigo-700"
      : `border-slate-50/20`
  }`;
  const className = `relative w-full h-full text-white hover:bg-slate-800 cursor-pointer ${border}`;

  return {
    ...ownProps,
    tick,
    columnIndex,
    bars,
    subdivision,
    isMeasure,
    measureClass,
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
      const ticks = subdivisionToTicks(subdivision) * (column - 1);
      dispatch(setTransportLoopStart(ticks));
    },
    setLoopEnd: (column: number, subdivision: Subdivision) => {
      const ticks = subdivisionToTicks(subdivision) * column;
      dispatch(setTransportLoopEnd(ticks - 1));
    },
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export interface TimeProps extends Props {}

export default connector(HeaderFormatter);
