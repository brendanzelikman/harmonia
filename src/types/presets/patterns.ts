import { fill } from "lodash";
import { MIDI } from "../midi";
import { Pattern, PatternChord as Chord } from "types/patterns";
import { Tick } from "../units";

const createNote = (duration: Tick) => [{ MIDI: 60, duration }];
const createRest = (duration: Tick) => [{ MIDI: MIDI.Rest, duration }];

// Straight Notes
export const wholeNote: Chord = createNote(MIDI.WholeNoteTicks);
export const halfNote: Chord = createNote(MIDI.HalfNoteTicks);
export const quarterNote: Chord = createNote(MIDI.QuarterNoteTicks);
export const eighthNote: Chord = createNote(MIDI.EighthNoteTicks);
export const sixteenthNote: Chord = createNote(MIDI.SixteenthNoteTicks);
export const thirtySecondNote: Chord = createNote(MIDI.ThirtySecondNoteTicks);
export const sixtyFourthNote: Chord = createNote(MIDI.SixtyFourthNoteTicks);

// Straight Rests
export const wholeRest: Chord = createRest(MIDI.WholeNoteTicks);
export const halfRest: Chord = createRest(MIDI.HalfNoteTicks);
export const quarterRest: Chord = createRest(MIDI.QuarterNoteTicks);
export const eighthRest: Chord = createRest(MIDI.EighthNoteTicks);
export const sixteenthRest: Chord = createRest(MIDI.SixteenthNoteTicks);
export const thirtySecondRest: Chord = createRest(MIDI.ThirtySecondNoteTicks);
export const sixtyFourthRest: Chord = createRest(MIDI.SixtyFourthNoteTicks);

// Dotted Notes
export const dottedWholeNote: Chord = createNote(MIDI.DottedWholeNoteTicks);
export const dottedHalfNote: Chord = createNote(MIDI.DottedHalfNoteTicks);
export const dottedQuarterNote: Chord = createNote(MIDI.DottedQuarterNoteTicks);
export const dottedEighthNote: Chord = createNote(MIDI.DottedEighthNoteTicks);
export const dottedSixteenthNote: Chord = createNote(
  MIDI.DottedSixteenthNoteTicks
);
export const dottedThirtySecondNote: Chord = createNote(
  MIDI.DottedThirtySecondNoteTicks
);
export const dottedSixtyFourthNote: Chord = createNote(
  MIDI.DottedSixtyFourthNoteTicks
);

// Dotted Rests
export const dottedWholeRest: Chord = createRest(MIDI.DottedWholeNoteTicks);
export const dottedHalfRest: Chord = createRest(MIDI.DottedHalfNoteTicks);
export const dottedQuarterRest: Chord = createRest(MIDI.DottedQuarterNoteTicks);
export const dottedEighthRest: Chord = createRest(MIDI.DottedEighthNoteTicks);
export const dottedSixteenthRest: Chord = createRest(
  MIDI.DottedSixteenthNoteTicks
);
export const dottedThirtySecondRest: Chord = createRest(
  MIDI.DottedThirtySecondNoteTicks
);
export const dottedSixtyFourthRest: Chord = createRest(
  MIDI.DottedSixtyFourthNoteTicks
);

// Triplet Notes
export const tripletWholeNote: Chord = createNote(MIDI.TripletWholeNoteTicks);
export const tripletHalfNote: Chord = createNote(MIDI.TripletHalfNoteTicks);
export const tripletQuarterNote: Chord = createNote(
  MIDI.TripletQuarterNoteTicks
);
export const tripletEighthNote: Chord = createNote(MIDI.TripletEighthNoteTicks);
export const tripletSixteenthNote: Chord = createNote(
  MIDI.TripletSixteenthNoteTicks
);
export const tripletThirtySecondNote: Chord = createNote(
  MIDI.TripletThirtySecondNoteTicks
);
export const tripletSixtyFourthNote: Chord = createNote(
  MIDI.TripletSixtyFourthNoteTicks
);

