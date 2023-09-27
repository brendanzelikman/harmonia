import { connect, ConnectedProps } from "react-redux";
import { PatternTrack, Track, TrackId, TrackType } from "types/tracks";
import { AppDispatch, RootState } from "redux/store";
import { Timeline } from "./components/Timeline";
import "react-data-grid/lib/styles.css";
import { setSelectedTrack } from "redux/slices/root";
import * as Selectors from "redux/selectors";
import { createScaleTrack } from "redux/thunks/tracks";
import {
  pasteSelectedClipsAndTranspositions,
  toggleTrackMute,
  toggleTrackSolo,
} from "redux/thunks";
import {
  offsetSelectedTranspositions,
  updateSelectedTranspositions,
} from "redux/thunks/transpositions";
import { hideEditor } from "redux/slices/editor";
import { TranspositionOffsetRecord } from "types/transposition";

function mapStateToProps(state: RootState) {
  const editor = Selectors.selectEditor(state);
  const dependencyMap = JSON.stringify(
    Selectors.selectTrackDependencies(state)
  );
  const transport = Selectors.selectTransport(state);
  const cellWidth = Selectors.selectCellWidth(state);
  const { subdivision } = Selectors.selectTimeline(state);
  const { selectedTrackId } = Selectors.selectRoot(state);
  const scaleTracks = Selectors.selectTrackParents(state, selectedTrackId);
  return {
    dependencyMap,
    state: transport.state,
    subdivision,
    selectedTrackId,
    cellWidth,
    showingEditor: editor.show,
    scaleTracks,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    createScaleTrack: () => {
      return dispatch(createScaleTrack());
    },
    setSelectedTrack: (trackId: TrackId) => {
      dispatch(setSelectedTrack(trackId));
    },
    hideEditor: () => {
      dispatch(hideEditor());
    },
    pasteClipsAndTranspositions: (rows: Row[]) => {
      dispatch(pasteSelectedClipsAndTranspositions(rows));
    },
    offsetSelectedTranspositions: (offset: TranspositionOffsetRecord) => {
      dispatch(offsetSelectedTranspositions(offset));
    },
    updateSelectedTranspositions: (update: TranspositionOffsetRecord) => {
      dispatch(updateSelectedTranspositions(update));
    },
    toggleTrackMute: (trackId?: TrackId) => {
      if (!trackId) return;
      dispatch(toggleTrackMute(trackId));
    },
    toggleTrackSolo: (trackId?: TrackId) => {
      if (!trackId) return;
      dispatch(toggleTrackSolo(trackId));
    },
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface TimelineProps extends Props {}

export interface Row {
  trackId?: TrackId;
  type: TrackType;
  depth: number;
  index: number;
  lastRow?: boolean;
}

export default connector(Timeline);
