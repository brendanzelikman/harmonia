import { MIDI } from "types/midi";
import { Subdivision as ToneSubdivision } from "tone/build/esm/core/type/Units";
import { Duration, Subdivision, Tick } from "types/units";

// Map all subdivisions to the respective ticks
const ticksBySubdivision: Record<Subdivision, Tick> = {
  "1/64": MIDI.SixtyFourthNoteTicks,
  "1/32": MIDI.ThirtySecondNoteTicks,
  "1/16": MIDI.SixteenthNoteTicks,
  "1/8": MIDI.EighthNoteTicks,
  "1/4": MIDI.QuarterNoteTicks,
  "1/2": MIDI.HalfNoteTicks,
  "1/1": MIDI.WholeNoteTicks,
};
export const subdivisionToTicks = (subdivision: Subdivision = "1/16"): Tick => {
  return ticksBySubdivision[subdivision] || MIDI.QuarterNoteTicks;
};

// Map all subdivisions to the respective values
const valuesBySubdivision: Record<Subdivision, number> = {
  "1/64": 64,
  "1/32": 32,
  "1/16": 16,
  "1/8": 8,
  "1/4": 4,
  "1/2": 2,
  "1/1": 1,
};
export const subdivisionToValue = (subdivision: Subdivision = "1/16") => {
  return valuesBySubdivision[subdivision] || 4;
};

// Map all ticks to the respective Tone.js subdivisions
export const toneSubdivisionsByTick: Record<Tick, ToneSubdivision> = {
  [MIDI.WholeNoteTicks]: "1n",
  [MIDI.DottedWholeNoteTicks]: "1n.",

  [MIDI.HalfNoteTicks]: "2n",
  [MIDI.DottedHalfNoteTicks]: "2n.",
  [MIDI.TripletHalfNoteTicks]: "2t",

  [MIDI.QuarterNoteTicks]: "4n",
  [MIDI.DottedQuarterNoteTicks]: "4n.",
  [MIDI.TripletQuarterNoteTicks]: "4t",

  [MIDI.EighthNoteTicks]: "8n",
  [MIDI.DottedEighthNoteTicks]: "8n.",
  [MIDI.TripletEighthNoteTicks]: "8t",

  [MIDI.SixteenthNoteTicks]: "16n",
  [MIDI.DottedSixteenthNoteTicks]: "16n.",
  [MIDI.TripletSixteenthNoteTicks]: "16t",

  [MIDI.ThirtySecondNoteTicks]: "32n",
  [MIDI.DottedThirtySecondNoteTicks]: "32n.",
  [MIDI.TripletThirtySecondNoteTicks]: "32t",

  [MIDI.SixtyFourthNoteTicks]: "64n",
  [MIDI.DottedSixtyFourthNoteTicks]: "64n.",
  [MIDI.TripletSixtyFourthNoteTicks]: "64t",
};
export const ticksToToneSubdivision = (beats: number) => {
  return toneSubdivisionsByTick[beats] || "4n";
};

// Convert ticks to the number of columns
export const ticksToColumns = (
  ticks: Tick,
  subdivision: Subdivision = "1/16"
) => {
  const ticksPerSubdivision = subdivisionToTicks(subdivision);
  return ticks / ticksPerSubdivision;
};

// Convert note duration to number of beats
interface NoteOption {
  dotted?: boolean;
  triplet?: boolean;
}

// Convert a note duration to the number of ticks
export const durationToTicks = (
  duration: Duration,
  options: NoteOption = { dotted: false, triplet: false }
) => {
  const dotted = !!options.dotted;
  const triplet = !!options.triplet;

  switch (duration) {
    case "64th":
      return triplet
        ? MIDI.TripletSixtyFourthNoteTicks
        : dotted
        ? MIDI.DottedSixtyFourthNoteTicks
        : MIDI.SixtyFourthNoteTicks;

    case "32nd":
      return triplet
        ? MIDI.TripletThirtySecondNoteTicks
        : dotted
        ? MIDI.DottedThirtySecondNoteTicks
        : MIDI.ThirtySecondNoteTicks;

    case "16th":
      return triplet
        ? MIDI.TripletSixteenthNoteTicks
        : dotted
        ? MIDI.DottedSixteenthNoteTicks
        : MIDI.SixteenthNoteTicks;

    case "eighth":
      return triplet
        ? MIDI.TripletEighthNoteTicks
        : dotted
        ? MIDI.DottedEighthNoteTicks
        : MIDI.EighthNoteTicks;

    case "quarter":
      return triplet
        ? MIDI.TripletQuarterNoteTicks
        : dotted
        ? MIDI.DottedQuarterNoteTicks
        : MIDI.QuarterNoteTicks;

    case "half":
      return triplet
        ? MIDI.TripletHalfNoteTicks
        : dotted
        ? MIDI.DottedHalfNoteTicks
        : MIDI.HalfNoteTicks;

    case "whole":
      return triplet
        ? MIDI.TripletWholeNoteTicks
        : dotted
        ? MIDI.DottedWholeNoteTicks
        : MIDI.WholeNoteTicks;

    default:
      return 1;
  }
};

// Convert number of ticks to note duration
export const ticksToDuration = (ticks: Tick) => {
  const sixtyFourthNotes = [
    MIDI.SixtyFourthNoteTicks,
    MIDI.DottedSixtyFourthNoteTicks,
    MIDI.TripletSixtyFourthNoteTicks,
  ];
  if (sixtyFourthNotes.includes(ticks)) return "64th";

  const thirtySecondNotes = [
    MIDI.ThirtySecondNoteTicks,
    MIDI.DottedThirtySecondNoteTicks,
    MIDI.TripletThirtySecondNoteTicks,
  ];
  if (thirtySecondNotes.includes(ticks)) return "32nd";

  const sixteenthNotes = [
    MIDI.SixteenthNoteTicks,
    MIDI.DottedSixteenthNoteTicks,
    MIDI.TripletSixteenthNoteTicks,
  ];
  if (sixteenthNotes.includes(ticks)) return "16th";

  const eighthNotes = [
    MIDI.EighthNoteTicks,
    MIDI.DottedEighthNoteTicks,
    MIDI.TripletEighthNoteTicks,
  ];
  if (eighthNotes.includes(ticks)) return "eighth";

  const quarterNotes = [
    MIDI.QuarterNoteTicks,
    MIDI.DottedQuarterNoteTicks,
    MIDI.TripletQuarterNoteTicks,
  ];
  if (quarterNotes.includes(ticks)) return "quarter";

  const halfNotes = [
    MIDI.HalfNoteTicks,
    MIDI.DottedHalfNoteTicks,
    MIDI.TripletHalfNoteTicks,
  ];
  if (halfNotes.includes(ticks)) return "half";

  const wholeNotes = [
    MIDI.WholeNoteTicks,
    MIDI.DottedWholeNoteTicks,
    MIDI.TripletWholeNoteTicks,
  ];
  if (wholeNotes.includes(ticks)) return "whole";

  return "quarter";
};
