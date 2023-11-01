import { Thunk } from "types/Project";
import { PatternTrack } from "types/PatternTrack";
import { selectInstrumentById } from "./InstrumentSelectors";
import { addInstrument, _addOfflineInstrument } from "./InstrumentSlice";
import {
  Instrument,
  LiveAudioInstance,
  LIVE_AUDIO_INSTANCES,
  initializeInstrument,
  InstrumentKey,
  defaultReverb,
} from "types/Instrument";

interface InstrumentOptions {
  offline?: boolean;
  oldInstrument?: Instrument;
  downloading?: boolean;
}

/** Create a `LiveAudioInstance` and `Instrument` for a given `PatternTrack`. */
export const createInstrument =
  (track: PatternTrack, options: InstrumentOptions): Thunk<LiveAudioInstance> =>
  (dispatch, getProject) => {
    const project = getProject();

    // Get the instrument of the track
    const trackInstrument = selectInstrumentById(project, track.instrumentId);
    const oldInstrument = options.oldInstrument ?? trackInstrument;

    // Dispose the old instrument if it exists (and is not being downloaded)
    if (track.instrumentId && !options.downloading) {
      LIVE_AUDIO_INSTANCES[track.instrumentId]?.dispose();
      delete LIVE_AUDIO_INSTANCES[track.instrumentId];
    }

    // Create a new instrument, using the old instrument ID if it exists
    const instrument = initializeInstrument(oldInstrument);
    if (track.instrumentId !== undefined) instrument.id = track.instrumentId;

    // Create a new instance
    const instance = new LiveAudioInstance(instrument);
    if (options.downloading) return instance;

    // Add the instrument to the store and update the instance
    if (!!options.offline) {
      dispatch(_addOfflineInstrument(instrument));
    } else {
      dispatch(addInstrument({ track, instrument }));
    }

    // Return the new instance
    return instance;
  };

/** Create the global instrument using the given instrument key. */
export const createGlobalInstrument = (key: InstrumentKey = "grand_piano") => {
  // Dispose and delete the old instrument
  const oldInstrument = LIVE_AUDIO_INSTANCES.global;
  if (oldInstrument) oldInstrument.dispose();
  delete LIVE_AUDIO_INSTANCES.global;

  // Create the new instrument with a little reverb
  const effects = [{ ...defaultReverb, wet: 0.5 }];
  const instrument = initializeInstrument({ key, effects });
  instrument.id = "global";

  // Create the new instance
  const instance = new LiveAudioInstance(instrument);
  LIVE_AUDIO_INSTANCES.global = instance;

  // Return the new instance
  return instance;
};

/** Build all instruments for all pattern tracks. */
export const buildInstruments =
  (tracks: PatternTrack[]): Thunk =>
  (dispatch) => {
    tracks.forEach((track) =>
      dispatch(createInstrument(track, { offline: true }))
    );
  };

/** Destroy all live audio instances. */
export const destroyInstruments = () => {
  Object.keys(LIVE_AUDIO_INSTANCES).forEach((key) => {
    const liveInstance = LIVE_AUDIO_INSTANCES[key];
    liveInstance?.dispose();
    delete LIVE_AUDIO_INSTANCES[key];
  });
};
