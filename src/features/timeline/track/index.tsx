import { FormatterProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import {
  selectCell,
  selectRootTour,
  selectSelectedTrackId,
  selectTrackById,
  selectTrackIndexById,
} from "redux/selectors";
import * as Tracks from "redux/Track";
import { AppDispatch, RootState } from "redux/store";
import { Track, TrackId } from "types/Track";
import { Row } from "..";
import { TrackComponent } from "./Track";
import { setSelectedTrackId } from "redux/Timeline";

function mapStateToProps(state: RootState, ownProps: FormatterProps<Row>) {
  const { row } = ownProps;
  const selectedTrackId = selectSelectedTrackId(state);
  const track = selectTrackById(state, ownProps.row.trackId);
  const cell = selectCell(state);
  const { id: tourId } = selectRootTour(state);
  const index = track ? selectTrackIndexById(state, track.id) : -1;
  return {
    row,
    selectedTrackId,
    track,
    cell,
    index,
    tourId,
  };
}

function mapDispatchToProps(
  dispatch: AppDispatch,
  ownProps: FormatterProps<Row>
) {
  const trackId = ownProps.row.trackId;
  return {
    selectTrack: () => {
      dispatch(setSelectedTrackId(trackId));
    },
    clearTrack: () => {
      dispatch(Tracks.clearTrack(trackId));
    },
    deleteTrack: () => {
      dispatch(Tracks.deleteTrack(trackId));
    },
    duplicateTrack: () => {
      dispatch(Tracks.duplicateTrack(trackId));
    },
    collapseTrack: () => {
      dispatch(Tracks.collapseTrack(trackId));
    },
    expandTrack: () => {
      dispatch(Tracks.expandTrack(trackId));
    },
    collapseChildren: () => {
      dispatch(Tracks.collapseTrackChildren(trackId));
    },
    expandChildren: () => {
      dispatch(Tracks.expandTrackChildren(trackId));
    },
  };
}

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface TrackProps extends Props {}

export default connector(TrackComponent);

export interface DraggableTrackProps {
  track: Track;
  index: number;
  element?: any;
  moveTrack: (props: { dragId: TrackId; hoverId: TrackId }) => boolean;
}
