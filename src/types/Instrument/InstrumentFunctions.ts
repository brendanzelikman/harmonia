import {
  INSTRUMENT_CATEGORIES,
  InstrumentCategory,
  Instrument,
  InstrumentKey,
  InstrumentName,
  CategorizedInstrument,
  defaultInstrument,
  SafeEffect,
} from "types/Instrument";
import samples from "assets/instruments/samples.json";
import categories from "assets/instruments/categories.json";
import { SamplesMap } from "lib/tone";

/**
 * Get the unique tag of a given Instrument.
 * @param instrument The Instrument object.
 * @returns Unique tag string. If the Instrument is invalid, return the error tag.
 */
export const getInstrumentTag = (instrument: Partial<Instrument>) => {
  if (!instrument) return "invalid-instrument";
  const effectTags = instrument.effects?.map(getInstrumentEffectTag);
  return `${instrument.id}@${instrument.key}@${instrument.volume}@${instrument.pan}@${effectTags}`;
};

/**
 * Get the unique tag of a given Instrument effect.
 * @param effect The Instrument effect object.
 * @returns Unique tag string. If the effect is invalid, return the error tag.
 */
export const getInstrumentEffectTag = (effect: Partial<SafeEffect>) => {
  if (!effect) return "invalid-effect";
  let tag = "";
  for (const [key, value] of Object.entries(effect)) {
    tag += `${key}@${value}`;
  }
  return tag;
};
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
