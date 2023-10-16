import categories from "assets/instruments/categories.json";
import samples from "assets/instruments/samples.json";
import { SafeEffect } from "./InstrumentEffectTypes";
import { nanoid } from "@reduxjs/toolkit";
import { DEFAULT_PAN, DEFAULT_VOLUME } from "utils/constants";
import { PatternChord } from "types/Pattern";
export * from "./InstrumentEffectTypes";

/**
 * The instrument key, corresponding to the samples.json file.
 * @example "acoustic_grand_piano"
 */
export type InstrumentKey = keyof typeof samples;
export const INSTRUMENT_KEYS = Object.keys(samples) as InstrumentKey[];

/**
 * The instrument category, corresponding to the categories.json file.
 * @example "keyboards"
 */
export type InstrumentCategory = keyof typeof categories;
export const INSTRUMENT_CATEGORIES = Object.keys(
  categories
) as InstrumentCategory[];

/**
 * The instrument name, derived from the categories.json file.
 * @example "Acoustic Grand Piano"
 */
export const INSTRUMENT_NAMES = Object.values(categories).reduce((acc, cur) => {
  return [...acc, ...cur.map((_) => _.name)];
}, [] as string[]);
export type InstrumentName = (typeof INSTRUMENT_NAMES)[number];

/**
 * The categorized instrument contains its key and name
 * @property key - The instrument key.
 * @property name - The instrument name.
 */
export interface CategorizedInstrument {
  key: InstrumentKey;
  name: InstrumentName;
}

export type InstrumentId = string;
export type InstrumentNoId = Omit<Instrument, "id">;
export type InstrumentChordRecord = Record<InstrumentId, PatternChord>;

/**
 * An `Instrument` is a Redux-friendly representation of a Tone.js instrument.
 * @property `id` - The ID of the instrument.
 * @property `key` - The key of the instrument.
 * @property `volume` - The volume value.
 * @property `pan` - The pan value.
 * @property `mute` - The mute value.
 * @property `solo` - The solo value.
 * @property `effects` - A list of Redux-safe effects.
 *
 */
export interface Instrument {
  id: InstrumentId;
  key: InstrumentKey;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
  effects: SafeEffect[];
}

/**
 * Initializes an `Instrument` with a unique ID.
 * @param instrument - Optional. `Partial<Instrument>` to override default values.
 * @returns An initialized `Instrument` with a unique ID.
 */
export const initializeInstrument = (
  instrument: Partial<InstrumentNoId> = defaultInstrument
): Instrument => ({ ...defaultInstrument, ...instrument, id: nanoid() });

export const defaultInstrument: Instrument = {
  id: "default-instrument",
  key: "grand_piano",
  volume: DEFAULT_VOLUME,
  pan: DEFAULT_PAN,
  mute: false,
  solo: false,
  effects: [],
};

/**
 * Checks if a given object is of type `Instrument`.
 * @param obj The object to check.
 * @returns True if the object is a `Instrument`, otherwise false.
 */
export const isInstrument = (obj: unknown): obj is Instrument => {
  const candidate = obj as Instrument;
  return (
    candidate?.id !== undefined &&
    candidate?.key !== undefined &&
    candidate?.volume !== undefined &&
    candidate?.pan !== undefined &&
    candidate?.mute !== undefined &&
    candidate?.solo !== undefined &&
    candidate?.effects !== undefined
  );
};
