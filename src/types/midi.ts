import { MAX_SUBDIVISION } from "appConstants";
import { Frequency } from "tone";
import { Note, Pitch } from "types/units";

export class MIDI {
  public static WholeNote = MAX_SUBDIVISION;
  public static HalfNote = MAX_SUBDIVISION / 2;
  public static QuarterNote = MAX_SUBDIVISION / 4;
  public static EighthNote = MAX_SUBDIVISION / 8;
  public static SixteenthNote = MAX_SUBDIVISION / 16;
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
  // Get an array of notes from a start note to an end note
  public static noteSpace(start = 0, end = 127): Note[] {
    return Array.from({ length: end - start + 1 }, (_, i) => i + start);
  }
  // Get a notespace based on pitches
  public static pitchSpace(start: string, end: string): Note[] {
    const startNote = Frequency(start).toMidi();
    const endNote = Frequency(end).toMidi();
    return MIDI.noteSpace(startNote, endNote);
  }
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
}
