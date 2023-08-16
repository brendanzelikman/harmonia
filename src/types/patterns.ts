import { nanoid } from "@reduxjs/toolkit";
import { MAX_SUBDIVISION } from "appConstants";
import { beatsToDuration, closestPitchClass, mod } from "appUtil";
import { MIDI } from "./midi";
import MusicXML from "./musicxml";
import Scales, { Scale } from "./scales";
import { Pitch, Time, XML } from "./units";
import { PresetPatterns } from "./presets/patterns";
import { ChromaticScale } from "./presets/scales";
import MidiWriter from "midi-writer-js";

// A pattern is a melodic unit that can be used in a track.
// It contains a collection of notes that are played in a particular scale.
// If the degrees of the notes are outside the scale, they are transposed
export type PatternId = string;

export interface Pattern {
  id: PatternId;
  name: string;
  stream: PatternStream;
}
export type PatternNoId = Omit<Pattern, "id">;

export const initializePattern = (
  pattern: Partial<PatternNoId> = defaultPattern
): Pattern => ({
  ...defaultPattern,
  ...pattern,
  id: nanoid(),
});

export const defaultPattern: Pattern = {
  id: "new-pattern",
  name: "New Pattern",
  stream: [],
};

// A pattern note is defined by a MIDI number and a duration
export type MIDINote = {
  MIDI: number;
  duration: number;
};

export type PatternNote = MIDINote;
export const isRest = (note: PatternNote) => note?.MIDI === MIDI.Rest;

// A pattern chord is a collection of notes that are played at the same time.
export type PatternChord = PatternNote[];

// A pattern stream is a collection of pattern chords
export type PatternStream = PatternChord[];

// Realize a pattern in a particular scale.
export const realizePattern = (
  pattern: Pattern,
  scale: Scale
): PatternStream => {
  // Get the pitches of the new scale
  const pitches = scale.notes.map((note) => MIDI.toPitchClass(note));
  const realizedPattern = [];

  // Iterate over the chords of the pattern
  for (let i = 0; i < pattern.stream.length; i++) {
    const chord = pattern.stream[i];
    const realizedChord = [];
    for (let j = 0; j < chord.length; j++) {
      const note = chord[j];

      // If the note is a rest, return it as is
      if (isRest(note)) {
        realizedChord.push(note);
        break;
      }

      // Get the pitch of the old note
      const oldPitch = MIDI.toPitchClass(note.MIDI);
      if (pitches.includes(oldPitch)) {
        realizedChord.push(note);
        continue;
      }

      // Find the nearest pitch class in the new scale
      const pitchClass = closestPitchClass(oldPitch, scale.notes);
      if (!pitchClass) {
        realizedChord.push(note);
        continue;
      }

      // Compute the offset to adjust the note within the scale
      const oldNumber = MIDI.ChromaticNumber(note.MIDI);
      const newNumber = MIDI.ChromaticNotes.indexOf(pitchClass);
      const offset = newNumber - oldNumber;

      // Return the new note
      realizedChord.push({ ...note, MIDI: note.MIDI + offset });
    }
    realizedPattern.push(realizedChord);
  }
  return realizedPattern;
};

// Get the scalar pitches of a stream
export const getStreamPitches = (stream: PatternStream): Pitch[] => {
  const notes = stream.flat().filter((note) => !isRest(note));
  const pitches = notes.map((note) => MIDI.toPitchClass(note.MIDI));
  const uniquePitches = [...new Set(pitches)];
  return Scales.SortPitches(uniquePitches);
};

// Get the duration of a stream
export const getStreamDuration = (stream: PatternStream): Time => {
  if (!stream || stream.length === 0) return 0;
  return stream.reduce((pre, cur) => pre + cur?.[0]?.duration ?? 0, 0);
};

