import { isPatternTrack, Track, TrackId } from "./tracks";
import { Sampler } from "tone";
import { defaultMixer, initializeMixer, MixerInstance } from "./mixer";

import categories from "assets/instruments/categories.json";
import samples from "assets/instruments/samples.json";
import { AppThunk } from "redux/store";
import { addMixer } from "redux/slices/mixers";
import { selectMixerByTrackId } from "redux/selectors";

export interface Instrument {
  name: string;
  sampler: Sampler;
  mixer: MixerInstance;
}
export const INSTRUMENTS: Record<TrackId, Instrument> = {};

export type InstrumentName = keyof typeof samples;
export const INSTRUMENT_NAMES = Object.keys(samples) as InstrumentName[];

export type InstrumentCategory = keyof typeof categories;
export const INSTRUMENT_CATEGORIES = Object.keys(
  categories
) as InstrumentCategory[];

export const getInstrumentName = (instrument: InstrumentName) => {
  const category = INSTRUMENT_CATEGORIES.find((key) =>
    categories[key].some((instrumentName) => instrumentName.key === instrument)
  );
  if (!category) return;
  return categories[category].find((name) => name.key === instrument)?.name;
};

// Create an instrument for a track
export const createInstrument =
  (track: Track): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const oldMixer = selectMixerByTrackId(state, track.id);

    if (isPatternTrack(track)) {
      // Find the category of the instrument
      const category = INSTRUMENT_CATEGORIES.find((key) =>
        categories[key].some(
          (instrument) => instrument.key === track.instrument
        )
      );
      if (!category) return;

      // Find the sample map of the instrument
      const instrumentName = track.instrument as InstrumentName;
      const sampleMap = samples[instrumentName];
      if (!sampleMap) return;

      // Return a promise that resolves when the instrument is created and connected
      return new Promise<void>((resolve) => {
        const sampler = new Sampler({
          urls: { ...sampleMap },
          baseUrl: `${window.location.href}/samples/${category}/${track.instrument}/`,
          onload: () => {
            let instrument = INSTRUMENTS[track.id];
            // Dispose the old instrument if it exists
            if (instrument) {
              instrument.sampler.dispose();
              instrument.mixer.dispose();
              delete INSTRUMENTS[track.id];
            }
            // Create and instantiate a new mixer
            const trackMixer = initializeMixer({
              ...defaultMixer,
              ...oldMixer,
              trackId: track.id,
            });
            const mixer = new MixerInstance(trackMixer);
            if (!mixer) return;
            // Connect the mixer to the track sampler
            sampler.connect(mixer.channel);
            // Add the sampler + mixer to the global instruments
            dispatch(addMixer(trackMixer));
            INSTRUMENTS[track.id] = { sampler, mixer, name: track.instrument };
            resolve();
          },
        });
      });
    }
  };

// Create the global instrument
export const createGlobalInstrument = () => {
  return new Promise<void>((resolve) => {
    const sampler = new Sampler({
      urls: { ...samples["grand_piano"] },
      baseUrl: `${window.location.href}/samples/keyboards/grand_piano/`,
      onload: () => {
        // Connect and instantiate a new mixer
        const mixer = new MixerInstance(defaultMixer);
        if (!mixer.channel) return;
        sampler.connect(mixer.channel);
        INSTRUMENTS["global"] = { sampler, mixer, name: "grand_piano" };
        resolve();
      },
    });
  });
};

// Build all samplers for all tracks and return a promise
export const buildInstruments =
  (tracks: Track[]): AppThunk =>
  (dispatch) => {
    return Promise.all(
      tracks.map((track) => dispatch(createInstrument(track)))
    );
  };

// Get the sampler of a track
export const getSampler = (trackId: TrackId) => {
  return INSTRUMENTS[trackId]?.sampler;
};

// Update the sampler of a track
export const updateInstrument =
  (track: Track): AppThunk =>
  (dispatch) => {
    dispatch(createInstrument(track));
  };

// Get the global sampler
export const getGlobalSampler = () => {
  return INSTRUMENTS["global"]?.sampler;
};
