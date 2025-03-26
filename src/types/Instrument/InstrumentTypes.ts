import categories from "assets/instruments/categories.json";
import samples from "assets/instruments/samples.json";
import { SafeEffect } from "./InstrumentEffectTypes";
import { EntityState, nanoid } from "@reduxjs/toolkit";
import {
  DEFAULT_INSTRUMENT_KEY,
  DEFAULT_PAN,
  DEFAULT_VOLUME,
} from "utils/constants";
import { Pan, Tick, Volume } from "types/units";
import { createId } from "types/util";
import { isPlainObject, isString } from "lodash";
import { PatternMidiNote } from "types/Pattern/PatternTypes";
import { TrackId } from "types/Track/TrackTypes";
import {
  getInstrumentCategory,
  getInstrumentName,
} from "./InstrumentFunctions";
export * from "./InstrumentEffectTypes";

// ------------------------------------------------------------
// Instrument Generics
// ------------------------------------------------------------

export type InstrumentId = string;
export type InstrumentNoId = Omit<Instrument, "id">;
export type InstrumentNoteRecord = Record<InstrumentId, PatternMidiNote[]>;
export type InstrumentNotesByTicks = Record<Tick, InstrumentNoteRecord>;
export type InstrumentKey = keyof typeof samples & (string & {});
export type InstrumentCategory = keyof typeof categories | "Samples";
export type InstrumentName = (typeof INSTRUMENT_NAMES)[number];
export type InstrumentMap = Record<InstrumentId, Instrument>;
export type InstrumentState = EntityState<Instrument>;

// ------------------------------------------------------------
// Instrument Definitions
// ------------------------------------------------------------

/** A `CategorizedInstrument` contains a key and a name. */
export type CategorizedInstrument = {
  key: InstrumentKey;
  name: InstrumentName;
};

/** An `Instrument` is a Redux-friendly representation of a Tone.js instrument. */
export interface Instrument {
  id: InstrumentId;
  trackId: TrackId;
  key: InstrumentKey;
  volume: Volume;
  pan: Pan;
  mute: boolean;
  solo: boolean;
  effects: SafeEffect[];
}

// ------------------------------------------------------------
// Instrument Initialization
// ------------------------------------------------------------

/**
 * Create an instrument with a unique ID.
 * If `oldEffects` is true, the effects will inherit the old IDs.
 *  */
export const initializeInstrument = (
  instrument: Partial<InstrumentNoId> = defaultInstrument,
  oldEffects = true
): Instrument => {
  const effects = instrument.effects ?? defaultInstrument.effects;
  return {
    ...defaultInstrument,
    ...instrument,
    effects: oldEffects
      ? effects
      : effects.map((_) => ({ ..._, id: nanoid() })),
    id: nanoid(),
  };
};

/** The default instrument is used for initialization. */
export const defaultInstrument: Instrument = {
  id: "default-instrument",
  trackId: createId("pattern-track"),
  key: DEFAULT_INSTRUMENT_KEY,
  volume: DEFAULT_VOLUME,
  pan: DEFAULT_PAN,
  mute: false,
  solo: false,
  effects: [],
};

/** The global list of instrument keys (e.g. "grand_piano"). */
export const INSTRUMENT_KEYS = Object.keys(samples) as InstrumentKey[];

/** The global list of instrument categories (e.g. "keyboards"). */
export const INSTRUMENT_CATEGORIES = Object.keys(categories).slice(
  0,
  -1
) as InstrumentCategory[];

export const MELODIC_CATEGORIES: InstrumentCategory[] = [
  "Keyboards",
  "Guitars",
  "Strings",
  "Woodwinds",
  "Brass",
  "Mallets",
  "Death Metal Vocals",
  "Animal Sounds",
  "Miscellaneous Sounds",
];

export const PERCUSSIVE_CATEGORIES: InstrumentCategory[] = [
  "Kick Drums",
  "Snare Drums",
  "Tenor Drums",
  "Cymbals",
  "Bells",
  "Wood Percussion",
  "Metal Percussion",
  "Trvth Drumkit",
  "Amen Breaks",
];

/** The global list of instrument names (e.g. "Acoustic Grand Piano"). */
export const INSTRUMENT_NAMES = Object.values(categories).reduce((acc, cur) => {
  return [...acc, ...cur.map((_) => _.name)];
}, [] as string[]);

/** The global record of instrument keys to names */
export const INSTRUMENT_NAMES_BY_KEY = INSTRUMENT_KEYS.reduce(
  (acc, cur) => ({ ...acc, [cur]: getInstrumentName(cur) }),
  {} as Record<InstrumentKey, InstrumentName>
);

/** The global record of instrument keys to categories */
export const INSTRUMENT_CATEGORIES_BY_KEY = INSTRUMENT_KEYS.reduce(
  (acc, cur) => ({ ...acc, [cur]: getInstrumentCategory(cur) }),
  {} as Record<InstrumentKey, InstrumentCategory>
);

export const defaultInstrumentState: InstrumentState = {
  ids: [],
  entities: {},
};

// ------------------------------------------------------------
// Instrument Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Instrument`. */
export const isInstrument = (obj: unknown): obj is Instrument => {
  const candidate = obj as Instrument;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isString(candidate.key)
  );
};
