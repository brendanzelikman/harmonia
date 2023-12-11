import categories from "assets/instruments/categories.json";
import samples from "assets/instruments/samples.json";
import { SafeEffect } from "./InstrumentEffectTypes";
import { nanoid } from "@reduxjs/toolkit";
import {
  DEFAULT_INSTRUMENT_KEY,
  DEFAULT_PAN,
  DEFAULT_VOLUME,
  MAX_PAN,
  MAX_VOLUME,
  MIN_PAN,
  MIN_VOLUME,
} from "utils/constants";
import { PatternMidiNote } from "types/Pattern";
import { NormalState, createNormalState } from "utils/normalizedState";
import { Pan, Tick, Volume } from "types/units";
import { isArray, isBoolean, isPlainObject, isString } from "lodash";
import { isBoundedNumber } from "types/util";
export * from "./InstrumentEffectTypes";

// ------------------------------------------------------------
// Instrument Generics
// ------------------------------------------------------------

export type InstrumentId = string;
export type InstrumentNoId = Omit<Instrument, "id">;
export type InstrumentNoteRecord = Record<InstrumentId, PatternMidiNote[]>;
export type InstrumentNotesByTicks = Record<Tick, InstrumentNoteRecord>;
export type InstrumentKey = keyof typeof samples;
export type InstrumentCategory = keyof typeof categories;
export type InstrumentName = (typeof INSTRUMENT_NAMES)[number];
export type InstrumentMap = Record<InstrumentId, Instrument>;
export type InstrumentState = NormalState<InstrumentMap>;

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

/** Create an instrument with a unique ID. */
export const initializeInstrument = (
  instrument: Partial<InstrumentNoId> = defaultInstrument
): Instrument => ({ ...defaultInstrument, ...instrument, id: nanoid() });

/** The default instrument is used for initialization. */
export const defaultInstrument: Instrument = {
  id: "default-instrument",
  key: DEFAULT_INSTRUMENT_KEY,
  volume: DEFAULT_VOLUME,
  pan: DEFAULT_PAN,
  mute: false,
  solo: false,
  effects: [],
};

/** The default instrument state is used for Redux. */
export const defaultInstrumentState = createNormalState<InstrumentMap>([
  defaultInstrument,
]);

/** The global list of instrument keys (e.g. "grand_piano"). */
export const INSTRUMENT_KEYS = Object.keys(samples) as InstrumentKey[];

/** The global list of instrument categories (e.g. "keyboards"). */
export const INSTRUMENT_CATEGORIES = Object.keys(
  categories
) as InstrumentCategory[];

/** The global list of instrument names (e.g. "Acoustic Grand Piano"). */
export const INSTRUMENT_NAMES = Object.values(categories).reduce((acc, cur) => {
  return [...acc, ...cur.map((_) => _.name)];
}, [] as string[]);

// ------------------------------------------------------------
// Instrument Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Instrument`. */
export const isInstrument = (obj: unknown): obj is Instrument => {
  const candidate = obj as Instrument;
  return (
    isPlainObject(candidate) &&
    isString(candidate.id) &&
    isString(candidate.key) &&
    isBoundedNumber(candidate.volume, MIN_VOLUME, MAX_VOLUME) &&
    isBoundedNumber(candidate.pan, MIN_PAN, MAX_PAN) &&
    isBoolean(candidate.mute) &&
    isBoolean(candidate.solo) &&
    isArray(candidate.effects) &&
    candidate.effects.every(isPlainObject)
  );
};
