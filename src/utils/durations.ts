import { BPM, Seconds, Tick, Timed, Velocity } from "types/units";
import { MidiNote, MidiValue } from "./midi";
import { getDictValues, findEntry } from "./objects";
import sixteenthNote from "assets/noteheads/16th.png";
import thirtysecondNote from "assets/noteheads/32nd.png";
import sixtyfourthNote from "assets/noteheads/64th.png";
import eighthNote from "assets/noteheads/eighth.png";
import halfNote from "assets/noteheads/half.png";
import quarterNote from "assets/noteheads/quarter.png";
import wholeNote from "assets/noteheads/whole.png";
import { PoseVector } from "types/Pose/PoseTypes";

// ------------------------------------------------------------
// Global Pulse
// ------------------------------------------------------------

/** Pulses Per Quarter Note */
export const PPQ = 96;

/** Convert ticks to seconds using the PPQ and BPM. */
export const ticksToSeconds = (ticks: Tick, bpm: BPM): Seconds => {
  return (60 / bpm) * (ticks / PPQ);
};

/** Convert seconds to ticks using the PPQ and BPM. */
export const secondsToTicks = (seconds: Seconds, bpm: BPM): Tick => {
  return Math.round((seconds * bpm * PPQ) / 60);
};

// ------------------------------------------------------------
// Note/Rest Factories
// ------------------------------------------------------------

/** Create a MIDI note using the name of a note duration. */
export const createNoteFromDuration = (
  MIDI: MidiValue = 60,
  velocity: Velocity = 100,
  duration: DurationType = "quarter"
) => {
  return { MIDI, velocity, duration: DURATION_TICKS[duration] };
};

/** Create a MIDI note factory for a specific note duration. */
export const createNoteFactory = (duration: DurationType) => {
  return (MIDI: MidiValue = 60, velocity: Velocity = 100) => {
    return createNoteFromDuration(MIDI, velocity, duration);
  };
};

/** Create a rest note using the name of a note duration. */
export const createRestFromDuration = (duration: DurationType) => ({
  duration: DURATION_TICKS[duration],
});

/** Create a rest note factory for a specific note duration. */
export const createRestFactory = (duration: DurationType) => {
  return () => createRestFromDuration(duration);
};

// ------------------------------------------------------------
// Vector Factories
// ------------------------------------------------------------

/** Create a pose vector module using the name of a note duration. */
export const createVectorModuleFromDuration = (
  vector: PoseVector = {},
  duration: DurationType = "quarter"
) => {
  return { vector, duration: DURATION_TICKS[duration] };
};

/** Create a vector module factory for a specific note duration. */
export const createVectorModuleFactory = (duration: DurationType) => {
  return (vector: PoseVector = {}) => {
    return createVectorModuleFromDuration(vector, duration);
  };
};

// ------------------------------------------------------------
// Straight Notes
// ------------------------------------------------------------

/** A straight duration can be anywhere between a whole note and a 64th note. */
export type StraightDurationType =
  | "whole"
  | "half"
  | "quarter"
  | "eighth"
  | "16th"
  | "32nd"
  | "64th";

/** A list of straight note durations. */
export const STRAIGHT_DURATION_TYPES: StraightDurationType[] = [
  "whole",
  "half",
  "quarter",
  "eighth",
  "16th",
  "32nd",
  "64th",
];

/** A record of ticks by note duration. */
export const STRAIGHT_DURATION_TICKS: Record<StraightDurationType, Tick> = {
  whole: PPQ * 4,
  half: PPQ * 2,
  quarter: PPQ,
  eighth: PPQ / 2,
  "16th": PPQ / 4,
  "32nd": PPQ / 8,
  "64th": PPQ / 16,
} as const;

/** A record of note names by note duration. */
export const STRAIGHT_DURATION_NAMES: Record<StraightDurationType, string> = {
  whole: "Whole Note",
  half: "Half Note",
  quarter: "Quarter Note",
  eighth: "Eighth Note",
  "16th": "Sixteenth Note",
  "32nd": "Thirty-Second Note",
  "64th": "Sixty-Fourth Note",
} as const;

