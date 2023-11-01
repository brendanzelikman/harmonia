import { Pattern, PatternId, PatternMap } from "types/Pattern";

// Chords
import BasicChords from "./1-BasicChords";
import SeventhChords from "./1-SeventhChords";
import ExtendedChords from "./1-ExtendedChords";
import FamousChords from "./1-FamousChords";

export * as BasicChords from "./1-BasicChords";
export * as SeventhChords from "./1-SeventhChords";
export * as ExtendedChords from "./1-ExtendedChords";
export * as FamousChords from "./1-FamousChords";

// Melodies
import BasicMelodies from "./2-BasicMelodies";
import ExtendedMelodies from "./2-ExtendedMelodies";
import FamousMelodies from "./2-FamousMelodies";

export * as BasicMelodies from "./2-BasicMelodies";
export * as ExtendedMelodies from "./2-ExtendedMelodies";
export * as FamousMelodies from "./2-FamousMelodies";

// Durations
import StraightDurations from "./3-StraightDurations";
import DottedDurations from "./3-DottedDurations";
import TripletDurations from "./3-TripletDurations";

export * as StraightDurations from "./3-StraightDurations";
export * as DottedDurations from "./3-DottedDurations";
export * as TripletDurations from "./3-TripletDurations";

// Rhythms
import SimpleRhythms from "./4-SimpleRhythms";
import LatinRhythms from "./4-LatinRhythms";
import ClavePatterns from "./4-ClaveRhythms";
import BellPatterns from "./4-BellRhythms";
import { createMap } from "utils/objects";

export * as SimpleRhythms from "./4-SimpleRhythms";
export * as LatinRhythms from "./4-LatinRhythms";
export * as ClavePatterns from "./4-ClaveRhythms";
export * as BellPatterns from "./4-BellRhythms";

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
export const PresetPatternMap = createMap<PatternMap>(PresetPatternList);
