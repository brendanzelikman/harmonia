import { FormatterProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import * as Selectors from "redux/selectors";
import { selectTrackTransforms } from "redux/selectors";
import { setMixerMute, setMixerPan, setMixerSolo } from "redux/slices/mixers";
import { hideEditor, viewEditor } from "redux/slices/root";
import {
  clearTrack,
  deleteTrack,
  duplicateTrack,
  updateTrack,
} from "redux/slices/tracks";
import { AppDispatch, RootState } from "redux/store";
import { PatternId } from "types/patterns";
import { Track, TrackId } from "types/tracks";
import { lastTransformAtTime } from "types/transform";
import { Row } from "..";
import { TrackComponent } from "./Track";

function mapStateToProps(state: RootState, ownProps: FormatterProps<Row>) {
  const transport = Selectors.selectTransport(state);
  const track = ownProps.row.trackId
    ? Selectors.selectTrack(state, ownProps.row.trackId)
    : undefined;
  const trackTransforms = track ? selectTrackTransforms(state, track.id) : [];
  const currentTransform = lastTransformAtTime(
    trackTransforms,
    transport.time - 1
  );
  return {
    track,
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
    viewEditor: (trackId: TrackId, id: string) => {
      dispatch(viewEditor({ id, trackId }));
    },
    setTrackMute: (patternId: PatternId, mute: boolean) => {
      dispatch(setMixerMute(patternId, mute));
    },
    setTrackSolo: (patternId: PatternId, solo: boolean) => {
      dispatch(setMixerSolo(patternId, solo));
    },
    setTrackPan: (patternId: PatternId, pan: number) => {
      dispatch(setMixerPan(patternId, pan));
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