/** A record of subdivisions by note duration. */
export const STRAIGHT_DURATION_SUBDIVISIONS = {
  whole: "1n",
  half: "2n",
  quarter: "4n",
  eighth: "8n",
  "16th": "16n",
  "32nd": "32n",
  "64th": "64n",
} as const;
export type StraightSubdivision =
  (typeof STRAIGHT_DURATION_SUBDIVISIONS)[StraightDurationType];

// Straight Ticks
export const WholeNoteTicks = STRAIGHT_DURATION_TICKS["whole"];
export const HalfNoteTicks = STRAIGHT_DURATION_TICKS["half"];
export const QuarterNoteTicks = STRAIGHT_DURATION_TICKS["quarter"];
export const EighthNoteTicks = STRAIGHT_DURATION_TICKS["eighth"];
export const SixteenthNoteTicks = STRAIGHT_DURATION_TICKS["16th"];
export const ThirtySecondNoteTicks = STRAIGHT_DURATION_TICKS["32nd"];
export const SixtyFourthNoteTicks = STRAIGHT_DURATION_TICKS["64th"];

// Straight Notes
export const createWholeNote = createNoteFactory("whole");
export const createHalfNote = createNoteFactory("half");
export const createQuarterNote = createNoteFactory("quarter");
export const createEighthNote = createNoteFactory("eighth");
export const createSixteenthNote = createNoteFactory("16th");
export const createThirtySecondNote = createNoteFactory("32nd");
export const createSixtyFourthNote = createNoteFactory("64th");

// Straight Rests
export const createWholeRest = createRestFactory("whole");
export const createHalfRest = createRestFactory("half");
export const createQuarterRest = createRestFactory("quarter");
export const createEighthRest = createRestFactory("eighth");
export const createSixteenthRest = createRestFactory("16th");
export const createThirtySecondRest = createRestFactory("32nd");
export const createSixtyFourthRest = createRestFactory("64th");

// Straight Vectors
export const createWholeVector = createVectorModuleFactory("whole");
export const createHalfVector = createVectorModuleFactory("half");
export const createQuarterVector = createVectorModuleFactory("quarter");
export const createEighthVector = createVectorModuleFactory("eighth");
export const createSixteenthVector = createVectorModuleFactory("16th");
export const createThirtySecondVector = createVectorModuleFactory("32nd");
export const createSixtyFourthVector = createVectorModuleFactory("64th");

// ------------------------------------------------------------
// Dotted Notes
// ------------------------------------------------------------

/** A dotted duration is defined relative to a straight duration. */
export type DottedDurationType = `${StraightDurationType}-dotted`;

/** A list of dotted note durations. */
export const DOTTED_DURATION_TYPES = STRAIGHT_DURATION_TYPES.map(
  (duration) => `${duration}-dotted` as DottedDurationType
);

/** A record of ticks by dotted note duration. */
export const DOTTED_DURATION_TICKS: Record<DottedDurationType, Tick> = {
  "whole-dotted": PPQ * 6,
  "half-dotted": PPQ * 3,
  "quarter-dotted": (PPQ * 3) / 2,
  "eighth-dotted": (PPQ * 3) / 4,
  "16th-dotted": (PPQ * 3) / 8,
  "32nd-dotted": (PPQ * 3) / 16,
  "64th-dotted": (PPQ * 3) / 32,
} as const;

/** A record of note names by dotted note duration. */
export const DOTTED_DURATION_NAMES: Record<DottedDurationType, string> = {
  "whole-dotted": "Dotted Whole Note",
  "half-dotted": "Dotted Half Note",
  "quarter-dotted": "Dotted Quarter Note",
  "eighth-dotted": "Dotted Eighth Note",
  "16th-dotted": "Dotted Sixteenth Note",
  "32nd-dotted": "Dotted Thirty-Second Note",
  "64th-dotted": "Dotted Sixty-Fourth Note",
} as const;

/** A record of subdivisions by dotted note duration. */
export const DOTTED_DURATION_SUBDIVISIONS: Record<DottedDurationType, string> =
  {
    "whole-dotted": "1n.",
    "half-dotted": "2n.",
    "quarter-dotted": "4n.",
    "eighth-dotted": "8n.",
    "16th-dotted": "16n.",
    "32nd-dotted": "32n.",
    "64th-dotted": "64n.",
  } as const;
