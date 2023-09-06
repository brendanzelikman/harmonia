import { Frequency } from "tone";
import { BPM, Duration, Note, Pitch, Tick, Time, Velocity } from "./units";
import { mod } from "utils";
import { clamp } from "lodash";
import { PatternNote } from "./patterns";

export class MIDI {
  public static PPQ = 96;

  // Convert ticks to seconds based on the PPQ and BPM
  public static ticksToSeconds(ticks: Tick, bpm: BPM): Time {
    return (60 / bpm) * (ticks / this.PPQ);
  }
  // Convert seconds to tcks based on the PPQ and BPM
  public static secondsToTicks(seconds: Time, bpm: BPM): Tick {
    return (seconds * bpm * this.PPQ) / 60;
  }

  // Create a note with optional MIDI, duration, and velocity
  public static createNote = (
    MIDI?: number,
    duration?: Tick,
    velocity?: Velocity
  ): PatternNote => {
    const noteMIDI = this.clampNote(MIDI);
    const noteDuration = this.clampDuration(duration);
    const noteVelocity = this.clampVelocity(velocity);
    return {
      MIDI: noteMIDI,
      duration: noteDuration,
      velocity: noteVelocity,
    };
  };
  public static createRest = (duration?: Tick): PatternNote => {
    const noteDuration = clamp(
      duration ?? this.QuarterNoteTicks,
      this.MinDuration,
      this.MaxDuration
    );
    return {
      MIDI: this.Rest,
      duration: noteDuration,
      velocity: 0,
    };
  };

  // Straight Whole Notes
  public static WholeNoteTicks = 4 * this.PPQ;
  public static createWholeNote = (MIDI?: number, velocity?: Velocity) => {
    return this.createNote(MIDI, this.WholeNoteTicks, velocity);
  };
  public static createWholeRest = () => {
    return this.createRest(this.WholeNoteTicks);
  };

  // Straight Half Notes
  public static HalfNoteTicks = 2 * this.PPQ;
  public static createHalfNote = (MIDI?: number, velocity?: Velocity) => {
    return this.createNote(MIDI, this.HalfNoteTicks, velocity);
  };
  public static createHalfRest = () => {
    return this.createRest(this.HalfNoteTicks);
  };

  // Straight Quarter Notes
  public static QuarterNoteTicks = this.PPQ;
  public static createQuarterNote = (MIDI?: number, velocity?: Velocity) => {
    return this.createNote(MIDI, this.QuarterNoteTicks, velocity);
  };
  public static createQuarterRest = () => {
    return this.createRest(this.QuarterNoteTicks);
  };

  // Straight Eighth Notes
  public static EighthNoteTicks = this.PPQ / 2;
  public static createEighthNote = (MIDI?: number, velocity?: Velocity) => {
    return this.createNote(MIDI, this.EighthNoteTicks, velocity);
  };
  public static createEighthRest = () => {
    return this.createRest(this.EighthNoteTicks);
  };

  // Straight Sixteenth Notes
  public static SixteenthNoteTicks = this.PPQ / 4;
  public static createSixteenthNote = (MIDI?: number, velocity?: Velocity) => {
    return this.createNote(MIDI, this.SixteenthNoteTicks, velocity);
  };
  public static createSixteenthRest = () => {
    return this.createRest(this.SixteenthNoteTicks);
  };

