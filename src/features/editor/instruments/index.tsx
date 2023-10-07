import { connect, ConnectedProps } from "react-redux";
import {
  selectSelectedTrackId,
  selectPatternTrackById,
  selectInstrumentById,
  selectTransport,
} from "redux/selectors";

import { AppDispatch, RootState } from "redux/store";
import {
  SafeEffect,
  EffectId,
  EffectKey,
  getCategoryInstruments,
  getInstrumentCategory,
  getInstrumentName,
  InstrumentCategory,
  InstrumentKey,
  InstrumentId,
} from "types/Instrument";
import { TrackId } from "types/Track";
import { EditorProps } from "..";
import { EditorInstrument } from "./components/InstrumentEditor";
import { StateProps } from "../components/Editor";
import categories from "assets/instruments/categories.json";
import {
  addInstrumentEffect,
  rearrangeInstrumentEffect,
  removeAllInstrumentEffects,
  removeInstrumentEffect,
  resetInstrumentEffect,
  updateInstrumentEffect,
} from "redux/Instrument";
import {
  setPatternTrackInstrument,
  selectPatternTrackInstrumentKey,
} from "redux/PatternTrack";

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const trackId = selectSelectedTrackId(state);
  const transport = selectTransport(state);
  const track = trackId ? selectPatternTrackById(state, trackId) : undefined;
  const instrument = track
    ? selectInstrumentById(state, track.instrumentId)
    : undefined;

  const instruments = Object.keys(categories)
    .map((category) => getCategoryInstruments(category as InstrumentCategory))
    .flat();
  const instrumentKey = trackId
    ? selectPatternTrackInstrumentKey(state, trackId)
    : undefined;
  const instrumentName = instrumentKey
    ? getInstrumentName(instrumentKey)
    : undefined;
  const instrumentCategory = instrumentKey
    ? getInstrumentCategory(instrumentKey)
    : undefined;
  const isTransportStarted = transport.state === "started";

  return {
    ...ownProps,
    track,
    instrument,
    effects: instrument?.effects,
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
    updateInstrumentEffect: (
      instrumentId: InstrumentId,
      update: Partial<SafeEffect>
    ) => {
      if (!update.id) return;
      dispatch(
        updateInstrumentEffect({
          instrumentId,
          effectId: update.id,
          update,
        })
      );
    },
    rearrangeInstrumentEffects: (
      instrumentId: InstrumentId,
      effectId: EffectId,
      index: number
    ) => {
      dispatch(rearrangeInstrumentEffect({ instrumentId, effectId, index }));
    },
    addInstrumentEffect: (instrumentId?: InstrumentId, key?: EffectKey) => {
      if (!instrumentId || !key) return;
      dispatch(addInstrumentEffect({ instrumentId, key }));
    },
    removeInstrumentEffect: (
      instrumentId: InstrumentId,
      effectId: EffectId
    ) => {
      dispatch(removeInstrumentEffect({ instrumentId, effectId }));
    },
    resetInstrumentEffect: (instrumentId: InstrumentId, effectId: EffectId) => {
      dispatch(resetInstrumentEffect({ instrumentId, effectId }));
    },
    removeAllInstrumentEffects: (instrumentId?: InstrumentId) => {
      if (!instrumentId) return;
      dispatch(removeAllInstrumentEffects(instrumentId));
    },
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);

type Props = ConnectedProps<typeof connector>;
export interface InstrumentEditorProps extends Props, StateProps {}

export default connector(EditorInstrument);
