import { connect, ConnectedProps } from "react-redux";
import { TrackId, TrackType } from "types/Track";
import { AppDispatch, RootState } from "redux/store";
import { TimelineComponent } from "./components/Timeline";
import "react-data-grid/lib/styles.css";
import { createScaleTrack } from "redux/thunks";
import {
  selectTrackInfoRecord,
  selectTransport,
  selectCell,
  selectTimeline,
  selectTrackMap,
} from "redux/selectors";
import { DataGridHandle } from "react-data-grid";

export interface Row {
  trackId?: TrackId;
  type: TrackType;
  depth: number;
  index: number;
  lastRow?: boolean;
  collapsed?: boolean;
}

export interface TimelinePortalElement {
  timeline: DataGridHandle;
}

function mapStateToProps(state: RootState) {
  const transport = selectTransport(state);
  const cell = selectCell(state);
  const { subdivision } = selectTimeline(state);
  const trackMap = selectTrackMap(state);
  return {
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

export default connector(TimelineComponent);
