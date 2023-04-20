import { connect, ConnectedProps } from "react-redux";
import { TrackId } from "types/tracks";
import { AppDispatch, RootState } from "redux/store";
import { Timeline } from "./Timeline";
import "react-data-grid/lib/styles.css";
import { hideEditor, loadTimeline, unloadTimeline } from "redux/slices/root";
import * as Selectors from "redux/selectors";
import { createScaleTrack } from "redux/slices/tracks";

function mapStateToProps(state: RootState) {
  const scaleTrackIds = Selectors.selectScaleTrackIds(state);
  const trackMap = Selectors.selectTrackMap(state);
  const transport = Selectors.selectTransport(state);
  const { loadedTimeline } = Selectors.selectRoot(state);
  return {
    time: transport.time,
    scaleTrackIds,
    trackMap,
    state: transport.state,
    loadedTimeline,
    loadedTransport: transport.loaded,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    createScaleTrack: () => {
      dispatch(createScaleTrack());
    },
    hideEditor: () => {
      dispatch(hideEditor());
    },
    loadTimeline: () => {
      dispatch(loadTimeline());
    },
    unloadTimeline: () => {
      dispatch(unloadTimeline());
    },
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface TimelineProps extends Props {}

export interface Row {
  trackId?: TrackId;
  index: number;
  lastRow?: boolean;
}

export default connector(Timeline);
