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
  if (!category) return "Unknown";

  const match = categories[category].find((name) => name.key === instrument);
  return match?.name ?? "Unknown";
};

export const createSampler = (
  instrumentName: InstrumentName,
  onload?: (sampler: Sampler) => void
) => {
  const category = INSTRUMENT_CATEGORIES.find((key) =>
    categories[key].some((instrument) => instrument.key === instrumentName)
  );
  if (!category) return Promise.resolve(undefined);

  const sampleMap = samples[instrumentName];
  if (!sampleMap) return Promise.resolve(undefined);

  return new Promise<Sampler>((resolve) => {
    const sampler = new Sampler({
      urls: { ...sampleMap },
      baseUrl: `${window.location.origin}/harmonia/samples/${category}/${instrumentName}/`,
      onload: () => {
        if (onload) onload(sampler);
        resolve(sampler);
      },
    });
  });
};

// Create an instrument for a track
export const createInstrument =
  (track: Track, offline = false): AppThunk<Promise<Sampler | undefined>> =>
  (dispatch, getState) => {
    const state = getState();
    const oldMixer = selectMixerByTrackId(state, track.id);

    if (!isPatternTrack(track)) return Promise.resolve(undefined);

    const onload = (sampler: Sampler) => {
      if (!offline) {
        let instrument = INSTRUMENTS[track.id];
        // Dispose the old instrument if it exists
        if (instrument) {
          instrument.sampler.dispose();
          instrument.mixer.dispose();
          delete INSTRUMENTS[track.id];
        }
      }
      // Create and instantiate a new mixer
      const trackMixer = initializeMixer({
        ...defaultMixer,
        ...oldMixer,
        trackId: track.id,
      });
      const mixer = new MixerInstance(trackMixer);
      if (!mixer) return Promise.resolve(undefined);
      // Connect the mixer to the track sampler
      sampler.connect(mixer.channel);
      // Add the sampler + mixer to the global instruments
      if (!offline) {
        dispatch(addMixer(trackMixer));
        INSTRUMENTS[track.id] = { sampler, mixer, name: track.instrument };
      }
    };

    const instrumentName = track.instrument as InstrumentName;
    return createSampler(instrumentName, onload);
  };

// Create the global instrument
export const createGlobalInstrument = (
  instrumentName: InstrumentName = "grand_piano"
) => {
  // Find the category of the instrument
  const category = INSTRUMENT_CATEGORIES.find((key) =>
    categories[key].some((i) => i.key === instrumentName)
  );
  if (!category) return;
  return new Promise<void>((resolve) => {
    const sampler = new Sampler({
      urls: { ...samples[instrumentName] },
      baseUrl: `${window.location.origin}/harmonia/samples/${category}/${instrumentName}/`,
      onload: () => {
        // Dispose the old instrument if it exists
        let instrument = INSTRUMENTS["global"];
        if (instrument) {
          instrument.sampler.dispose();
          instrument.mixer.dispose();
          delete INSTRUMENTS["global"];
        }
        // Connect and instantiate a new mixer
        const mixer = new MixerInstance(defaultMixer);
        if (!mixer.channel) return;
        // Connect the mixer to the global sampler
        sampler.connect(mixer.channel);
        // Add the sampler + mixer to the global instruments
        INSTRUMENTS["global"] = { sampler, mixer, name: instrumentName };
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

// Destroy all samplers for all tracks
export const destroyInstruments = () => {
  const keys = Object.keys(INSTRUMENTS);
  keys.forEach((key) => {
    const instrument = INSTRUMENTS[key];
    instrument.sampler.dispose();
    instrument.mixer.dispose();
    delete INSTRUMENTS[key];
  });
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

// Get the global instrument
export const getGlobalInstrument = () => {
  return INSTRUMENTS["global"];
};

// Get the global instrument name
export const getGlobalInstrumentName = () => {
  const globalInstrument = getGlobalInstrument();
  if (!globalInstrument) return "Instrument";
  return getInstrumentName(globalInstrument.name as InstrumentName);
};

// Get the global sampler
export const getGlobalSampler = () => {
  return INSTRUMENTS["global"]?.sampler;
};

export const isSamplerLoaded = (sampler?: Sampler) => {
  return sampler?.loaded && !sampler?.disposed;
};