// Get the chord of a stream at a given offset
export const getStreamChordAtOffset = (stream: PatternStream, offset: Time) => {
  let currentOffset = 0;
  for (let i = 0; i < stream.length; i++) {
    if (currentOffset > offset) return [];
    const chord = stream[i];
    if (!chord || !chord.length) return [];
    if (currentOffset === offset) return chord;
    currentOffset += chord[0].duration;
  }
  return [];
};

// Get all rhythmic pitches of a stream
export const getStreamRhythmicPitchClasses = (
  stream: PatternStream
): Pitch[][] => {
  if (!stream?.length) return [];
  return stream.map((chord) => {
    if (!chord?.length) return [];
    return chord
      .filter((note) => !isRest(note))
      .sort((a, b) => b.MIDI - a.MIDI)
      .map((note) => MIDI.toPitchClass(note.MIDI));
  });
};

// Get all rhythmic pitches of a stream
export const getStreamRhythmicPitches = (stream: PatternStream): Pitch[][] => {
  if (!stream?.length) return [];
  return stream.map((chord) => {
    if (!chord?.length) return [];
    return chord
      .filter((note) => !isRest(note))
      .sort((a, b) => b.MIDI - a.MIDI)
      .map((note) => MIDI.toPitch(note.MIDI));
  });
};

// Transpose a pattern stream with respect to a scale by a given number of steps
export const transposePatternStream = (
  stream: PatternStream,
  steps: number,
  scale = ChromaticScale
): PatternStream => {
  // Get the scale pitches
  const scalePitches = Scales.SortPitches(Scales.Pitches(scale));
  const modulus = scalePitches.length;
  const direction = steps > 0 ? 1 : -1;

  // Iterate over each chord in the pattern stream
  const transposedStream: PatternStream = [];
  for (let i = 0; i < stream.length; i++) {
    const chord = stream[i];
    const transposedChord: PatternChord = [];

    // Iterate over each note in the chord
    for (let j = 0; j < chord.length; j++) {
      const note = chord[j];

      // Return the note if it is a rest
      if (isRest(note)) {
        transposedChord.push(note);
        j = chord.length;
        continue;
      }

      // Get the pitch of the note
      const noteMIDI = note.MIDI;
      const notePitch = MIDI.toPitchClass(noteMIDI);

      // Store a new scale degree and offset
      let newIndex = scalePitches.indexOf(notePitch);
      let newOffset = 0;

      // Transpose incrementally
      for (let t = 0; t < Math.abs(steps); t++) {
        // Compute the next index, wrapping around the modulus
        const nextIndex = mod(newIndex + direction, modulus);
        // Compute the new offset
        if (direction > 0 && nextIndex <= newIndex) newOffset += 12;
        if (direction < 0 && nextIndex >= newIndex) newOffset -= 12;
        // Update the index
        newIndex = nextIndex;
      }
      // Add the scalar offset and the octave offset
      const thisPitch = scalePitches[newIndex];
      const newNumber = MIDI.ChromaticNotes.indexOf(thisPitch);
      const oldNumber = MIDI.ChromaticNotes.indexOf(notePitch);
      const newMIDI = noteMIDI + newNumber - oldNumber + newOffset;
      transposedChord.push({ ...note, MIDI: newMIDI });
    }
    transposedStream.push(transposedChord);
  }
  return transposedStream;
};

// Invert a pattern stream by a given number of steps
export const rotatePatternStream = (
  stream: PatternStream,
  steps: number
): PatternStream => {
  // Avoid unnecessary work
  if (steps === 0) return stream;

  // Get the underlying scale pitches of the pattern
  const scalePitches = getStreamPitches(stream);
  if (!scalePitches.length) return stream;
  const chordScale = {
    id: "",
    name: "",
    notes: scalePitches.map((pitch) => MIDI.ChromaticNumber(pitch) + 60),
  };
  return transposePatternStream(stream, steps, chordScale);
};

