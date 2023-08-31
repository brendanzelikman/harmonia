import { Frequency } from "tone";
import { BPM, Note, Pitch, Tick, Time } from "./units";

export class MIDI {
  public static PPQ = 96;

  public static WholeNoteTicks = 4 * this.PPQ;
  public static HalfNoteTicks = 2 * this.PPQ;
  public static QuarterNoteTicks = this.PPQ;
  public static EighthNoteTicks = this.PPQ / 2;
  public static SixteenthNoteTicks = this.PPQ / 4;
  public static ThirtySecondNoteTicks = this.PPQ / 8;
  public static SixtyFourthNoteTicks = this.PPQ / 16;

  public static DottedWholeNoteTicks = 3 * this.HalfNoteTicks;
  public static DottedHalfNoteTicks = 3 * this.QuarterNoteTicks;
  public static DottedQuarterNoteTicks = 3 * this.EighthNoteTicks;
  public static DottedEighthNoteTicks = 3 * this.SixteenthNoteTicks;
  public static DottedSixteenthNoteTicks = 3 * this.ThirtySecondNoteTicks;
  public static DottedThirtySecondNoteTicks = 3 * this.SixtyFourthNoteTicks;
  public static DottedSixtyFourthNoteTicks = 3 * this.SixtyFourthNoteTicks;

  public static TripletWholeNoteTicks = (2 / 3) * this.WholeNoteTicks;
  public static TripletHalfNoteTicks = (2 / 3) * this.HalfNoteTicks;
  public static TripletQuarterNoteTicks = (2 / 3) * this.QuarterNoteTicks;
  public static TripletEighthNoteTicks = (2 / 3) * this.EighthNoteTicks;
  public static TripletSixteenthNoteTicks = (2 / 3) * this.SixteenthNoteTicks;
  public static TripletThirtySecondNoteTicks =
    (2 / 3) * this.ThirtySecondNoteTicks;
  public static TripletSixtyFourthNoteTicks =
    (2 / 3) * this.SixtyFourthNoteTicks;

  public static ticksToSeconds(ticks: Tick, bpm: BPM): Time {
    return (60 / bpm) * (ticks / this.PPQ);
  }

  public static secondsToTicks(seconds: Time, bpm: BPM): Tick {
    return (seconds * bpm * this.PPQ) / 60;
  }

  // Get all chromatic notes
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
  // Get the value of a rest
  public static Rest = -1;
  public static NoteMin = 0;
  public static NoteMax = 127;

  // Get the MIDI number from a pitch
  public static fromPitch(pitch: string): Note {
    return Frequency(pitch).toMidi();
  }
  // Get the pitch class of a note, e.g. C, C#, D, etc.
  public static toPitchClass(note: Note): string {
    if (note === MIDI.Rest) return "R";
    return MIDI.ChromaticNotes[note % 12];
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

  public static isRest(note: { MIDI: Note }) {
    return note?.MIDI === this.Rest;
  }
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
}
