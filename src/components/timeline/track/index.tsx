import { FormatterProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import * as Selectors from "redux/selectors";
import { selectTrackTransforms } from "redux/selectors";
import { setMixerMute, setMixerPan, setMixerSolo } from "redux/thunks/mixers";
import { hideEditor, showEditor } from "redux/slices/root";
import {
  clearTrack,
  deleteTrack,
  duplicateTrack,
  muteTracks,
  unmuteTracks,
  soloTracks,
  unsoloTracks,
  updateTrack,
} from "redux/thunks/tracks";
import { AppDispatch, RootState } from "redux/store";
import { isPatternTrack, PatternTrack, Track, TrackId } from "types/tracks";
import { lastTransformAtTime } from "types/transform";
import { Row } from "..";
import { TrackComponent } from "./Track";

function mapStateToProps(state: RootState, ownProps: FormatterProps<Row>) {
  const transport = Selectors.selectTransport(state);
  const { selectedTrackId } = Selectors.selectRoot(state);
  const track = ownProps.row.trackId
    ? Selectors.selectTrack(state, ownProps.row.trackId)
    : undefined;
  const isTrackSelected = selectedTrackId === track?.id;
  const trackMap = Selectors.selectTrackMap(state);
  const index = track
    ? isPatternTrack(track)
      ? trackMap.byId[
          (track as PatternTrack).scaleTrackId
        ].patternTrackIds.indexOf(track.id)
      : trackMap.allIds.indexOf(track.id)
    : -1;
  const trackTransforms = track ? selectTrackTransforms(state, track.id) : [];
  const currentTransform = lastTransformAtTime(
    trackTransforms,
    transport.time - 1
  );
  return {
    track,
    selectedTrackId,
    isTrackSelected,
    index,
    chromaticTranspose: currentTransform?.chromaticTranspose ?? 0,
    scalarTranspose: currentTransform?.scalarTranspose ?? 0,
    chordalTranspose: currentTransform?.chordalTranspose ?? 0,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    updateTrack: (track: Partial<Track>) => {
      dispatch(updateTrack(track));
    },
    clearTrack: (trackId: TrackId) => {
      dispatch(clearTrack(trackId));
    },
    deleteTrack: (trackId: TrackId) => {
      dispatch(deleteTrack(trackId));
    },
    duplicateTrack: (trackId: TrackId) => {
      dispatch(duplicateTrack(trackId));
    },
    showEditor: (trackId: TrackId, id: string) => {
      dispatch(showEditor({ id, trackId }));
    },
    setTrackMute: (trackId: TrackId, mute: boolean) => {
      dispatch(setMixerMute(trackId, mute));
    },
    setTrackSolo: (trackId: TrackId, solo: boolean) => {
      dispatch(setMixerSolo(trackId, solo));
    },
    setTrackPan: (trackId: TrackId, pan: number) => {
      dispatch(setMixerPan(trackId, pan));
    },
    muteTracks: () => {
      dispatch(muteTracks());
    },
    unmuteTracks: () => {
      dispatch(unmuteTracks());
    },
    soloTracks: () => {
      dispatch(soloTracks());
    },
    unsoloTracks: () => {
      dispatch(unsoloTracks());
    },
    hideEditor: () => {
      dispatch(hideEditor());
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
  moveTrack: (props: {
    dragId: TrackId;
    hoverId: TrackId;
    hoverIndex: number;
  }) => boolean;
}
