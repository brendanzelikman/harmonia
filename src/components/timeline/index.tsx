import { connect, ConnectedProps } from "react-redux";
import { TrackId, TrackType } from "types/tracks";
import { AppDispatch, RootState } from "redux/store";
import { Timeline } from "./Timeline";
import "react-data-grid/lib/styles.css";
import { setSelectedTrack } from "redux/slices/root";
import * as Selectors from "redux/selectors";
import { createScaleTrack } from "redux/thunks/tracks";
import { pasteSelectedClipsAndTransforms } from "redux/thunks";
import {
  offsetSelectedTransforms,
  updateSelectedTransforms,
} from "redux/thunks/transforms";
import { TransformCoordinate } from "types/transform";
import { hideEditor } from "redux/slices/editor";

function mapStateToProps(state: RootState) {
  const editor = Selectors.selectEditor(state);
  const trackMap = Selectors.selectTrackMap(state);
  const transport = Selectors.selectTransport(state);
  const cellWidth = Selectors.selectCellWidth(state);
  const { selectedTrackId } = Selectors.selectRoot(state);
  const { clipboard, subdivision } = Selectors.selectTimeline(state);
  return {
    tick: transport.tick,
    clipboard,
    trackMap,
    state: transport.state,
    subdivision,
    selectedTrackId,
    cellWidth,
    showingEditor: editor.show,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    createScaleTrack: () => dispatch(createScaleTrack()),
    setSelectedTrack: (trackId: TrackId) => dispatch(setSelectedTrack(trackId)),
    hideEditor: () => dispatch(hideEditor()),
    pasteClipsAndTransforms: (rows: Row[]) =>
      dispatch(pasteSelectedClipsAndTransforms(rows)),
    offsetSelectedTransforms: (offset: TransformCoordinate) => {
      dispatch(offsetSelectedTransforms(offset));
    },
    updateSelectedTransforms: (update: Partial<TransformCoordinate>) =>
      dispatch(updateSelectedTransforms(update)),
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
