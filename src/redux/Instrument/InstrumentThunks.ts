import { AppThunk } from "redux/store";
import { PatternTrack } from "types/PatternTrack";
import { selectInstrumentById } from "./InstrumentSelectors";
import { addInstrument } from "./InstrumentSlice";
import {
  Instrument,
  LiveAudioInstance,
  LIVE_AUDIO_INSTANCES,
  initializeInstrument,
  InstrumentKey,
  defaultReverb,
} from "types/Instrument";

/**
 * Create a `LiveAudioInstance` and `Instrument` for a given `PatternTrack`.
 * @param track The `PatternTrack`.
 * @param offline Whether to add the instrument to the store.
 * @param oldInstrument Optional. The old instrument to use.
 * @return The `LiveAudioInstance`.
 */
export const createInstrument =
  (
    track: PatternTrack,
    offline = false,
    oldInstrument?: Instrument
  ): AppThunk<LiveAudioInstance> =>
  (dispatch, getState) => {
    const state = getState();

    // Get the instrument of the track
    const trackInstrument = selectInstrumentById(state, track.instrumentId);
    const instrument = oldInstrument ?? trackInstrument;

    // Dispose the old instrument if it exists
    if (track.instrumentId && !offline) {
      LIVE_AUDIO_INSTANCES[track.instrumentId]?.dispose();
      delete LIVE_AUDIO_INSTANCES[track.instrumentId];
    }

    // Create a new instrument, using the old instrument ID if it exists
    const newInstrument = initializeInstrument(instrument);
    if (track.instrumentId !== undefined) newInstrument.id = track.instrumentId;

    // Create a new instance
    const instance = new LiveAudioInstance(newInstrument);
    LIVE_AUDIO_INSTANCES[instance.id] = instance;

    // Add the instrument to the store and update the instance
    if (!offline) dispatch(addInstrument(newInstrument));

    // Return the new instance
    return instance;
  };

/**
 * Create the global instrument using the given instrument key.
 * @param instrumentKey The instrument key.
 * @returns The `LiveAudioInstance`.
 */
export const createGlobalInstrument = (
  instrumentKey: InstrumentKey = "grand_piano"
) => {
  // Dispose and delete the old instrument
  const oldInstrument = LIVE_AUDIO_INSTANCES.global;
  if (oldInstrument) oldInstrument.dispose();
  delete LIVE_AUDIO_INSTANCES.global;

  // Create the new instrument with a little reverb
  const newInstrument = initializeInstrument({
    key: instrumentKey,
    effects: [{ ...defaultReverb, wet: 0.5 }],
  });
  newInstrument.id = "global";

  // Create the new instance
  const instance = new LiveAudioInstance(newInstrument);
  LIVE_AUDIO_INSTANCES.global = instance;

  // Return the new instance
  return instance;
};

/**
 * Build all instruments for all pattern tracks.
 * @param tracks The tracks.
 */
export const buildInstruments =
  (tracks: PatternTrack[]): AppThunk =>
  (dispatch) => {
    tracks.forEach((track) => dispatch(createInstrument(track)));
  };

/**
 * Destroy all live audio instances.
 */
export const destroyInstruments = () => {
  Object.keys(LIVE_AUDIO_INSTANCES).forEach((key) => {
    const liveInstance = LIVE_AUDIO_INSTANCES[key];
    liveInstance?.dispose();
    delete LIVE_AUDIO_INSTANCES[key];
  });
};
