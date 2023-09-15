import { connect, ConnectedProps } from "react-redux";
import {
  selectSelectedTrackId,
  selectPatternTrack,
  selectMixerById,
  selectTransport,
} from "redux/selectors";
import { setPatternTrackInstrument } from "redux/slices/patternTracks";
import { AppDispatch, RootState } from "redux/store";
import {
  getCategoryInstruments,
  getInstrumentCategory,
  getInstrumentName,
  InstrumentCategory,
  InstrumentKey,
  InstrumentType,
} from "types/instrument";
import { TrackId } from "types/tracks";
import { EditorProps } from "..";
import { EditorInstrument } from "./components/InstrumentEditor";
import { StateProps } from "../components/Editor";
import categories from "assets/instruments/categories.json";
import { EffectId, Effect, EffectKey, MixerId } from "types";
import {
  addMixerEffect,
  rearrangeMixerEffect,
  removeAllMixerEffects,
  removeMixerEffect,
  resetMixerEffect,
  updateMixerEffect,
} from "redux/slices/mixers";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const trackId = selectSelectedTrackId(state);
  const transport = selectTransport(state);
  const track = trackId ? selectPatternTrack(state, trackId) : undefined;
  const mixer = track ? selectMixerById(state, track.mixerId) : undefined;

  const instruments = Object.keys(categories).reduce(
    (acc, category) => [
      ...acc,
      ...getCategoryInstruments(category as InstrumentCategory),
    ],
    [] as InstrumentType[]
  );

  const instrumentKey = track?.instrument as InstrumentKey;
  const instrumentName = getInstrumentName(instrumentKey);
  const instrumentCategory = getInstrumentCategory(instrumentKey);
  const isTransportStarted = transport.state === "started";

  return {
    ...ownProps,
    track,
    mixer,
    effects: mixer?.effects,
    instruments,
    instrumentKey,
    instrumentName,
    instrumentCategory,
    isTransportStarted,
  };
};
const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    setTrackInstrument: (trackId: TrackId, instrument: InstrumentKey) => {
      dispatch(setPatternTrackInstrument(trackId, instrument));
    },
    updateMixerEffect: (mixerId: MixerId, update: Partial<Effect>) => {
      if (!update.id) return;
      dispatch(updateMixerEffect({ mixerId, effectId: update.id, update }));
    },
    rearrangeMixerEffects: (
      mixerId: MixerId,
      effectId: EffectId,
      index: number
    ) => {
      dispatch(rearrangeMixerEffect({ mixerId, effectId, index }));
    },
    addMixerEffect: (mixerId: MixerId, key: EffectKey) => {
      dispatch(addMixerEffect({ mixerId, key }));
    },
    removeMixerEffect: (mixerId: MixerId, effectId: EffectId) => {
      dispatch(removeMixerEffect({ mixerId, effectId }));
    },
    resetMixerEffect: (mixerId: MixerId, effectId: EffectId) => {
      dispatch(resetMixerEffect({ mixerId, effectId }));
    },
    removeAllMixerEffects: (mixerId: MixerId) => {
      dispatch(removeAllMixerEffects(mixerId));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface InstrumentEditorProps extends Props, StateProps {}

export default connector(EditorInstrument);
