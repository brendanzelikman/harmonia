import { FormatterProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import {
  selectCell,
  selectRoot,
  selectTrack,
  selectTrackChildren,
  selectTrackIndex,
  selectTrackParents,
  selectTrackScaleTrack,
  selectTrackTranspositions,
  selectTransport,
} from "redux/selectors";
import { setMixerMute, setMixerSolo } from "redux/thunks/mixers";
import * as Tracks from "redux/thunks/tracks";
import { AppDispatch, RootState } from "redux/store";
import { Track, TrackId } from "types/tracks";
import { Row } from "..";
import { TrackComponent } from "./Track";
import {
  getChordalTranspose,
  getChromaticTranspose,
  getScalarTranspose,
  getLastTransposition,
} from "types/transposition";
import { hideEditor, showEditor } from "redux/slices/editor";
import { EditorId } from "types/editor";
import { setSelectedTrack } from "redux/slices/root";
import { MixerId } from "types";

function mapStateToProps(state: RootState, ownProps: FormatterProps<Row>) {
  const { row } = ownProps;
  const { tick } = selectTransport(state);
  const { selectedTrackId } = selectRoot(state);

  // Track properties
  const track = selectTrack(state, ownProps.row.trackId);
  const scaleTrack = selectTrackScaleTrack(state, track?.id);
  const cell = selectCell(state);

  const selectedParents = selectTrackParents(state, selectedTrackId);
  const isScaleSelected = selectedParents.some(({ id }) => id === track?.id);
  const selectedScaleTrack = selectTrackScaleTrack(state, selectedTrackId);
  const index = selectTrackIndex(state, track?.id);
  const children = selectTrackChildren(state, track?.id);

  // Track transpositions
  const transpositions = selectTrackTranspositions(state, track?.id);
  const lastTransposition = getLastTransposition(transpositions, tick - 1);
  const chromatic = getChromaticTranspose(lastTransposition);
  const scalar = getScalarTranspose(lastTransposition, selectedScaleTrack?.id);
  const chordal = getChordalTranspose(lastTransposition);

  return {
    row,
    track,
    cell,
    scaleTrack,
    selectedTrackId,
    isScaleSelected,
    index,
    children,
    chromatic,
    scalar,
    chordal,
  };
}

function mapDispatchToProps(dispatch: AppDispatch) {
  return {
    updateTrack: (track: Partial<Track>) => {
      dispatch(Tracks.updateTrack(track));
    },
    selectTrack: (trackId: TrackId) => {
      dispatch(setSelectedTrack(trackId));
    },
    clearTrack: (track: Track) => {
      if (!track?.id) return;
      dispatch(Tracks.clearTrack(track.id));
    },
    deleteTrack: (track: Track) => {
      if (!track?.id) return;
      dispatch(Tracks.deleteTrack(track.id));
    },
    duplicateTrack: (track: Track) => {
      if (!track?.id) return;
      dispatch(Tracks.duplicateTrack(track.id));
    },
    collapseTrack: (track: Track) => {
      dispatch(Tracks.collapseTrack(track));
    },
    expandTrack: (track: Track) => {
      dispatch(Tracks.expandTrack(track));
    },
    collapseTrackChildren: (track: Track) => {
      dispatch(Tracks.collapseTrackChildren(track));
    },
    expandTrackChildren: (track: Track) => {
      dispatch(Tracks.expandTrackChildren(track));
    },
    showEditor: (trackId: TrackId, id: EditorId) => {
      dispatch(showEditor({ id, trackId }));
    },
    setTrackMute: (mixerId: MixerId, mute: boolean) => {
      dispatch(setMixerMute(mixerId, mute));
    },
    setTrackSolo: (mixerId: MixerId, solo: boolean) => {
      dispatch(setMixerSolo(mixerId, solo));
    },
    muteTracks: () => {
      dispatch(Tracks.muteTracks());
    },
    unmuteTracks: () => {
      dispatch(Tracks.unmuteTracks());
    },
    soloTracks: () => {
      dispatch(Tracks.soloTracks());
    },
    unsoloTracks: () => {
      dispatch(Tracks.unsoloTracks());
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
  moveTrack: (props: { dragId: TrackId; hoverId: TrackId }) => boolean;
}
