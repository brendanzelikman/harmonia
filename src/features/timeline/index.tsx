import { connect, ConnectedProps } from "react-redux";
import { TrackId, TrackType } from "types/tracks";
import { AppDispatch, RootState } from "redux/store";
import { Timeline } from "./components/Timeline";
import "react-data-grid/lib/styles.css";
import { createScaleTrack } from "redux/thunks";
import {
  selectTrackDependencies,
  selectTransport,
  selectCell,
  selectTimeline,
  selectTrackMap,
} from "redux/selectors";
export interface Row {
  trackId?: TrackId;
  type: TrackType;
  depth: number;
  index: number;
  lastRow?: boolean;
  collapsed?: boolean;
}

function mapStateToProps(state: RootState) {
  const trackDependencies = selectTrackDependencies(state);
  const dependencyMap = JSON.stringify(trackDependencies);
  const transport = selectTransport(state);
  const cell = selectCell(state);
  const { subdivision } = selectTimeline(state);
  const trackMap = selectTrackMap(state);

  return {
    dependencyMap,
    state: transport.state,
    subdivision,
    cellWidth: cell.width,
    cellHeight: cell.height,
    trackMap,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    createScaleTrack: () => dispatch(createScaleTrack()),
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface TimelineProps extends Props {}

export default connector(Timeline);
