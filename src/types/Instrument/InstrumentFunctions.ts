import samples from "assets/instruments/samples.json";
import categories from "assets/instruments/categories.json";
import { SafeEffect } from "./InstrumentEffectTypes";
import {
  defaultInstrument,
  InstrumentKey,
  InstrumentCategory,
  INSTRUMENT_CATEGORIES,
  InstrumentName,
  CategorizedInstrument,
  Instrument,
} from "./InstrumentTypes";
import { SamplerOptions } from "tone";

// ------------------------------------------------------------
// Instrument Serializers
// ------------------------------------------------------------

/** Get an `InstrumentEffect` as a string. */
export const getInstrumentEffectAsString = (effect: Partial<SafeEffect>) => {
  if (!effect) return "invalid-effect";
  let tag = "";
  for (const [key, value] of Object.entries(effect)) {
    tag += `${key}@${value}`;
  }
  return tag;
};

/** Get an `Instrument` as a string. */
export const getInstrumentAsString = (instrument: Partial<Instrument>) => {
  if (!instrument) return "invalid-instrument";
  const effectTags = instrument.effects?.map(getInstrumentEffectAsString);
  return `${instrument.id}@${instrument.key}@${instrument.volume}@${instrument.pan}@${effectTags}`;
};

// ------------------------------------------------------------
// Property Getters
// ------------------------------------------------------------

/** Unpack the channel of an instrument. */
export const getInstrumentChannel = (instrument?: Instrument) => {
  return {
    volume: instrument?.volume || defaultInstrument.volume,
    pan: instrument?.pan || defaultInstrument.pan,
    mute: instrument?.mute || defaultInstrument.mute,
    solo: instrument?.solo || defaultInstrument.solo,
  };
};

/** Get the category of an instrument by key. */
export const getInstrumentCategory = (
  key?: InstrumentKey
): InstrumentCategory => {
  const category = INSTRUMENT_CATEGORIES.find((category) =>
    categories[category].some((instrument) => instrument.key === key)
  );
  return category || "Keyboards";
};

/** Get the name of an instrument by key. */
export const getInstrumentName = (key?: InstrumentKey): InstrumentName => {
  const category = getInstrumentCategory(key);
  if (!category) return "Unknown Instrument";
  const match = categories[category].find((name) => name.key === key);
  return match?.name ?? "Unknown Instrument";
};

/** Get the sample map of an instrument by key. */
export const getInstrumentSamplesMap = (
  key: InstrumentKey
): SamplerOptions["urls"] => {
  return samples[key] ?? {};
};

/** Get the base URL of an instrument's samples by key. */
export const getInstrumentSamplesBaseUrl = (key: InstrumentKey) => {
  const category = getInstrumentCategory(key);
  const name = getInstrumentName(key);
  const baseUrl = `${import.meta.env.BASE_URL}samples/${category}/${name}/`;
  return baseUrl;
};

/** Get a list of instruments corresponding to the given category. */
export const getCategoryInstruments = (category: InstrumentCategory) =>
  categories[category] as CategorizedInstrument[];