export type DottedSubdivision =
  (typeof DOTTED_DURATION_SUBDIVISIONS)[DottedDurationType];

// Dotted Ticks
export const DottedWholeNoteTicks = DOTTED_DURATION_TICKS["whole-dotted"];
export const DottedHalfNoteTicks = DOTTED_DURATION_TICKS["half-dotted"];
export const DottedQuarterNoteTicks = DOTTED_DURATION_TICKS["quarter-dotted"];
export const DottedEighthNoteTicks = DOTTED_DURATION_TICKS["eighth-dotted"];
export const DottedSixteenthNoteTicks = DOTTED_DURATION_TICKS["16th-dotted"];
export const DottedThirtySecondNoteTicks = DOTTED_DURATION_TICKS["32nd-dotted"];
export const DottedSixtyFourthNoteTicks = DOTTED_DURATION_TICKS["64th-dotted"];

// Dotted Notes
export const createDottedWholeNote = createNoteFactory("whole-dotted");
export const createDottedHalfNote = createNoteFactory("half-dotted");
export const createDottedQuarterNote = createNoteFactory("quarter-dotted");
export const createDottedEighthNote = createNoteFactory("eighth-dotted");
export const createDottedSixteenthNote = createNoteFactory("16th-dotted");
export const createDottedThirtySecondNote = createNoteFactory("32nd-dotted");
export const createDottedSixtyFourthNote = createNoteFactory("64th-dotted");

// Dotted Rests
export const createDottedWholeRest = createRestFactory("whole-dotted");
export const createDottedHalfRest = createRestFactory("half-dotted");
export const createDottedQuarterRest = createRestFactory("quarter-dotted");
export const createDottedEighthRest = createRestFactory("eighth-dotted");
export const createDottedSixteenthRest = createRestFactory("16th-dotted");
export const createDottedThirtySecondRest = () =>
  createRestFactory("32nd-dotted");
export const createDottedSixtyFourthRest = createRestFactory("64th-dotted");
export const createDottedRest = createRestFactory("quarter-dotted");

// Dotted Vectors
export const createDottedWholeVector =
  createVectorModuleFactory("whole-dotted");
export const createDottedHalfVector = createVectorModuleFactory("half-dotted");
export const createDottedQuarterVector =
  createVectorModuleFactory("quarter-dotted");
export const createDottedEighthVector =
  createVectorModuleFactory("eighth-dotted");
export const createDottedSixteenthVector =
  createVectorModuleFactory("16th-dotted");
export const createDottedThirtySecondVector =
  createVectorModuleFactory("32nd-dotted");
export const createDottedSixtyFourthVector =
  createVectorModuleFactory("64th-dotted");

// ------------------------------------------------------------
// Triplet Notes
// ------------------------------------------------------------

/** A triplet duration is defined relative to a straight duration. */
export type TripletDurationType = `${StraightDurationType}-triplet`;

/** A list of triplet note durations. */
export const TRIPLET_DURATION_TYPES = STRAIGHT_DURATION_TYPES.map(
  (duration) => `${duration}-triplet` as TripletDurationType
);

/** A record of ticks by triplet note duration. */
export const TRIPLET_DURATION_TICKS: Record<TripletDurationType, Tick> = {
  "whole-triplet": (PPQ * 8) / 3,
  "half-triplet": (PPQ * 4) / 3,
  "quarter-triplet": (PPQ * 2) / 3,
  "eighth-triplet": PPQ / 3,
  "16th-triplet": PPQ / 6,
  "32nd-triplet": PPQ / 12,
  "64th-triplet": PPQ / 24,
} as const;

/** A record of note names by triplet note duration. */
export const TRIPLET_DURATION_NAMES: Record<TripletDurationType, string> = {
  "whole-triplet": "Triplet Whole Note",
  "half-triplet": "Triplet Half Note",
  "quarter-triplet": "Triplet Quarter Note",
  "eighth-triplet": "Triplet Eighth Note",
  "16th-triplet": "Triplet Sixteenth Note",
  "32nd-triplet": "Triplet Thirty-Second Note",
  "64th-triplet": "Triplet Sixty-Fourth Note",
} as const;

/** A record of subdivisions by triplet note duration. */
export const TRIPLET_DURATION_SUBDIVISIONS: Record<
  TripletDurationType,
  string
