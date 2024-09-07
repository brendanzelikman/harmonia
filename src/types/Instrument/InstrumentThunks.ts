import { Thunk } from "types/Project/ProjectTypes";

import { LiveAudioInstance, LIVE_AUDIO_INSTANCES } from "./InstrumentClass";
import { defaultReverb } from "./InstrumentEffectTypes";
import { selectInstrumentById } from "./InstrumentSelectors";
import { addInstrument, addInstrumentOffline } from "./InstrumentSlice";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";
import {
  initializeInstrument,
  Instrument,
  InstrumentKey,
} from "./InstrumentTypes";
import { Payload } from "lib/redux";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";

interface InstrumentOptions {
  offline?: boolean;
  oldInstrument?: Instrument;
  downloading?: boolean;
}

/** Create a `LiveAudioInstance` and `Instrument` for a given `PatternTrack`. */
export const createInstrument =
  (
    payload: Payload<{
      track: PatternTrack;
      options?: InstrumentOptions;
    }>
  ): Thunk<LiveAudioInstance> =>
  (dispatch, getProject) => {
    const { track } = payload.data;
    const options = payload.data.options ?? {};
    const project = getProject();

    // Get the instrument of the track
    const trackInstrument = selectInstrumentById(project, track.instrumentId);
    const oldInstrument = options.oldInstrument ?? trackInstrument;
    const instrument = initializeInstrument({
      ...oldInstrument,
      trackId: track.id,
    });

    // Dispose the old instrument if it exists (and is not being downloaded)
    if (track.instrumentId && !options.downloading) {
      LIVE_AUDIO_INSTANCES[track.instrumentId]?.dispose();
      delete LIVE_AUDIO_INSTANCES[track.instrumentId];
      instrument.id = track.instrumentId;
    }

    // Create a new instance
    const instance = new LiveAudioInstance(instrument);
    if (options.downloading) return instance;

    // Add the instrument to the store and update the instance
    const undoType = payload?.undoType;
    if (!!options.offline) {
      dispatch(addInstrumentOffline({ data: { instrument }, undoType }));
    } else {
      dispatch(addInstrument({ data: { instrument }, undoType }));
    }

    // Return the new instance
    if (instrument.id) LIVE_AUDIO_INSTANCES[instrument.id] = instance;
    return instance;
  };

/** Create the global instrument using the given instrument key. */
export const createGlobalInstrument = (
  key: InstrumentKey = DEFAULT_INSTRUMENT_KEY
) => {
  // Dispose and delete the old instrument
  const oldInstrument = LIVE_AUDIO_INSTANCES.global;
  if (oldInstrument?.key === key) return;
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
    tracks.forEach((track) => {
      const options = { offline: true };
      dispatch(createInstrument({ data: { track, options } }));
    });
  };

/** Destroy all live audio instances. */
export const destroyInstruments = () => {
  Object.keys(LIVE_AUDIO_INSTANCES).forEach((key) => {
    const liveInstance = LIVE_AUDIO_INSTANCES[key];
    liveInstance?.dispose();
    delete LIVE_AUDIO_INSTANCES[key];
  });
};