  // Straight Thirty Second Notes
  public static ThirtySecondNoteTicks = this.PPQ / 8;
  public static createThirtySecondNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.ThirtySecondNoteTicks, velocity);
  };
  public static createThirtySecondRest = () => {
    return this.createRest(this.ThirtySecondNoteTicks);
  };

  // Straight Sixty Fourth Notes
  public static SixtyFourthNoteTicks = this.PPQ / 16;
  public static createSixtyFourthNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.SixtyFourthNoteTicks, velocity);
  };
  public static createSixtyFourthRest = () => {
    return this.createRest(this.SixtyFourthNoteTicks);
  };

  // Dotted Whole Notes
  public static DottedWholeNoteTicks = 3 * this.HalfNoteTicks;
  public static createDottedWholeNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.DottedWholeNoteTicks, velocity);
  };
  public static createDottedWholeRest = () => {
    return this.createRest(this.DottedWholeNoteTicks);
  };

  // Dotted Half Notes
  public static DottedHalfNoteTicks = 3 * this.QuarterNoteTicks;
  public static createDottedHalfNote = (MIDI?: number, velocity?: Velocity) => {
    return this.createNote(MIDI, this.DottedHalfNoteTicks, velocity);
  };
  public static createDottedHalfRest = () => {
    return this.createRest(this.DottedHalfNoteTicks);
  };

  // Dotted Quarter Notes
  public static DottedQuarterNoteTicks = 3 * this.EighthNoteTicks;
  public static createDottedQuarterNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.DottedQuarterNoteTicks, velocity);
  };
  public static createDottedQuarterRest = () => {
    return this.createRest(this.DottedQuarterNoteTicks);
  };

  // Dotted Eighth Notes
  public static DottedEighthNoteTicks = 3 * this.SixteenthNoteTicks;
  public static createDottedEighthNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.DottedEighthNoteTicks, velocity);
  };
  public static createDottedEighthRest = () => {
    return this.createRest(this.DottedEighthNoteTicks);
  };

  // Dotted Sixteenth Notes
  public static DottedSixteenthNoteTicks = 3 * this.ThirtySecondNoteTicks;
  public static createDottedSixteenthNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.DottedSixteenthNoteTicks, velocity);
  };
  public static createDottedSixteenthRest = () => {
    return this.createRest(this.DottedSixteenthNoteTicks);
  };

  // Dotted Thirty Second Notes
  public static DottedThirtySecondNoteTicks = 3 * this.SixtyFourthNoteTicks;
  public static createDottedThirtySecondNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.DottedThirtySecondNoteTicks, velocity);
  };
  public static createDottedThirtySecondRest = () => {
    return this.createRest(this.DottedThirtySecondNoteTicks);
  };

  // Dotted Sixty Fourth Notes
  public static DottedSixtyFourthNoteTicks = 3 * this.SixtyFourthNoteTicks;
  public static createDottedSixtyFourthNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.DottedSixtyFourthNoteTicks, velocity);
  };
  public static createDottedSixtyFourthRest = () => {
    return this.createRest(this.DottedSixtyFourthNoteTicks);
  };

  // Triplet WHole Notes
  public static TripletWholeNoteTicks = (2 / 3) * this.WholeNoteTicks;
  public static createTripletWholeNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.TripletWholeNoteTicks, velocity);
  };
  public static createTripletWholeRest = () => {
    return this.createRest(this.TripletWholeNoteTicks);
  };

  // Triplet Half Notes
  public static TripletHalfNoteTicks = (2 / 3) * this.HalfNoteTicks;
  public static createTripletHalfNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.TripletHalfNoteTicks, velocity);
  };
  public static createTripletHalfRest = () => {
    return this.createRest(this.TripletHalfNoteTicks);
  };

  // Triplet Quarter Notes
  public static TripletQuarterNoteTicks = (2 / 3) * this.QuarterNoteTicks;
  public static createTripletQuarterNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.TripletQuarterNoteTicks, velocity);
  };
  public static createTripletQuarterRest = () => {
    return this.createRest(this.TripletQuarterNoteTicks);
  };

  // Triplet Eighth Notes
  public static TripletEighthNoteTicks = (2 / 3) * this.EighthNoteTicks;
  public static createTripletEighthNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.TripletEighthNoteTicks, velocity);
  };
  public static createTripletEighthRest = () => {
    return this.createRest(this.TripletEighthNoteTicks);
  };

  // Triplet Sixteenth Notes
  public static TripletSixteenthNoteTicks = (2 / 3) * this.SixteenthNoteTicks;
  public static createTripletSixteenthNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.TripletSixteenthNoteTicks, velocity);
  };
  public static createTripletSixteenthRest = () => {
    return this.createRest(this.TripletSixteenthNoteTicks);
  };

  // Triplet Thirty Second Notes
  public static TripletThirtySecondNoteTicks =
    (2 / 3) * this.ThirtySecondNoteTicks;
  public static createTripletThirtySecondNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.TripletThirtySecondNoteTicks, velocity);
  };
  public static createTripletThirtySecondRest = () => {
    return this.createRest(this.TripletThirtySecondNoteTicks);
  };

  // Triplet Sixty Fourth Notes
  public static TripletSixtyFourthNoteTicks =
    (2 / 3) * this.SixtyFourthNoteTicks;
  public static createTripletSixtyFourthNote = (
    MIDI?: number,
    velocity?: Velocity
  ) => {
    return this.createNote(MIDI, this.TripletSixtyFourthNoteTicks, velocity);
  };
  public static createTripletSixtyFourthRest = () => {
    return this.createRest(this.TripletSixtyFourthNoteTicks);
  };

  // Return true if the note is any triplet duration
  public static isTriplet(note: { duration: Tick }) {
    return (
      note?.duration === MIDI.TripletWholeNoteTicks ||
      note?.duration === MIDI.TripletHalfNoteTicks ||
      note?.duration === MIDI.TripletEighthNoteTicks ||
      note?.duration === MIDI.TripletSixteenthNoteTicks ||
      note?.duration === MIDI.TripletThirtySecondNoteTicks ||
      note?.duration === MIDI.TripletSixtyFourthNoteTicks
    );
  }

  // Return true if the note is any dotted duration
  public static isDotted(note: { duration: Tick }) {
    return (
      note?.duration === MIDI.DottedWholeNoteTicks ||
      note?.duration === MIDI.DottedHalfNoteTicks ||
      note?.duration === MIDI.DottedQuarterNoteTicks ||
      note?.duration === MIDI.DottedEighthNoteTicks ||
      note?.duration === MIDI.DottedSixteenthNoteTicks ||
      note?.duration === MIDI.DottedThirtySecondNoteTicks ||
      note?.duration === MIDI.DottedSixtyFourthNoteTicks
    );
  }

  // MIDI Rests
  public static Rest = -1;
  public static isRest(note: { MIDI: Note } | Note) {
    if (typeof note === "number") {
      return note === this.Rest;
    }
    return note?.MIDI === this.Rest;
  }

  // MIDI Note Numbers
  public static MinNote = 0;
  public static MaxNote = 127;
  public static DefaultNote = 60;

  public static clampNote = (note?: Note): Note => {
    const value = note ?? this.DefaultNote;
    return clamp(value, this.MinNote, this.MaxNote);
  };

  // MIDI Velocity Numbers
  public static MinVelocity = 0;
  public static MaxVelocity = 127;
  public static DefaultVelocity = 100;

  public static clampVelocity = (velocity?: Velocity): Velocity => {
    const value = velocity ?? this.DefaultVelocity;
    return clamp(value, this.MinVelocity, this.MaxVelocity);
  };

  // MIDI Durations in Ticks
  public static MinDuration = 1;
  public static MaxDuration = this.DottedWholeNoteTicks;
  public static DefaultDuration = this.QuarterNoteTicks;

  public static clampDuration = (duration?: Tick): Tick => {
    const value = duration ?? this.DefaultDuration;
    return clamp(value, this.MinDuration, this.MaxDuration);
  };

  // Chromatic Notes
  public static ChromaticNotes: Pitch[] = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];

  // Get the chromatic number of a note
  public static ChromaticNumber(pitch: Note | Pitch): number {
    if (!isNaN(pitch as Note)) {
      pitch = MIDI.toPitchClass(pitch as Note);
    }
    return MIDI.ChromaticNotes.indexOf(pitch as Pitch);
  }
  // Get the MIDI number from a pitch
  public static fromPitch(pitch: string): Note {
    return Frequency(pitch).toMidi();
  }
  // Get the pitch class of a note, e.g. C, C#, D, etc.
  public static toPitchClass(note: Note): string {
    if (note === MIDI.Rest) return "R";
    return MIDI.ChromaticNotes[mod(note, 12)];
  }
  // Get the octave of a note, e.g. 4, 5, 6, etc.
  public static toOctave(note: Note): number {
    return Math.floor((note - 12) / 12);
  }
  // Get the pitch of a note, e.g. C4, D5, E6, etc.
  public static toPitch(note: Note): string {
    if (note === MIDI.Rest) return "";
    return `${this.toPitchClass(note)}${this.toOctave(note)}`;
  }
  // Get the letter of a note, e.g. C, D, E, etc.
  public static toLetter(note: Note): string {
    return this.toPitchClass(note).replace(/b|#|-/g, "");
  }
  // Get the accidental offset of a note
  public static toOffset(note: Note): number {
    const pitch = this.toPitch(note);
    const accidentalMatch = pitch.match(/b|#/g);
    if (accidentalMatch) {
      const accidental = accidentalMatch[0];
      return accidental === "#" ? 1 : -1;
    }
    return 0;
  }

  public static closestPitchClass(
    pitch: Pitch,
    arr: Note[]
  ): Pitch | undefined {
    if (!arr.length) return;
    const notes = arr.map((n) => MIDI.ChromaticNumber(n));
    const note = MIDI.ChromaticNotes.indexOf(pitch);

    // Get the closest chromatic number
    const index = notes.reduce((prev, curr) => {
      const currDiff = Math.abs(curr - note);
      const prevDiff = Math.abs(prev - note);
      return currDiff <= prevDiff ? curr : prev;
    });

    // Return the closest pitch class
    return MIDI.ChromaticNotes[index];
  }
}