> = {
  "whole-triplet": "1t",
  "half-triplet": "2t",
  "quarter-triplet": "4t",
  "eighth-triplet": "8t",
  "16th-triplet": "16t",
  "32nd-triplet": "32t",
  "64th-triplet": "64t",
} as const;
export type TripletSubdivision =
  (typeof TRIPLET_DURATION_SUBDIVISIONS)[TripletDurationType];

// Triplet Ticks
export const TripletWholeNoteTicks = TRIPLET_DURATION_TICKS["whole-triplet"];
export const TripletHalfNoteTicks = TRIPLET_DURATION_TICKS["half-triplet"];
export const TripletQuarterNoteTicks =
  TRIPLET_DURATION_TICKS["quarter-triplet"];
export const TripletEighthNoteTicks = TRIPLET_DURATION_TICKS["eighth-triplet"];
export const TripletSixteenthNoteTicks = TRIPLET_DURATION_TICKS["16th-triplet"];
export const TripletThirtySecondNoteTicks =
  TRIPLET_DURATION_TICKS["32nd-triplet"];
export const TripletSixtyFourthNoteTicks =
  TRIPLET_DURATION_TICKS["64th-triplet"];

// Triplet Notes
export const createTripletWholeNote = createNoteFactory("whole-triplet");
export const createTripletHalfNote = createNoteFactory("half-triplet");
export const createTripletQuarterNote = createNoteFactory("quarter-triplet");
export const createTripletEighthNote = createNoteFactory("eighth-triplet");
export const createTripletSixteenthNote = createNoteFactory("16th-triplet");
export const createTripletThirtySecondNote = createNoteFactory("32nd-triplet");
export const createTripletSixtyFourthNote = createNoteFactory("64th-triplet");

// Triplet Rests
export const createTripletWholeRest = createRestFactory("whole-triplet");
export const createTripletHalfRest = createRestFactory("half-triplet");
export const createTripletQuarterRest = createRestFactory("quarter-triplet");
export const createTripletEighthRest = createRestFactory("eighth-triplet");
export const createTripletSixteenthRest = createRestFactory("16th-triplet");
export const createTripletThirtySecondRest = createRestFactory("32nd-triplet");
export const createTripletSixtyFourthRest = createRestFactory("64th-triplet");

// Triplet Vectors
export const createTripletWholeVector =
  createVectorModuleFactory("whole-triplet");
export const createTripletHalfVector =
  createVectorModuleFactory("half-triplet");
export const createTripletQuarterVector =
  createVectorModuleFactory("quarter-triplet");
export const createTripletEighthVector =
  createVectorModuleFactory("eighth-triplet");
export const createTripletSixteenthVector =
  createVectorModuleFactory("16th-triplet");
export const createTripletThirtySecondVector =
  createVectorModuleFactory("32nd-triplet");
export const createTripletSixtyFourthVector =
  createVectorModuleFactory("64th-triplet");

// ------------------------------------------------------------
// All Notes
// ------------------------------------------------------------

/** A duration can be straight, dotted, or triplet. */
export type DurationType =
  | StraightDurationType
  | DottedDurationType
  | TripletDurationType;

/** A list of all note duration types. */
export const DURATION_TYPES = [
  ...Object.keys(STRAIGHT_DURATION_TICKS),
  ...Object.keys(DOTTED_DURATION_TICKS),
  ...Object.keys(TRIPLET_DURATION_TICKS),
] as DurationType[];

/** A record of ticks by note duration. */
export const DURATION_TICKS: Record<DurationType, Tick> = {
  ...STRAIGHT_DURATION_TICKS,
  ...DOTTED_DURATION_TICKS,
  ...TRIPLET_DURATION_TICKS,
} as const;

/** A record of note names by note duration. */
export const DURATION_NAMES: Record<DurationType, string> = {
  ...STRAIGHT_DURATION_NAMES,
  ...DOTTED_DURATION_NAMES,
  ...TRIPLET_DURATION_NAMES,
} as const;
export type DurationName = (typeof DURATION_NAMES)[DurationType];

/** A subdivision can be straight, dotted, or triplet. */
export type Subdivision =
  | StraightSubdivision
  | DottedSubdivision
  | TripletSubdivision;

