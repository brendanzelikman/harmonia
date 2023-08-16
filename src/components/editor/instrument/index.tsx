import { connect, ConnectedProps } from "react-redux";
import { selectActiveTrackId, selectPatternTrack } from "redux/selectors";
import { selectMixerByTrackId } from "redux/selectors/mixers";
import { setPatternTrackInstrument } from "redux/slices/patternTracks";
import { AppDispatch, RootState } from "redux/store";
import {
  getInstrumentName,
  INSTRUMENT_CATEGORIES,
  InstrumentCategory,
  InstrumentName,
} from "types/instrument";
import { TrackId } from "types/tracks";
import { EditorProps } from "..";
import { EditorInstrument } from "./InstrumentEditor";
import { StateProps } from "../Editor";

import categories from "assets/instruments/categories.json";

export interface InstrumentType {
  key: InstrumentName;
  name: string;
}
export const getCategoryInstruments = (category: InstrumentCategory) =>
  categories[category] as InstrumentType[];

export const getInstrumentCategory = (instrument: string) => {
  for (const category of INSTRUMENT_CATEGORIES) {
    const instruments = getCategoryInstruments(category);
    if (instruments.some(({ key }) => key === instrument)) {
      return category;
    }
  }
  return "keyboards";
};

const mapStateToProps = (state: RootState, ownProps: EditorProps) => {
  const trackId = selectActiveTrackId(state);
  const track = trackId ? selectPatternTrack(state, trackId) : undefined;
  const mixer = trackId ? selectMixerByTrackId(state, trackId) : undefined;

  const instruments = Object.keys(categories).reduce(
    (acc, category) => [
      ...acc,
      ...getCategoryInstruments(category as InstrumentCategory),
    ],
    [] as InstrumentType[]
  );

  const instrumentKey = track?.instrument as InstrumentName;
  const instrumentCategory = getInstrumentCategory(instrumentKey);
  const instrumentName =
    getInstrumentName(instrumentKey) ?? track?.instrument ?? "Grand Piano";

  return {
    ...ownProps,
    track,
    mixer,
    instruments,
    instrumentKey,
    instrumentName,
    instrumentCategory,
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
export interface InstrumentEditorProps extends Props, StateProps {}

export default connector(EditorInstrument);
