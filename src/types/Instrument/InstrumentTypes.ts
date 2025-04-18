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
import { createId, isObject, isString } from "types/utils";
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
export type InstrumentState = EntityState<Instrument, InstrumentId>;

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
export const INSTRUMENT_SET = new Set(INSTRUMENT_KEYS);

/** The global list of instrument categories (e.g. "keyboards"). */
export const INSTRUMENT_CATEGORIES = Object.keys(categories).slice(
  0,
  -1
) as InstrumentCategory[];

export const KEYBOARD_CATEGORIES: InstrumentCategory[] = [
  "Grand Piano",
  "Electric Piano",
  "Organ",
  "Caveman Synths",
];

export const STRING_CATEGORIES: InstrumentCategory[] = [
  "Violin",
  "Viola",
  "Cello",
  "Double Bass",
  "Harp",
  "Guitar",
  "Bass Guitar",
];

export const WOODWIND_CATEGORIES: InstrumentCategory[] = [
  "Piccolo",
  "Flute",
  "Oboe",
  "Clarinet",
  "Bassoon",
];

export const BRASS_CATEGORIES: InstrumentCategory[] = [
  "Trumpet",
  "Horn",
  "Saxophone",
  "Trombone",
  "Tuba",
  "Bagpipes",
];

export const MALLET_CATEGORIES: InstrumentCategory[] = [
  "Xylophone",
  "Marimba",
  "Glockenspiel",
  "Bells",
  "Triangle",
  "Wood",
  "Metal",
];

export const PERCUSSION_CATEGORIES: InstrumentCategory[] = [
  "Bass Drum",
  "Tenor Drum",
  "Snare Drum",
  "Timpani",
  "Cymbals",
];

export const DRUM_CATEGORIES: InstrumentCategory[] = [
  "Kicks",
  "Hyperkicks",
  "Trvth Drumkit",
  "909 Drumkit",
];

export const LOOP_CATEGORIES: InstrumentCategory[] = [
  "Amen Breaks",
  "Duggi Loops",
  "Hip Hop Drums",
  "EDM Drums",
];

export const SOUND_CATEGORIES: InstrumentCategory[] = [
  "Death Metal Vocals",
  "Animal Sounds",
  "Sound Effects",
  "Samples",
];

export const instrumentCategoryTypeMap = {
  keyboards: KEYBOARD_CATEGORIES,
  strings: STRING_CATEGORIES,
  woodwinds: WOODWIND_CATEGORIES,
  brass: BRASS_CATEGORIES,
  mallets: MALLET_CATEGORIES,
  percussion: PERCUSSION_CATEGORIES,
  drumkits: DRUM_CATEGORIES,
  loops: LOOP_CATEGORIES,
  sounds: SOUND_CATEGORIES,
} as const;

export const instrumentCategories = Object.keys(
  instrumentCategoryTypeMap
) as InstrumentCategoryType[];

export type InstrumentCategoryType = keyof typeof instrumentCategoryTypeMap;

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

/** The global record of instrument keys to category types */
export const INSTRUMENT_CATEGORY_TYPES_BY_KEY = INSTRUMENT_KEYS.reduce(
  (acc, cur) => {
    const category = INSTRUMENT_CATEGORIES_BY_KEY[cur];
    const type = instrumentCategories.find((_) =>
      instrumentCategoryTypeMap[_].includes(category)
    );
    return { ...acc, [cur]: type };
  },
  {} as Record<InstrumentKey, InstrumentCategoryType>
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
    isObject(candidate) && isString(candidate.id) && isString(candidate.key)
  );
};