/** A list of all subdivision types. */
export const SUBDIVISIONS = [
  ...Object.values(STRAIGHT_DURATION_SUBDIVISIONS),
  ...Object.values(DOTTED_DURATION_SUBDIVISIONS),
  ...Object.values(TRIPLET_DURATION_SUBDIVISIONS),
] as Subdivision[];

/** A record of subdivisions by note duration. */
export const DURATION_SUBDIVISIONS: Record<DurationType, Subdivision> = {
  ...STRAIGHT_DURATION_SUBDIVISIONS,
  ...DOTTED_DURATION_SUBDIVISIONS,
  ...TRIPLET_DURATION_SUBDIVISIONS,
} as const;

// ------------------------------------------------------------
// Duration Type Guards
// ------------------------------------------------------------

/** Checks if a given string is of type `Duration` */
export const isDuration = (duration: string): duration is DurationType => {
  return DURATION_TICKS[duration as DurationType] !== undefined;
};

/** Checks if a duration is straight. */
export const isStraightDuration = (
  duration: DurationType
): duration is StraightDurationType => {
  return (
    STRAIGHT_DURATION_TICKS[duration as StraightDurationType] !== undefined
  );
};

/** Checks if a duration is dotted. */
export const isDottedDuration = (
  duration?: DurationType
): duration is DottedDurationType => {
  if (duration === undefined) return false;
  return duration.endsWith("-dotted");
};

/** Checks if a duration is triplet. */
export const isTripletDuration = (
  duration?: DurationType
): duration is TripletDurationType => {
  if (duration === undefined) return false;
  return duration.endsWith("-triplet");
};

/** Checks if a given timed note is a straight duration. */
export const isStraightNote = (note: Timed<MidiNote>) => {
  return getDictValues(STRAIGHT_DURATION_TICKS).includes(note.duration);
};

/** Checks if a given timed note is a dotted duration. */
export const isDottedNote = (note?: Timed<unknown>) => {
  if (note === undefined) return false;
  return getDictValues(DOTTED_DURATION_TICKS).includes(note.duration);
};

/** Checks if a given timed note is a triplet duration. */
export const isTripletNote = (note?: Timed<unknown>) => {
  if (note === undefined) return false;
  return getDictValues(TRIPLET_DURATION_TICKS).includes(note.duration);
};

/** Checks if a subdivision is straight. */
export const isStraightSubdivision = (
  sub: Subdivision
): sub is StraightSubdivision => {
  return getDictValues(STRAIGHT_DURATION_SUBDIVISIONS).includes(
    sub as StraightSubdivision
  );
};

/** Checks if a subdivision is dotted. */
export const isDottedSubdivision = (
  sub: Subdivision
): sub is DottedSubdivision => {
  return getDictValues(DOTTED_DURATION_SUBDIVISIONS).includes(
    sub as DottedSubdivision
  );
};

/** Checks if a subdivision is triplet. */
export const isTripletSubdivision = (
  sub: Subdivision
): sub is TripletSubdivision => {
  return getDictValues(TRIPLET_DURATION_SUBDIVISIONS).includes(
    sub as TripletSubdivision
  );
};

// ------------------------------------------------------------
// Duration Property Getters
// ------------------------------------------------------------

/** Get the straight version of a duration. */
export const getStraightDuration = (duration: DurationType) => {
  if (isDottedDuration(duration)) {
    return duration.replace("-dotted", "") as DurationType;
  }
  if (isTripletDuration(duration)) {
    return duration.replace("-triplet", "") as DurationType;
  }
  return duration;
};

/** Get the dotted version of a duration. */
export const getDottedDuration = (duration: DurationType) => {
  if (isStraightDuration(duration)) {
    return `${duration}-dotted` as DurationType;
  }
  if (isTripletDuration(duration)) {
    return duration.replace("-triplet", "-dotted") as DurationType;
  }
  return duration;
};

/** Get the triplet version of a duration. */
export const getTripletDuration = (duration: DurationType) => {
  if (isStraightDuration(duration)) {
    return `${duration}-triplet` as DurationType;
  }
  if (isDottedDuration(duration)) {
    return duration.replace("-dotted", "-triplet") as DurationType;
  }
  return duration;
};

