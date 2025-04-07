import { Thunk } from "types/Project/ProjectTypes";

import {
  LiveAudioInstance,
  LIVE_AUDIO_INSTANCES,
  LiveSamplerOptions,
} from "./InstrumentClass";
import { defaultReverb } from "./InstrumentEffectTypes";
import { selectInstrumentById } from "./InstrumentSelectors";
import { addInstrument, addInstrumentOffline } from "./InstrumentSlice";
import { DEFAULT_INSTRUMENT_KEY } from "utils/constants";
import {
  initializeInstrument,
  Instrument,
  INSTRUMENT_SET,
  InstrumentKey,
} from "./InstrumentTypes";
import { Payload } from "lib/redux";
import { PatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { getSampleBufferFromIDB } from "providers/samples";
import { getInstrumentSamplesMap } from "./InstrumentFunctions";

interface InstrumentOptions extends LiveSamplerOptions {
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
  ): Thunk<{ instrument: Instrument; instance: LiveAudioInstance }> =>
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
    const { urls, onload } = options;
    const instance = new LiveAudioInstance({ ...instrument, urls, onload });
    if (options.downloading) return { instrument, instance };

    // Add the instrument to the store and update the instance
    const undoType = payload?.undoType;
    if (!!options.offline) {
      dispatch(addInstrumentOffline({ data: { instrument }, undoType }));
    } else {
      dispatch(addInstrument({ data: { instrument }, undoType }));
    }

    // Return the new instance
    if (instrument.id) LIVE_AUDIO_INSTANCES[instrument.id] = instance;
    return { instrument, instance };
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
  const effects = [{ ...defaultReverb, wet: 0.2 }];
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
  (
    tracks: PatternTrack[]
  ): Thunk<
    Promise<{ instrument: Instrument; instance: LiveAudioInstance }[]>
  > =>
  async (dispatch, getProject) => {
    const project = getProject();
    return Promise.all(
      tracks.map(
        async (track) =>
          new Promise(async (resolve) => {
            const oldInstrument = selectInstrumentById(
              project,
              track.instrumentId
            );
            const isLocal = oldInstrument
              ? !INSTRUMENT_SET.has(oldInstrument?.key)
              : false;
            let urls = undefined;
            const useSample = oldInstrument && isLocal;
            const options: InstrumentOptions = { offline: true, urls };
            if (useSample) {
              const sample = await getSampleBufferFromIDB(oldInstrument?.key);
              if (sample) {
                options.urls = { C3: sample };
              } else {
                options.urls = getInstrumentSamplesMap(DEFAULT_INSTRUMENT_KEY);
                options.oldInstrument = {
                  ...oldInstrument,
                  key: DEFAULT_INSTRUMENT_KEY,
                };
              }
            }
            const { instrument, instance } = dispatch(
              createInstrument({
                data: {
                  track,
                  options: {
                    ...options,
                    onload: () => resolve({ instrument, instance }),
                  },
                },
              })
            );
          })
      )
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