// Triplet Rests
export const tripletWholeRest: Chord = createRest(MIDI.TripletWholeNoteTicks);
export const tripletHalfRest: Chord = createRest(MIDI.TripletHalfNoteTicks);
export const tripletQuarterRest: Chord = createRest(
  MIDI.TripletQuarterNoteTicks
);
export const tripletEighthRest: Chord = createRest(MIDI.TripletEighthNoteTicks);
export const tripletSixteenthRest: Chord = createRest(
  MIDI.TripletSixteenthNoteTicks
);
export const tripletThirtySecondRest: Chord = createRest(
  MIDI.TripletThirtySecondNoteTicks
);
export const tripletSixtyFourthRest: Chord = createRest(
  MIDI.TripletSixtyFourthNoteTicks
);

// Basic Chords
export const Octave: Pattern = {
  id: "octave",
  name: "Octave",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 72, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};

export const MajorChord: Pattern = {
  id: "major-chord",
  name: "Major Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const MinorChord: Pattern = {
  id: "minor-chord",
  name: "Minor Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const DiminishedChord: Pattern = {
  id: "diminished-chord",
  name: "Diminished Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 66, duration: MIDI.QuarterNoteTicks },
      { MIDI: 69, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const AugmentedChord: Pattern = {
  id: "augmented-chord",
  name: "Augmented Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 68, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const PowerChord: Pattern = {
  id: "power-chord",
  name: "Power Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 72, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Sus2Chord: Pattern = {
  id: "sus2-chord",
  name: "Sus2 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 62, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Sus4Chord: Pattern = {
  id: "sus4-chord",
  name: "Sus4 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 65, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const QuartalChord: Pattern = {
  id: "quartal-chord",
  name: "Quartal Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 65, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const QuintalChord: Pattern = {
  id: "quintal-chord",
  name: "Quintal Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};

// Seventh Chords
export const Major7thChord: Pattern = {
  id: "major-7th-chord",
  name: "Major 7th Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Major7thSus2Chord: Pattern = {
  id: "major-7th-sus2-chord",
  name: "Major 7th (Sus2) Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 62, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Major7thSus4Chord: Pattern = {
  id: "major-7th-sus4-chord",
  name: "Major 7th (Sus4) Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 65, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Major7thFlat5Chord: Pattern = {
  id: "major-7th-b5-chord",
  name: "Major 7th (b5) Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 66, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Minor7thChord: Pattern = {
  id: "minor-7th-chord",
  name: "Minor 7th Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Minor7thSus2Chord: Pattern = {
  id: "minor-7th-sus2-chord",
  name: "Minor 7th (Sus2) Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 62, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Minor7thSus4Chord: Pattern = {
  id: "minor-7th-sus4-chord",
  name: "Minor 7th (Sus4) Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 65, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Dominant7thChord: Pattern = {
  id: "dominant-7th-chord",
  name: "Dominant 7th Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};

export const Dominant7thFlat5Chord: Pattern = {
  id: "dominant-7th-b5-chord",
  name: "Dominant 7th (b5) Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 66, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Dominant7thSharp5Chord: Pattern = {
  id: "dominant-7th-#5-chord",
  name: "Dominant 7th (#5) Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 68, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Minor7thFlat5Chord: Pattern = {
  id: "minor-7th-b5-chord",
  name: "Minor 7th (b5) Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 66, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const MinorMajor7thChord: Pattern = {
  id: "minor-major-7th-chord",
  name: "Minor Major 7th Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Diminished7thChord: Pattern = {
  id: "diminished-7th-chord",
  name: "Diminished 7th Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 66, duration: MIDI.QuarterNoteTicks },
      { MIDI: 69, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};

export const Augmented7thChord: Pattern = {
  id: "augmented-7th-chord",
  name: "Augmented 7th Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 68, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};

// Basic Arpeggios
export const StraightMajorArpeggio: Pattern = {
  id: "straight-major-arpeggio",
  name: "Straight Major Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 72, duration: MIDI.SixteenthNoteTicks }],
  ],
};
export const TripletMajorArpeggio: Pattern = {
  id: "triplet-major-arpeggio",
  name: "Triplet Major Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.TripletEighthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.TripletEighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.TripletEighthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.TripletEighthNoteTicks }],
  ],
};

export const StraightMinorArpeggio: Pattern = {
  id: "straight-minor-arpeggio",
  name: "Straight Minor Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 63, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 72, duration: MIDI.SixteenthNoteTicks }],
  ],
};
export const TripletMinorArpeggio: Pattern = {
  id: "triplet-minor-arpeggio",
  name: "Triplet Minor Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.TripletEighthNoteTicks }],
    [{ MIDI: 63, duration: MIDI.TripletEighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.TripletEighthNoteTicks }],
  ],
};
export const StraightDiminishedArpeggio: Pattern = {
  id: "straight-diminished-arpeggio",
  name: "Straight Diminished Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 63, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 66, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 69, duration: MIDI.SixteenthNoteTicks }],
  ],
};
export const TripletDiminishedArpeggio: Pattern = {
  id: "triplet-diminished-arpeggio",
  name: "Triplet Diminished Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.TripletEighthNoteTicks }],
    [{ MIDI: 63, duration: MIDI.TripletEighthNoteTicks }],
    [{ MIDI: 66, duration: MIDI.TripletEighthNoteTicks }],
  ],
};
export const StraightAugmentedArpeggio: Pattern = {
  id: "straight-augmented-arpeggio",
  name: "Straight Augmented Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 68, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 72, duration: MIDI.SixteenthNoteTicks }],
  ],
};
export const TripletAugmentedArpeggio: Pattern = {
  id: "triplet-augmented-arpeggio",
  name: "Triplet Augmented Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.TripletEighthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.TripletEighthNoteTicks }],
    [{ MIDI: 68, duration: MIDI.TripletEighthNoteTicks }],
  ],
};