/** Get the version of a duration based on the other note. */
export const getDurationFromType = (
  duration: DurationType,
  other: DurationType
) => {
  if (isDottedDuration(other)) {
    return getDottedDuration(duration);
  }
  if (isTripletDuration(other)) {
    return getTripletDuration(duration);
  }
  return duration;
};

/** Toggle a duration between straight and dotted. */
export const toggleDottedDuration = (duration: DurationType) => {
  if (!isDottedDuration(duration)) return getDottedDuration(duration);
};

/** Toggle a duration between straight and triplet. */
export const toggleTripletDuration = (duration: DurationType) => {
  if (!isTripletDuration(duration)) return getTripletDuration(duration);
};

/** Get the ticks of a duration. */
export const getDurationTicks = (duration: DurationType) => {
  return DURATION_TICKS[duration];
};

/** Get the name of a duration. */
export const getDurationName = (duration: DurationType) => {
  return DURATION_NAMES[duration];
};

/** Get the hotkey of a duration. */
export const getDurationKey = (duration: DurationType) => {
  if (getStraightDuration(duration) === "64th") return "7";
  if (getStraightDuration(duration) === "32nd") return "6";
  if (getStraightDuration(duration) === "16th") return "5";
  if (getStraightDuration(duration) === "eighth") return "4";
  if (getStraightDuration(duration) === "quarter") return "3";
  if (getStraightDuration(duration) === "half") return "2";
  if (getStraightDuration(duration) === "whole") return "1";
  return "0";
};

/** Get the subdivision of a duration. */
export const getDurationSubdivision = (duration: DurationType) => {
  return DURATION_SUBDIVISIONS[duration];
};

/** Get the image of a duration. */
export const getDurationImage = (duration: DurationType) => {
  if (duration.startsWith("whole")) return wholeNote;
  if (duration.startsWith("half")) return halfNote;
  if (duration.startsWith("quarter")) return quarterNote;
  if (duration.startsWith("eighth")) return eighthNote;
  if (duration.startsWith("16th")) return sixteenthNote;
  if (duration.startsWith("32nd")) return thirtysecondNote;
  if (duration.startsWith("64th")) return sixtyfourthNote;
  return null;
};

// ------------------------------------------------------------
// Tick Property Getters
// ------------------------------------------------------------

/** Get the duration of a tick. */
export const getTickDuration = (ticks: Tick) => {
  if (ticks > WholeNoteTicks) return "whole";
  if (ticks < TripletSixtyFourthNoteTicks) return "64th";
  return findEntry(ticks, DURATION_TICKS)?.[0] as DurationType;
};

/** Get the subdivision of a tick. */
export const getTickSubdivision = (tick: Tick): Subdivision => {
  const entry = findEntry(tick, DURATION_TICKS);
  const subdivision = entry?.[0] as DurationType;
  if (!entry || !subdivision) return "4n";
  return DURATION_SUBDIVISIONS[subdivision];
};

/** Get the columns leading up to a tick based on the subdivision. */
export const getTickColumns = (
  ticks: Tick = 0,
  subdivision: Subdivision = "4n"
) => {
  const ticksPerSubdivision = getSubdivisionTicks(subdivision);
  return ticks / ticksPerSubdivision;
};

export const getColumnTicks = (
  columns: number = 0,
  subdivision: Subdivision = "4n"
) => {
  const ticksPerSubdivision = getSubdivisionTicks(subdivision);
  return columns * ticksPerSubdivision;
};

// ------------------------------------------------------------
// Subdivision Property Getters
// ------------------------------------------------------------

/** Get the duration name corresponding to a subdivision. */
export const getSubdivisionName = (subdivision: Subdivision = "4n") => {
  const entry = findEntry(subdivision, DURATION_SUBDIVISIONS);
  const duration = entry?.[0] as DurationType;
  if (!entry || !duration) return "";
  return DURATION_NAMES[duration];
};

/** Get the ticks corresponding to a subdivision. */
export const getSubdivisionTicks = (subdivision: Subdivision = "4n"): Tick => {
  const entry = findEntry(subdivision, DURATION_SUBDIVISIONS);
  const duration = entry?.[0] as DurationType;
  if (!entry || !duration) return 0;
  return DURATION_TICKS[duration];
};
