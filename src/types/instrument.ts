import { isPatternTrack, PatternTrack, TrackId } from "./tracks";
import { Sampler } from "tone";
import { defaultMixer, initializeMixer, Mixer, MixerInstance } from "./mixer";

import categories from "assets/instruments/categories.json";
import samples from "assets/instruments/samples.json";
import { AppThunk } from "redux/store";
import { addMixer } from "redux/slices/mixers";
import { selectMixerById } from "redux/selectors";

export interface Instrument {
  key: InstrumentKey;
  sampler: Sampler;
  mixer: MixerInstance;
}

export interface InstrumentType {
  key: InstrumentKey;
  name: InstrumentName;
}

export const INSTRUMENTS: Record<TrackId, Instrument> = {};

// Instrument keys
// e.g. "acoustic_grand_piano", "acoustic_guitar_nylon", "acoustic_bass"
export type InstrumentKey = keyof typeof samples;
export const INSTRUMENT_KEYS = Object.keys(samples) as InstrumentKey[];

// Instrument categories
// e.g. "keyboards", "guitars", "bass", "drums", "strings", "brass", "woodwinds"
export type InstrumentCategory = keyof typeof categories;
export const INSTRUMENT_CATEGORIES = Object.keys(
  categories
) as InstrumentCategory[];

export const getInstrumentCategory = (instrument: string) => {
  for (const category of INSTRUMENT_CATEGORIES) {
    const instruments = getCategoryInstruments(category);
    if (instruments.some(({ key }) => key === instrument)) {
      return category;
    }
  }
  return "keyboards";
};

export const getCategoryInstruments = (category: InstrumentCategory) =>
  categories[category] as InstrumentType[];

// Instrument names
// e.g. "Grand Piano", "Nylon Guitar", "Acoustic Bass"
export const INSTRUMENT_NAMES = Object.values(categories).reduce((acc, cur) => {
  if (!cur || !cur.length) return acc;
  const names = cur.map((instrument) => instrument.name);
  return [...acc, ...names];
}, [] as string[]);
export type InstrumentName = (typeof INSTRUMENT_NAMES)[number];

export const getInstrumentName = (instrument: InstrumentKey) => {
  const category = INSTRUMENT_CATEGORIES.find((key) =>
    categories[key].some((instrumentKey) => instrumentKey.key === instrument)
  );
  if (!category) return "Unknown Instrument";

  const match = categories[category].find((name) => name.key === instrument);
  return match?.name ?? "Unknown Instrument";
};

// Create a sampler from a given instrument key
export const createSampler = (
  instrumentKey: InstrumentKey,
  onload?: (sampler: Sampler) => void
) => {
  const category = INSTRUMENT_CATEGORIES.find((key) =>
    categories[key].some((instrument) => instrument.key === instrumentKey)
  );
  if (!category) return Promise.resolve(undefined);

  const sampleMap = samples[instrumentKey];
  if (!sampleMap) return Promise.resolve(undefined);

  return new Promise<Sampler>((resolve) => {
    const sampler = new Sampler({
      urls: { ...sampleMap },
      baseUrl: `${window.location.origin}/harmonia/samples/${category}/${instrumentKey}/`,
      onload: () => {
        if (onload) onload(sampler);
        resolve(sampler);
      },
    });
  });
};

// Create an instrument from a given track
export const createInstrument =
  (
    track: PatternTrack,
    offline = false,
    _oldMixer?: Mixer
  ): AppThunk<Promise<Sampler | undefined>> =>
  (dispatch, getState) => {
    const state = getState();
    const oldMixer = _oldMixer ?? selectMixerById(state, track?.mixerId);

    if (!isPatternTrack(track)) return Promise.resolve(undefined);

    const onload = (sampler: Sampler) => {
      if (!offline) {
        let instrument = INSTRUMENTS[track.id];
        // Dispose the old instrument if it exists
        if (instrument) {
          instrument.sampler?.dispose();
          instrument.mixer?.dispose();
        }
      }

      // Create and instantiate a new mixer
      const trackMixer = track.mixerId.length
        ? { ...defaultMixer, ...oldMixer, trackId: track.id, id: track.mixerId }
        : initializeMixer({ ...defaultMixer, ...oldMixer, trackId: track.id });

      const mixer = new MixerInstance(trackMixer);
      if (!mixer) return Promise.resolve(undefined);

      // Connect the sampler
      sampler.connect(mixer.channel);

      // Add the sampler + mixer to the global instruments
      if (!offline) {
        dispatch(addMixer(trackMixer));
        INSTRUMENTS[track.id] = {
          key: track.instrument,
          sampler,
          mixer,
        };
      }
    };

    const instrumentKey = track.instrument as InstrumentKey;
    return createSampler(instrumentKey, onload);
  };

// Create the global instrument
export const createGlobalInstrument = (
  instrumentKey: InstrumentKey = "grand_piano"
) => {
  // Find the category of the instrument
  const category = INSTRUMENT_CATEGORIES.find((key) =>
    categories[key].some((i) => i.key === instrumentKey)
  );
  if (!category) return;
  return new Promise<Instrument>((resolve) => {
    const sampler = new Sampler({
      urls: { ...samples[instrumentKey] },
      baseUrl: `${window.location.origin}/harmonia/samples/${category}/${instrumentKey}/`,
      onload: () => {
        // Dispose the old instrument if it exists
        let instrument = INSTRUMENTS["global"];
        if (instrument) {
          instrument.sampler.dispose();
          instrument.mixer.dispose();
          delete INSTRUMENTS["global"];
        }

        // Create a new mixer
        const mixer = new MixerInstance(defaultMixer);
        if (!mixer.channel) return;

        // Connect the sampler
        sampler.connect(mixer.channel);

        // Add to the global instruments
        const newInstrument: Instrument = {
          key: instrumentKey,
          sampler,
          mixer,
        };
        INSTRUMENTS["global"] = newInstrument;
        resolve(newInstrument);
      },
    });
  });
};

// Build all samplers for all tracks and return a promise
export const buildInstruments =
  (tracks: PatternTrack[]): AppThunk =>
  (dispatch) => {
    return Promise.all(
      tracks.map((track) => dispatch(createInstrument(track)))
    );
  };

// Destroy all samplers for all tracks
export const destroyInstruments = () => {
  Object.keys(INSTRUMENTS).forEach((key) => {
    const instrument = INSTRUMENTS[key];
    instrument.sampler.dispose();
    instrument.mixer.dispose();
    delete INSTRUMENTS[key];
  });
};

// Update the sampler of a track
export const updateInstrument =
  (track: PatternTrack): AppThunk =>
  (dispatch) => {
    dispatch(createInstrument(track));
  };

// Get the global instrument name
export const getGlobalInstrumentName = (): InstrumentName => {
  const globalInstrument = INSTRUMENTS["global"];
  if (!globalInstrument) return "Instrument";
  return getInstrumentName(globalInstrument.key as InstrumentKey);
};

// Get the global sampler
export const getGlobalSampler = () => {
  return INSTRUMENTS["global"]?.sampler;
};

export const isSamplerLoaded = (sampler?: Sampler) => {
  return sampler?.loaded && !sampler?.disposed;
};
