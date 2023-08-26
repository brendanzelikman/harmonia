import { connect, ConnectedProps } from "react-redux";
import { TrackId, TrackType } from "types/tracks";
import { AppDispatch, RootState } from "redux/store";
import { Timeline } from "./Timeline";
import "react-data-grid/lib/styles.css";
import {
  hideEditor,
  loadTimeline,
  setSelectedTrack,
  unloadTimeline,
} from "redux/slices/root";
import * as Selectors from "redux/selectors";
import { createScaleTrack } from "redux/thunks/tracks";
import { pasteSelectedClipsAndTransforms } from "redux/thunks";

function mapStateToProps(state: RootState) {
  const trackMap = Selectors.selectTrackMap(state);
  const transport = Selectors.selectTransport(state);
  const cellWidth = Selectors.selectCellWidth(state);
  const { loadedTimeline, clipboard, selectedTrackId } =
    Selectors.selectRoot(state);
  return {
    time: transport.time,
    clipboard,
    trackMap,
    state: transport.state,
    selectedTrackId,
    cellWidth,
    loadedTimeline,
    loadedTransport: transport.loaded,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    createScaleTrack: () => dispatch(createScaleTrack()),
    setSelectedTrack: (trackId: TrackId) => dispatch(setSelectedTrack(trackId)),
    hideEditor: () => dispatch(hideEditor()),
    loadTimeline: () => dispatch(loadTimeline()),
    unloadTimeline: () => dispatch(unloadTimeline()),
    pasteClipsAndTransforms: (rows: Row[]) =>
      dispatch(pasteSelectedClipsAndTransforms(rows)),
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface TimelineProps extends Props {}

export interface Row {
  trackId?: TrackId;
  type: TrackType;
  index: number;
  lastRow?: boolean;
}

export default connector(Timeline);