export default class Patterns {
  static exportToMIDI(pattern: Pattern) {
    const stream = pattern.stream;
    const track = new MidiWriter.Track();
    let wait: MidiWriter.Duration[] = [];

    // Add stream
    for (let i = 0; i < stream.length; i++) {
      const chord = stream[i];
      if (!chord.length) continue;

      // Compute duration
      const duration = `${16 / chord[0].duration}` as MidiWriter.Duration;
      if (isRest(chord[0])) {
        wait.push(duration);
        continue;
      }

      // Compute pitch array
      const pitch = isRest(chord[0])
        ? ([] as MidiWriter.Pitch[])
        : (chord.map((n) => MIDI.toPitch(n.MIDI)) as MidiWriter.Pitch[]);

      // Create event
      const event = new MidiWriter.NoteEvent({
        pitch,
        duration,
        wait: [...wait],
      });

      // Add event
      track.addEvent(event);

      // Clear wait if not a rest
      if (!isRest(chord[0]) && wait.length) wait.clear();
    }
    const writer = new MidiWriter.Writer(track);
    const blob = new Blob([writer.buildFile()], {
      type: "audio/midi",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pattern.name || "pattern"}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  }

  static exportToXML(pattern?: Pattern, scale?: Scale): XML {
    if (!pattern || !scale) return "";
    const stream = realizePattern(pattern, scale);

    let measures: string[] = [];
    let measureNotes: string[] = [];
    let duration = 0;

    for (const chord of stream) {
      if (duration >= MAX_SUBDIVISION) {
        const measure = MusicXML.createMeasure(
          measureNotes,
          measures.length + 1
        );
        measures.push(measure);
        measureNotes = [];
        duration = 0;
      }
      const chordNotes = chord.map((note) => note.MIDI);
      const firstNote = chord[0];
      const xmlNote = MusicXML.createChord(chordNotes, {
        duration: firstNote?.duration,
        type: beatsToDuration(firstNote?.duration),
      });
      measureNotes.push(xmlNote);
      duration += firstNote?.duration;
    }

    if (measureNotes.length) {
      const measure = MusicXML.createMeasure(measureNotes, measures.length + 1);
      measures.push(measure);
    } else if (!measures.length) {
      const measure = MusicXML.createMeasure([]);
      measures.push(measure);
    }

    // Create part
    const id = `pattern`;
    const part = MusicXML.createPart(id, measures);
    const scorePart = MusicXML.createScorePart(id);
    const partList = MusicXML.createPartList([scorePart]);

    // Create score
    const score = MusicXML.createScore(partList, [part]);

    // Return the XML
    return MusicXML.serialize(score);
  }

  static BasicChords = [
    PresetPatterns.MajorChord,
    PresetPatterns.MinorChord,
    PresetPatterns.DiminishedChord,
    PresetPatterns.AugmentedChord,
    PresetPatterns.MajorSeventhChord,
    PresetPatterns.MinorSeventhChord,
    PresetPatterns.DominantSeventhChord,
    PresetPatterns.DiminishedSeventhChord,
  ];

  static ExtendedChords = [
    PresetPatterns.MajorNinthChord,
    PresetPatterns.MinorNinthChord,
    PresetPatterns.DominantNinthChord,
    PresetPatterns.MajorEleventhChord,
    PresetPatterns.MinorEleventhChord,
    PresetPatterns.DominantEleventhChord,
    PresetPatterns.MajorThirteenthChord,
    PresetPatterns.MinorThirteenthChord,
    PresetPatterns.DominantThirteenthChord,
  ];

  static FamousChords = [
    PresetPatterns.TristanChord,
    PresetPatterns.MysticChord,
    PresetPatterns.ElektraChord,
    PresetPatterns.FarbenChord,
    PresetPatterns.PurpleHazeChord,
    PresetPatterns.SoWhatChord,
    PresetPatterns.BondChord,
  ];

  static FamousPatterns = [
    PresetPatterns.BachPrelude,
    PresetPatterns.AlbertiBass,
    PresetPatterns.TurkishMarch,
    PresetPatterns.FateMotif,
    PresetPatterns.RevolutionaryEtude,
    PresetPatterns.ZarahustraFanfare,
    PresetPatterns.TheLick,
    PresetPatterns.HappyBirthday,
  ];

  static BasicPatterns = [
    PresetPatterns.MajorArpeggio,
    PresetPatterns.MinorArpeggio,
    PresetPatterns.DiminishedArpeggio,
    PresetPatterns.AugmentedArpeggio,
    PresetPatterns.MajorSeventhArpeggio,
    PresetPatterns.MinorSeventhArpeggio,
    PresetPatterns.DominantSeventhArpeggio,
    PresetPatterns.DiminishedSeventhArpeggio,
  ];

  static ExtendedPatterns = [
    PresetPatterns.MajorNinthArpeggio,
    PresetPatterns.MinorNinthArpeggio,
    PresetPatterns.DominantNinthArpeggio,
    PresetPatterns.MajorEleventhArpeggio,
    PresetPatterns.MinorEleventhArpeggio,
    PresetPatterns.DominantEleventhArpeggio,
    PresetPatterns.MajorThirteenthArpeggio,
    PresetPatterns.MinorThirteenthArpeggio,
    PresetPatterns.DominantThirteenthArpeggio,
  ];

  static BrendansVoicings = [
    PresetPatterns.BZVoicing1,
    PresetPatterns.BZVoicing2,
    PresetPatterns.BZVoicing3,
    PresetPatterns.BZVoicing4,
  ];

  static BasicDurations = [
    PresetPatterns.WholeNote,
    PresetPatterns.DottedWholeNote,
    PresetPatterns.HalfNotes,
    PresetPatterns.DottedHalfNotes,
    PresetPatterns.QuarterNotes,
    PresetPatterns.DottedQuarterNotes,
    PresetPatterns.EighthNotes,
    PresetPatterns.DottedEighthNotes,
    PresetPatterns.SixteenthNotes,
  ];

  static SimpleRhythms = [
    PresetPatterns.EighthAndTwoSixteenths,
    PresetPatterns.TwoSixteenthsAndEighth,
    PresetPatterns.DottedEighthAndSixteenth,
    PresetPatterns.SixteenthAndDottedEighth,
    PresetPatterns.SixteenthEighthSixteenth,
  ];

  static LatinRhythms = [
    PresetPatterns.Habanera,
    PresetPatterns.Tresillo,
    PresetPatterns.Cinquillo,
    PresetPatterns.Baqueteo,
    PresetPatterns.Cascara,
    PresetPatterns.Montuno,
  ];

  static ClavePatterns = [
    PresetPatterns.ThreeTwoSonClave,
    PresetPatterns.TwoThreeSonClave,
    PresetPatterns.ThreeTwoRumbaClave,
    PresetPatterns.TwoThreeRumbaClave,
    PresetPatterns.ThreeTwoBossaNovaClave,
    PresetPatterns.TwoThreeBossaNovaClave,
  ];

  static CustomPatterns = [] as Pattern[];

  static PresetGroups = {
    "Custom Patterns": Patterns.CustomPatterns,
    "Basic Chords": Patterns.BasicChords,
    "Extended Chords": Patterns.ExtendedChords,
    "Famous Chords": Patterns.FamousChords,
    "Brendan's Voicings": Patterns.BrendansVoicings,
    "Basic Patterns": Patterns.BasicPatterns,
    "Extended Patterns": Patterns.ExtendedPatterns,
    "Famous Patterns": Patterns.FamousPatterns,
    "Basic Durations": Patterns.BasicDurations,
    "Simple Rhythms": Patterns.SimpleRhythms,
    "Latin Rhythms": Patterns.LatinRhythms,
    "Clave Patterns": Patterns.ClavePatterns,
  };

  static PresetCategories = Object.keys(
    Patterns.PresetGroups
  ) as (keyof typeof Patterns.PresetGroups)[];

  static Presets: Pattern[] = Object.values(this.PresetGroups).flat();
}