export const Major7thArpeggio: Pattern = {
  id: "major-7th-arpeggio",
  name: "Major 7th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 71, duration: MIDI.SixteenthNoteTicks }],
  ],
};
export const Minor7thArpeggio: Pattern = {
  id: "minor-7th-arpeggio",
  name: "Minor 7th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 63, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
  ],
};
export const Dominant7thArpeggio: Pattern = {
  id: "dominant-7th-arpeggio",
  name: "Dominant 7th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
  ],
};

export const HalfDiminished7thArpeggio: Pattern = {
  id: "half-diminished-7th-arpeggio",
  name: "Half Diminished 7th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 63, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 66, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
  ],
};

export const Augmented7thArpeggio: Pattern = {
  id: "augmented-7th-arpeggio",
  name: "Augmented 7th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 68, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 71, duration: MIDI.SixteenthNoteTicks }],
  ],
};
export const MinorMajor7thArpeggio: Pattern = {
  id: "major-minor-7th-arpeggio",
  name: "Major Minor 7th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 63, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 71, duration: MIDI.SixteenthNoteTicks }],
  ],
};

// Extended Chords
export const Major9thChord: Pattern = {
  id: "major-9th-chord",
  name: "Major 9 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Major11thChord: Pattern = {
  id: "major-11th-chord",
  name: "Major 11 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
      { MIDI: 77, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const MajorSharp11thChord: Pattern = {
  id: "major-#11th-chord",
  name: "Major #11 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
      { MIDI: 78, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Major13thChord: Pattern = {
  id: "major-13th-chord",
  name: "Major 13#11 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
      { MIDI: 78, duration: MIDI.QuarterNoteTicks },
      { MIDI: 81, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Minor9thChord: Pattern = {
  id: "minor-9th-chord",
  name: "Minor 9th Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Minor11thChord: Pattern = {
  id: "minor-11th-chord",
  name: "Minor 11th Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
      { MIDI: 77, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const MinorSharp11thChord: Pattern = {
  id: "minor-#11th-chord",
  name: "Minor #11 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
      { MIDI: 78, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};

export const Minor13thChord: Pattern = {
  id: "minor-13-chord",
  name: "Minor 13 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
      { MIDI: 77, duration: MIDI.QuarterNoteTicks },
      { MIDI: 81, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const Dominant9thChord: Pattern = {
  id: "dominant-9th-chord",
  name: "Dominant 9 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const DominantFlat9thChord: Pattern = {
  id: "dominant-b9-chord",
  name: "Dominant b9 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 73, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const DominantSharp9thChord: Pattern = {
  id: "dominant-#9-chord",
  name: "Dominant #9 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 75, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};

export const Dominant11thChord: Pattern = {
  id: "dominant-11th-chord",
  name: "Dominant 11 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
      { MIDI: 77, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const DominantSharp11thChord: Pattern = {
  id: "dominant-#11th-chord",
  name: "Dominant #11 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
      { MIDI: 78, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};

export const Dominant13thChord: Pattern = {
  id: "dominant-13th-chord",
  name: "Dominant 13 Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
      { MIDI: 77, duration: MIDI.QuarterNoteTicks },
      { MIDI: 81, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};

// Famous Chords
export const TristanChord: Pattern = {
  id: "tristan-chord",
  name: "Tristan Chord",
  stream: [
    [
      { MIDI: 53, duration: MIDI.QuarterNoteTicks },
      { MIDI: 59, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 68, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const MysticChord: Pattern = {
  id: "mystic-chord",
  name: "Mystic Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 66, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 76, duration: MIDI.QuarterNoteTicks },
      { MIDI: 81, duration: MIDI.QuarterNoteTicks },
      { MIDI: 86, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const ElektraChord: Pattern = {
  id: "elektra-chord",
  name: "Elektra Chord",
  stream: [
    [
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
      { MIDI: 73, duration: MIDI.QuarterNoteTicks },
      { MIDI: 77, duration: MIDI.QuarterNoteTicks },
      { MIDI: 80, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const FarbenChord: Pattern = {
  id: "farben-chord",
  name: "Farben Chord",
  stream: [
    [
      { MIDI: 60, duration: MIDI.QuarterNoteTicks },
      { MIDI: 68, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
      { MIDI: 76, duration: MIDI.QuarterNoteTicks },
      { MIDI: 82, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const RiteOfSpringChord: Pattern = {
  id: "rite-of-spring-chord",
  name: "Rite of Spring Chord",
  stream: [
    [
      { MIDI: 40, duration: MIDI.QuarterNoteTicks },
      { MIDI: 44, duration: MIDI.QuarterNoteTicks },
      { MIDI: 47, duration: MIDI.QuarterNoteTicks },
      { MIDI: 52, duration: MIDI.QuarterNoteTicks },
      { MIDI: 55, duration: MIDI.QuarterNoteTicks },
      { MIDI: 58, duration: MIDI.QuarterNoteTicks },
      { MIDI: 61, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const DreamChord: Pattern = {
  id: "dream-chord",
  name: "Dream Chord",
  stream: [
    [
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 72, duration: MIDI.QuarterNoteTicks },
      { MIDI: 73, duration: MIDI.QuarterNoteTicks },
      { MIDI: 74, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};

export const HendrixChord: Pattern = {
  id: "hendrix-chord",
  name: "Hendrix Chord",
  stream: [
    [
      { MIDI: 40, duration: MIDI.QuarterNoteTicks },
      { MIDI: 52, duration: MIDI.QuarterNoteTicks },
      { MIDI: 56, duration: MIDI.QuarterNoteTicks },
      { MIDI: 62, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const SoWhatChord: Pattern = {
  id: "so-what-chord",
  name: "So What Chord",
  stream: [
    [
      { MIDI: 52, duration: MIDI.QuarterNoteTicks },
      { MIDI: 57, duration: MIDI.QuarterNoteTicks },
      { MIDI: 62, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const BondChord: Pattern = {
  id: "james-bond-chord",
  name: "James Bond Chord",
  stream: [
    [
      { MIDI: 52, duration: MIDI.QuarterNoteTicks },
      { MIDI: 67, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
      { MIDI: 75, duration: MIDI.QuarterNoteTicks },
      { MIDI: 78, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const KennyBarronMajorChord: Pattern = {
  id: "kenny-barron-major-chord",
  name: "Kenny Barron Major Chord",
  stream: [
    [
      { MIDI: 48, duration: MIDI.QuarterNoteTicks },
      { MIDI: 55, duration: MIDI.QuarterNoteTicks },
      { MIDI: 62, duration: MIDI.QuarterNoteTicks },
      { MIDI: 64, duration: MIDI.QuarterNoteTicks },
      { MIDI: 71, duration: MIDI.QuarterNoteTicks },
      { MIDI: 78, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};
export const KennyBarronMinorChord: Pattern = {
  id: "kenny-barron-minor-chord",
  name: "Kenny Barron Minor Chord",
  stream: [
    [
      { MIDI: 48, duration: MIDI.QuarterNoteTicks },
      { MIDI: 55, duration: MIDI.QuarterNoteTicks },
      { MIDI: 62, duration: MIDI.QuarterNoteTicks },
      { MIDI: 63, duration: MIDI.QuarterNoteTicks },
      { MIDI: 70, duration: MIDI.QuarterNoteTicks },
      { MIDI: 77, duration: MIDI.QuarterNoteTicks },
    ],
  ],
};

// Extended Arpeggios
export const Major9thArpeggio: Pattern = {
  id: "major-9th-arpeggio",
  name: "Major 9th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 71, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 71, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.SixteenthNoteTicks }],
  ],
};

export const Minor9thArpeggio: Pattern = {
  id: "minor-9th-arpeggio",
  name: "Minor 9th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 63, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 63, duration: MIDI.SixteenthNoteTicks }],
  ],
};

export const Dominant9thArpeggio: Pattern = {
  id: "dominant-9th-arpeggio",
  name: "Dominant 9th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.SixteenthNoteTicks }],
  ],
};
export const Major11thArpeggio: Pattern = {
  id: "major-11th-arpeggio",
  name: "Major 11th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 71, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 78, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 71, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
  ],
};

export const Minor11thArpeggio: Pattern = {
  id: "minor-11th-arpeggio",
  name: "Minor 11th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 77, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
  ],
};

export const Dominant11thArpeggio: Pattern = {
  id: "dominant-11th-arpeggio",
  name: "Dominant 11th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 77, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
  ],
};
export const Major13thArpeggio: Pattern = {
  id: "major-13th-arpeggio",
  name: "Major 13th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 71, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 78, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 81, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 78, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 71, duration: MIDI.SixteenthNoteTicks }],
  ],
};

export const Minor13thArpeggio: Pattern = {
  id: "minor-13th-arpeggio",
  name: "Minor 13th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 77, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 81, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 77, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
  ],
};

export const Dominant13thArpeggio: Pattern = {
  id: "dominant-13th-arpeggio",
  name: "Dominant 13th Arpeggio",
  stream: [
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 77, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 81, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 77, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 74, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 70, duration: MIDI.SixteenthNoteTicks }],
  ],
};

// Famous Patterns
export const BachPrelude: Pattern = {
  id: "bach-prelude",
  name: "Prelude in C",
  stream: [
    [{ MIDI: 60, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 72, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 76, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 72, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 76, duration: MIDI.EighthNoteTicks }],
  ],
};
export const AlbertiBass: Pattern = {
  id: "alberti-bass",
  name: "Alberti Bass",
  stream: [
    [{ MIDI: 60, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 60, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.EighthNoteTicks }],
  ],
};
export const TurkishMarch: Pattern = {
  id: "turkish-march",
  name: "Turkish March",
  stream: [
    [{ MIDI: 71, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 69, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 68, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 69, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 72, duration: MIDI.SixteenthNoteTicks }],
  ],
};
export const FateMotif: Pattern = {
  id: "fate-motif",
  name: "Fate Motif",
  stream: [
    [{ MIDI: MIDI.Rest, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 63, duration: MIDI.HalfNoteTicks }],
  ],
};
export const RevolutionaryEtude: Pattern = {
  id: "revolutionary-etude",
  name: "Revolutionary Etude",
  stream: [
    [{ MIDI: 48, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 55, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 62, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 63, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 62, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 60, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 55, duration: MIDI.SixteenthNoteTicks }],
  ],
};
export const ZarahustraFanfare: Pattern = {
  id: "zarahustra-fanfare",
  name: "Zarahustra Fanfare",
  stream: [
    [{ MIDI: 60, duration: MIDI.HalfNoteTicks }],
    [{ MIDI: 67, duration: MIDI.HalfNoteTicks }],
    [{ MIDI: 72, duration: MIDI.HalfNoteTicks }],
    [{ MIDI: MIDI.Rest, duration: MIDI.QuarterNoteTicks }],
    [{ MIDI: MIDI.Rest, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: MIDI.Rest, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 76, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 75, duration: MIDI.QuarterNoteTicks }],
  ],
};
export const TheLick: Pattern = {
  id: "the-lick",
  name: "The Lick",
  stream: [
    [{ MIDI: 62, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 65, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 64, duration: MIDI.QuarterNoteTicks }],
    [{ MIDI: 60, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: 62, duration: MIDI.EighthNoteTicks }],
  ],
};
export const HappyBirthday: Pattern = {
  id: "happy-birthday",
  name: "Happy Birthday",
  stream: [
    [{ MIDI: 67, duration: MIDI.EighthNoteTicks }],
    [{ MIDI: MIDI.Rest, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 67, duration: MIDI.SixteenthNoteTicks }],
    [{ MIDI: 69, duration: MIDI.QuarterNoteTicks }],
    [{ MIDI: 67, duration: MIDI.QuarterNoteTicks }],
    [{ MIDI: 72, duration: MIDI.QuarterNoteTicks }],
    [{ MIDI: 71, duration: MIDI.QuarterNoteTicks }],
  ],
};

// Basic Durations
export const WholeNote: Pattern = {
  id: "whole-note",
  name: "Straight Whole Note",
  stream: [wholeNote],
};
export const DottedWholeNotes: Pattern = {
  id: "dotted-whole-note",
  name: "Dotted Whole Note",
  stream: [dottedWholeNote, dottedWholeNote],
};
export const TripletWholeNotes: Pattern = {
  id: "triplet-whole-notes",
  name: "Triplet Whole Notes",
  stream: [tripletWholeNote, tripletWholeNote, tripletWholeNote],
};
export const HalfNotes: Pattern = {
  id: "half-notes",
  name: "Straight Half Notes",
  stream: fill(Array(2), halfNote),
};
export const DottedHalfNotes: Pattern = {
  id: "dotted-half-notes",
  name: "Dotted Half Notes",
  stream: fill(Array(4), [dottedHalfNote]).flat(),
};
export const TripletHalfNotes: Pattern = {
  id: "triplet-half-notes",
  name: "Triplet Half Notes",
  stream: fill(Array(3), [tripletHalfNote]).flat(),
};
export const QuarterNotes: Pattern = {
  id: "quarter-notes",
  name: "Straight Quarter Notes",
  stream: fill(Array(4), quarterNote),
};
export const DottedQuarterNotes: Pattern = {
  id: "dotted-quarter-notes",
  name: "Dotted Quarter Notes",
  stream: fill(Array(4), [dottedQuarterNote]).flat(),
};
export const TripletQuarterNotes: Pattern = {
  id: "triplet-quarter-notes",
  name: "Triplet Quarter Notes",
  stream: fill(Array(6), [tripletQuarterNote]).flat(),
};
export const EighthNotes: Pattern = {
  id: "eighth-notes",
  name: "Straight Eighth Notes",
  stream: fill(Array(8), eighthNote),
};
export const DottedEighthNotes: Pattern = {
  id: "dotted-eighth-notes",
  name: "Dotted Eighth Notes",
  stream: fill(Array(8), [dottedEighthNote]).flat(),
};
export const TripletEighthNotes: Pattern = {
  id: "triplet-eighth-notes",
  name: "Triplet Eighth Notes",
  stream: fill(Array(12), [tripletEighthNote]).flat(),
};
export const SixteenthNotes: Pattern = {
  id: "sixteenth-notes",
  name: "Straight Sixteenth Notes",
  stream: fill(Array(16), sixteenthNote),
};
export const DottedSixteenthNotes: Pattern = {
  id: "dotted-sixteenth-notes",
  name: "Dotted Sixteenth Notes",
  stream: fill(Array(16), [dottedSixteenthNote]).flat(),
};
export const TripletSixteenthNotes: Pattern = {
  id: "triplet-sixteenth-notes",
  name: "Triplet Sixteenth Notes",
  stream: fill(Array(24), [tripletSixteenthNote]).flat(),
};
export const ThirtySecondNotes: Pattern = {
  id: "thirty-second-notes",
  name: "Straight Thirty-Second Notes",
  stream: fill(Array(32), thirtySecondNote),
};
export const DottedThirtySecondNotes: Pattern = {
  id: "dotted-thirty-second-notes",
  name: "Dotted Thirty-Second Notes",
  stream: fill(Array(32), [dottedThirtySecondNote]).flat(),
};
export const TripletThirtySecondNotes: Pattern = {
  id: "triplet-thirty-second-notes",
  name: "Triplet Thirty-Second Notes",
  stream: fill(Array(48), [tripletThirtySecondNote]).flat(),
};
export const SixtyFourthNotes: Pattern = {
  id: "sixty-fourth-notes",
  name: "Straight Sixty-Fourth Notes",
  stream: fill(Array(64), sixtyFourthNote),
};
export const DottedSixtyFourthNotes: Pattern = {
  id: "dotted-sixty-fourth-notes",
  name: "Dotted Sixty-Fourth Notes",
  stream: fill(Array(64), [dottedSixtyFourthNote]).flat(),
};
export const TripletSixtyFourthNotes: Pattern = {
  id: "triplet-sixty-fourth-notes",
  name: "Triplet Sixty-Fourth Notes",
  stream: fill(Array(96), [tripletSixtyFourthNote]).flat(),
};

// Simple Rhythms
export const EighthAndTwoSixteenths: Pattern = {
  id: "eighth-and-two-sixteenths",
  name: "Eighth + Two Sixteenths",
  stream: fill(Array(4), [eighthNote, sixteenthNote, sixteenthNote]).flat(),
};
export const TwoSixteenthsAndEighth: Pattern = {
  id: "two-sixteenths-and-eighth",
  name: "Two Sixteenths + Eighth",
  stream: fill(Array(4), [sixteenthNote, sixteenthNote, eighthNote]).flat(),
};
export const SixteenthEighthSixteenth: Pattern = {
  id: "sixteenth-eighth-sixteenth",
  name: "Sixteenth + Eighth + Sixteenth",
  stream: fill(Array(4), [sixteenthNote, eighthNote, sixteenthNote]).flat(),
};
export const SixteenthAndDottedEighth: Pattern = {
  id: "sixteenth-and-dotted",
  name: "Sixteenth + Dotted Eighth",
  stream: fill(Array(4), [sixteenthNote, dottedEighthNote]).flat(),
};
export const DottedEighthAndSixteenth: Pattern = {
  id: "dotted-and-sixteenth",
  name: "Dotted Eighth + Sixteenth",
  stream: fill(Array(4), [dottedEighthNote, sixteenthNote]).flat(),
};

// Latin Rhythms
export const Habanera: Pattern = {
  id: "habanera",
  name: "Habanera",
  stream: [
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthNote,
    eighthNote,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthNote,
    eighthNote,
  ],
};
export const Tresillo: Pattern = {
  id: "tresillo",
  name: "Tresillo",
  stream: [
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
  ],
};
export const Cinquillo: Pattern = {
  id: "cinquillo",
  name: "Cinquillo",
  stream: [
    eighthNote,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    eighthNote,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
  ],
};
export const Baqueteo: Pattern = {
  id: "baqueteo",
  name: "Baqueteo",
  stream: [
    eighthNote,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    eighthNote,
    eighthNote,
    eighthNote,
    eighthNote,
  ],
};
export const Cascara: Pattern = {
  id: "cascara",
  name: "Cascara",
  stream: [
    eighthNote,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
    eighthNote,
    eighthNote,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    sixteenthNote,
  ],
};
export const Montuno: Pattern = {
  id: "montuno",
  name: "Montuno",
  stream: [
    eighthNote,
    sixteenthNote,
    sixteenthNote,
    sixteenthRest,
    eighthNote,
    sixteenthNote,
    sixteenthRest,
    eighthNote,
    sixteenthNote,
    sixteenthRest,
    eighthNote,
    sixteenthNote,
  ],
};

// Clave Patterns
export const TwoThreeSonClave: Pattern = {
  id: "2-3-son-clave",
  name: "2-3 Son Clave",
  stream: [
    eighthRest,
    eighthNote,
    eighthNote,
    eighthRest,
    dottedEighthNote,
    sixteenthNote,
    eighthRest,
    eighthNote,
  ],
};
export const ThreeTwoSonClave: Pattern = {
  id: "3-2-son-clave",
  name: "3-2 Son Clave",
  stream: [
    dottedEighthNote,
    sixteenthNote,
    eighthRest,
    eighthNote,
    eighthRest,
    eighthNote,
    eighthNote,
    eighthRest,
  ],
};
export const TwoThreeRumbaClave: Pattern = {
  id: "2-3-rumba-clave",
  name: "2-3 Rumba Clave",
  stream: [
    eighthRest,
    eighthNote,
    eighthNote,
    eighthRest,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    sixteenthRest,
    sixteenthNote,
  ],
};
export const ThreeTwoRumbaClave: Pattern = {
  id: "3-2-rumba-clave",
  name: "3-2 Rumba Clave",
  stream: [
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
    eighthNote,
    eighthRest,
  ],
};
export const TwoThreeBossaNovaClave: Pattern = {
  id: "2-3-bossa-nova-clave",
  name: "2-3 Bossa Nova Clave",
  stream: [
    eighthRest,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
  ],
};
export const ThreeTwoBossaNovaClave: Pattern = {
  id: "3-2-bossa-nova-clave",
  name: "3-2 Bossa Nova Clave",
  stream: [
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
    eighthRest,
    eighthNote,
    sixteenthRest,
    sixteenthNote,
    eighthRest,
  ],
};

// Bell Patterns
export const BellPattern1: Pattern = {
  id: "bell-pattern-1",
  name: "Bell Pattern 1",
  stream: [
    dottedEighthNote,
    sixteenthNote,
    eighthRest,
    sixteenthNote,
    sixteenthNote,
    eighthRest,
    eighthNote,
    dottedEighthNote,
    sixteenthNote,
  ],
};
export const BellPattern2: Pattern = {
  id: "bell-pattern-2",
  name: "Bell Pattern 2",
  stream: [
    dottedEighthNote,
    sixteenthNote,
    dottedEighthRest,
    sixteenthNote,
    eighthRest,
    eighthNote,
    quarterNote,
  ],
};
export const BellPattern3: Pattern = {
  id: "bell-pattern-3",
  name: "Bell Pattern 3",
  stream: [
    dottedEighthNote,
    sixteenthNote,
    eighthRest,
    eighthNote,
    eighthRest,
    eighthNote,
    quarterNote,
  ],
};
export const BellPattern4: Pattern = {
  id: "bell-pattern-4",
  name: "Bell Pattern 4",
  stream: [
    dottedEighthNote,
    sixteenthNote,
    eighthRest,
    eighthNote,
    eighthRest,
    eighthNote,
    eighthRest,
    eighthNote,
  ],
};
export const BellPattern5: Pattern = {
  id: "bell-pattern-5",
  name: "Bell Pattern 5",
  stream: [
    quarterRest,
    eighthRest,
    eighthNote,
    eighthRest,
    eighthNote,
    eighthRest,
    eighthNote,
  ],
};
export const BellPattern6: Pattern = {
  id: "bell-pattern-6",
  name: "Bell Pattern 6",
  stream: [
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthRest,
  ],
};
export const BellPattern7: Pattern = {
  id: "bell-pattern-7",
  name: "Bell Pattern 7",
  stream: [
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthRest,
  ],
};
export const BellPattern8: Pattern = {
  id: "bell-pattern-8",
  name: "Bell Pattern 8",
  stream: [
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
  ],
};
export const BellPattern9: Pattern = {
  id: "bell-pattern-9",
  name: "Bell Pattern 9",
  stream: [
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthRest,
    tripletEighthNote,
    tripletEighthRest,
    tripletEighthRest,
  ],
};

export * as PresetPatterns from "./patterns";
