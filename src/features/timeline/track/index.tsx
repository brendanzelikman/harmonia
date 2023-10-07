import { FormatterProps } from "react-data-grid";
import { connect, ConnectedProps } from "react-redux";
import {
  selectCell,
  selectRoot,
  selectTrackById,
  selectTrackChildren,
  selectTrackIndexById,
  selectTrackParents,
  selectTrackScaleTrack,
  selectTrackTranspositions,
  selectTransport,
} from "redux/selectors";
import * as Tracks from "redux/Track";
import { AppDispatch, RootState } from "redux/store";
import { Track, TrackId } from "types/Track";
import { Row } from "..";
import { TrackComponent } from "./Track";
import {
  getChordalOffset,
  getChromaticOffset,
  getScalarOffset,
  getLastTransposition,
} from "types/Transposition";
import { hideEditor, showEditor } from "redux/Editor/EditorSlice";
import { EditorId } from "types/Editor";
import { setSelectedTrack } from "redux/Root";
import { updateInstrument } from "redux/Instrument";
import { InstrumentId } from "types/Instrument";

function mapStateToProps(state: RootState, ownProps: FormatterProps<Row>) {
  const { row } = ownProps;
  const { tick } = selectTransport(state);
  const { selectedTrackId } = selectRoot(state);

  // Track properties
  const track = ownProps.row.trackId
    ? selectTrackById(state, ownProps.row.trackId)
    : undefined;
  const scaleTrack = track ? selectTrackScaleTrack(state, track.id) : undefined;
  const cell = selectCell(state);

  const selectedParents = selectedTrackId
    ? selectTrackParents(state, selectedTrackId)
    : [];
  const isScaleSelected = selectedParents.some(({ id }) => id === track?.id);
  const selectedScaleTrack = selectedTrackId
    ? selectTrackScaleTrack(state, selectedTrackId)
    : undefined;
  const index = track ? selectTrackIndexById(state, track.id) : -1;
  const children = track ? selectTrackChildren(state, track.id) : [];

  // Track transpositions
  const transpositions = track
    ? selectTrackTranspositions(state, track.id)
    : [];
  const lastTransposition = getLastTransposition(transpositions, tick - 1);

  const offsets = lastTransposition?.offsets;
  const chromatic = getChromaticOffset(offsets);
  const scalar = selectedScaleTrack
    ? getScalarOffset(offsets, selectedScaleTrack.id)
    : undefined;
  const chordal = getChordalOffset(offsets);

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
      dispatch(Tracks.updateTracks([track]));
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
    setTrackMute: (instrumentId: InstrumentId, mute: boolean) => {
      dispatch(updateInstrument({ instrumentId, update: { mute } }));
    },
    setTrackSolo: (instrumentId: InstrumentId, solo: boolean) => {
      dispatch(updateInstrument({ instrumentId, update: { solo } }));
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
