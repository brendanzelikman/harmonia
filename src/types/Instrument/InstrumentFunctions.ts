import {
  INSTRUMENT_CATEGORIES,
  InstrumentCategory,
  Instrument,
  InstrumentKey,
  InstrumentName,
  CategorizedInstrument,
  defaultInstrument,
} from "types/Instrument";
import samples from "assets/instruments/samples.json";
import categories from "assets/instruments/categories.json";
import { SamplesMap } from "lib/tone";

/**
 * Unpack the channel of an instrument.
 * @param instrument - Optional. The instrument.
 * @returns The unpacked channel. If no instrument is provided, the default channel is returned.
 */
export const getInstrumentChannel = (instrument?: Instrument) => {
  return {
    volume: instrument?.volume || defaultInstrument.volume,
    pan: instrument?.pan || defaultInstrument.pan,
    mute: instrument?.mute || defaultInstrument.mute,
    solo: instrument?.solo || defaultInstrument.solo,
  };
};

/**
 * Get the category of an instrument from its key.
 * @param key - The instrument key.
 * @returns The instrument category.
 */
export const getInstrumentCategory = (
  key: InstrumentKey
): InstrumentCategory => {
  const category = INSTRUMENT_CATEGORIES.find((category) =>
    categories[category].some((instrument) => instrument.key === key)
  );
  return category || "keyboards";
};

/**
 * Get the name of an instrument from its key.
 * @param key - The instrument key.
 * @returns The instrument name.
 */
export const getInstrumentName = (key: InstrumentKey): InstrumentName => {
  const category = getInstrumentCategory(key);
  if (!category) return "Unknown Instrument";
  const match = categories[category].find((name) => name.key === key);
  return match?.name ?? "Unknown Instrument";
};

/**
 * Get the sample map of an instrument from its key.
 * @param key - The instrument key.
 * @returns The instrument sample map.
 */
export const getInstrumentSamplesMap = (key: InstrumentKey): SamplesMap => {
  return samples[key];
};

/**
 * Get the base URL of an instrument's samples from its key.
 * @param key - The instrument key.
 * @returns The instrument sample base URL.
 */
export const getInstrumentSamplesBaseUrl = (key: InstrumentKey) => {
  const category = getInstrumentCategory(key);
  return `${window.location.origin + `/harmonia/samples/${category}/${key}/`}`;
};

/**
 * Get the list of instruments corresponding to a given category.
 * @param category - The instrument category.
 * @returns The list of instruments.
 */
export const getCategoryInstruments = (category: InstrumentCategory) =>
  categories[category] as CategorizedInstrument[];
