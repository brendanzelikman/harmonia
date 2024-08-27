import { Pattern } from "types/Pattern/PatternTypes";

// Chords
import BasicIntervals from "./chords_intervals";
import BasicChords from "./chords_basic";
import MajorChords from "./chords_major";
import MinorChords from "./chords_minor";
import MajorSeventhChords from "./chords_major_seventh";
import MinorSeventhChords from "./chords_minor_seventh";
import DominantChords from "./chords_dominant";
import SuspendedChords from "./chords_suspended";
import FamousChords from "./chords_famous";

// Durations
import StraightDurations from "./durations_straight";
import DottedDurations from "./durations_dotted";
import TripletDurations from "./durations_triplet";

// Rhythms
import SimpleRhythms from "./rhythms_simple";
import LatinRhythms from "./rhythms_latin";
import ClavePatterns from "./rhythms_clave";
import BellPatterns from "./rhythms_bell";
import { createDictionary } from "utils/objects";

export const Chords = {
  "Basic Intervals": Object.values(BasicIntervals),
  "Basic Chords": Object.values(BasicChords),
  "Major Chords": Object.values(MajorChords),
  "Minor Chords": Object.values(MinorChords),
  "Major Seventh Chords": Object.values(MajorSeventhChords),
  "Minor Seventh Chords": Object.values(MinorSeventhChords),
  "Dominant Chords": Object.values(DominantChords),
  "Suspended Chords": Object.values(SuspendedChords),
  "Famous Chords": Object.values(FamousChords),
};
export const Durations = {
  "Straight Durations": Object.values(StraightDurations),
  "Dotted Durations": Object.values(DottedDurations),
  "Triplet Durations": Object.values(TripletDurations),
};
export const Rhythms = {
  "Simple Rhythms": Object.values(SimpleRhythms),
  "Latin Rhythms": Object.values(LatinRhythms),
  "Clave Patterns": Object.values(ClavePatterns),
  "Bell Patterns": Object.values(BellPatterns),
};
export const CustomPatterns = {
  "Custom Patterns": [] as Pattern[],
};

// Return a map of pattern group name to pattern group
// e.g. {"Basic Chords": [Major Chord, Minor Chord, ...], ...}
export const PresetPatternGroupMap = {
  ...CustomPatterns,
  ...Chords,
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
export const PresetPatternMap = createDictionary<Pattern>(PresetPatternList);
