import { Pattern, PatternId } from "types";

// Chords
import * as BasicChords from "./chords-basic";
import * as SeventhChords from "./chords-seventh";
import * as ExtendedChords from "./chords-extended";
import * as FamousChords from "./chords-famous";

export * as BasicChords from "./chords-basic";
export * as SeventhChords from "./chords-seventh";
export * as ExtendedChords from "./chords-extended";
export * as FamousChords from "./chords-famous";

// Melodies
import * as BasicMelodies from "./melodies-basic";
import * as ExtendedMelodies from "./melodies-extended";
import * as FamousMelodies from "./melodies-famous";

export * as BasicMelodies from "./melodies-basic";
export * as ExtendedMelodies from "./melodies-extended";
export * as FamousMelodies from "./melodies-famous";

// Durations
import * as StraightDurations from "./durations-straight";
import * as DottedDurations from "./durations-dotted";
import * as TripletDurations from "./durations-triplet";

export * as StraightDurations from "./durations-straight";
export * as DottedDurations from "./durations-dotted";
export * as TripletDurations from "./durations-triplet";

// Rhythms
import * as SimpleRhythms from "./rhythms-simple";
import * as LatinRhythms from "./rhythms-latin";
import * as ClavePatterns from "./rhythms-clave";
import * as BellPatterns from "./rhythms-bell";

export * as SimpleRhythms from "./rhythms-simple";
export * as LatinRhythms from "./rhythms-latin";
export * as ClavePatterns from "./rhythms-clave";
export * as BellPatterns from "./rhythms-bell";

const Chords = {
  "Basic Chords": Object.values(BasicChords),
  "Seventh Chords": Object.values(SeventhChords),
  "Extended Chords": Object.values(ExtendedChords),
  "Famous Chords": Object.values(FamousChords),
};
const Melodies = {
  "Basic Melodies": Object.values(BasicMelodies),
  "Extended Melodies": Object.values(ExtendedMelodies),
  "Famous Melodies": Object.values(FamousMelodies),
};
const Durations = {
  "Straight Durations": Object.values(StraightDurations),
  "Dotted Durations": Object.values(DottedDurations),
  "Triplet Durations": Object.values(TripletDurations),
};
const Rhythms = {
  "Simple Rhythms": Object.values(SimpleRhythms),
  "Latin Rhythms": Object.values(LatinRhythms),
  "Clave Patterns": Object.values(ClavePatterns),
  "Bell Patterns": Object.values(BellPatterns),
};
const CustomPatterns = {
  "Custom Patterns": [] as Pattern[],
};

// Return a map of pattern group name to pattern group
// e.g. {"Basic Chords": [Major Chord, Minor Chord, ...], ...}
export const PresetPatternGroupMap = {
  ...CustomPatterns,
  ...Chords,
  ...Melodies,
  ...Durations,
  ...Rhythms,
};
export type PatternGroupMap = typeof PresetPatternGroupMap;
export type PatternGroupKey = keyof PatternGroupMap;
export type PatternGroupList = PatternGroupKey[];

// Return a list of all preset pattern groups
// e.g. ["Basic Chords", "Seventh Chords", ...]
export const PresetPatternGroupList = Object.keys(
  PresetPatternGroupMap
) as PatternGroupList;

// Return a list of all preset patterns
// e.g.["Major Chord", "Minor Chord", ...]
export const PresetPatternList = Object.values(PresetPatternGroupMap).flat();

// Return a map of preset pattern id to preset pattern
// e.g. {"Major Chord": Major Chord, "Minor Chord": Minor Chord, ...}
export const PresetPatternMap = PresetPatternList.reduce(
  (acc, preset) => ({ ...acc, [preset.id]: preset }),
  {} as Record<PatternId, Pattern>
);
