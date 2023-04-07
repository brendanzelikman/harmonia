import { connect, ConnectedProps } from "react-redux";
import { selectActiveTrackId, selectPatternTrack } from "redux/selectors";
import { selectMixerByTrackId } from "redux/selectors/mixers";
import { setPatternTrackInstrument } from "redux/slices/patternTracks";
import { AppDispatch, RootState } from "redux/store";
import { InstrumentName } from "types/instrument";
import { TrackId } from "types/tracks";
import { EditorProps } from "..";
import { EditorInstrument } from "./Instrument";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const trackId = selectActiveTrackId(state);
  const track = trackId ? selectPatternTrack(state, trackId) : undefined;
  const mixer = trackId ? selectMixerByTrackId(state, trackId) : undefined;
  return {
    ...ownProps,
    track,
    mixer,
  };
};
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setTrackInstrument: (trackId: TrackId, instrument: InstrumentName) => {
      dispatch(setPatternTrackInstrument(trackId, instrument));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface EditorInstrumentProps extends Props {}

export default connector(EditorInstrument);
