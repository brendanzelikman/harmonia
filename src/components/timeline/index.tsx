import { connect, ConnectedProps } from "react-redux";
import { TrackId, TrackType } from "types/tracks";
import { AppDispatch, RootState } from "redux/store";
import { Timeline } from "./Timeline";
import "react-data-grid/lib/styles.css";
import {
  hideEditor,
  loadTimeline,
  selectClips,
  selectTransforms,
  setSelectedTrack,
  unloadTimeline,
} from "redux/slices/root";
import * as Selectors from "redux/selectors";
import { createScaleTrack } from "redux/thunks/tracks";
import { createClipsAndTransforms } from "redux/slices/clips";
import { Clip } from "types/clips";
import { Transform } from "types/transform";

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
    createScaleTrack: () => {
      dispatch(createScaleTrack());
    },
    createClipsAndTransforms: async (
      clips: Clip[],
      transforms: Transform[]
    ) => {
      const { clipIds, transformIds } = await dispatch(
        createClipsAndTransforms(clips, transforms)
      );
      dispatch(selectClips(clipIds));
      dispatch(selectTransforms(transformIds));
    },
    setSelectedTrack: (trackId: TrackId) => {
      dispatch(setSelectedTrack(trackId));
    },
    hideEditor: () => dispatch(hideEditor()),
    loadTimeline: () => dispatch(loadTimeline()),
    unloadTimeline: () => dispatch(unloadTimeline()),
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
