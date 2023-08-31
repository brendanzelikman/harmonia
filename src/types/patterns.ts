import { nanoid } from "@reduxjs/toolkit";
import { ticksToDuration, closestPitchClass, mod } from "appUtil";
import { MIDI } from "./midi";
import MusicXML from "./musicxml";
import Scales, { Scale } from "./scales";
import { Pitch, Tick, Time, XML } from "./units";
import { PresetPatterns } from "./presets/patterns";
import { ChromaticScale } from "./presets/scales";
import MidiWriter from "midi-writer-js";
import { clamp, inRange } from "lodash";

export type PatternId = string;

export interface Pattern {
  id: PatternId;
  name: string;
  stream: PatternStream;
}

export const isPattern = (obj: any): obj is Pattern => {
  const { id, name, stream } = obj;
  return id !== undefined && name !== undefined && stream !== undefined;
};
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

// A pattern note is defined by a MIDI number and a duration in ticks
export type PatternNote = {
  MIDI: number;
  duration: Tick; // length of note in ticks
};

// A MIDI note is defined by a MIDI number, a start time in ticks, and a duration in seconds
export type MIDINote = {
  MIDI: number;
  ticks: Tick; // start time in ticks
  duration: Time; // duration of note in seconds
};

// A pattern chord is a collection of notes that are played at the same time.
export type PatternChord = PatternNote[];

// A pattern stream is a collection of pattern chords
export type PatternStream = PatternChord[];

// Validate a pattern
export const isPatternValid = (pattern: Pattern) => {
  if (!pattern) return false;
  return pattern.stream.every((chord) =>
    chord.every((note) => inRange(note.MIDI, MIDI.Rest, MIDI.NoteMax))
  );
};

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
      if (MIDI.isRest(note)) {
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
  const notes = stream.flat().filter((note) => !MIDI.isRest(note));
  const pitches = notes.map((note) => MIDI.toPitchClass(note.MIDI));
  const uniquePitches = [...new Set(pitches)];
  return Scales.SortPitches(uniquePitches);
};

// Get the duration of a stream in ticks
export const getStreamTicks = (stream: PatternStream): Tick => {
  if (!stream || !stream.length) return 1;
  return stream.reduce((pre, cur) => pre + cur?.[0]?.duration ?? 0, 0);
};

// Get all timeline notes of a stream
export type TimelineNote = {
  MIDI: number;
  pitch: Pitch;
  duration: Tick;
  start: Tick;
};
export const getStreamTimelineNotes = (stream: PatternStream) => {
  if (!stream?.length) return [];
  return stream.map((chord, i) => {
    if (!chord?.length) return [];
    return chord
      .filter((note) => !MIDI.isRest(note))
      .sort((a, b) => b.MIDI - a.MIDI)
      .map((note) => ({
        MIDI: note.MIDI,
        pitch: MIDI.toPitch(note.MIDI),
        duration: note.duration,
        start: i,
      })) as TimelineNote[];
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
      if (MIDI.isRest(note)) {
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
      const clampedMIDI = clamp(newMIDI, MIDI.Rest, MIDI.NoteMax);
      transposedChord.push({ ...note, MIDI: clampedMIDI });
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
      if (MIDI.isRest(chord[0])) {
        wait.push(duration);
        continue;
      }

      // Compute pitch array
      const pitch = MIDI.isRest(chord[0])
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
      if (!MIDI.isRest(chord[0]) && wait.length) wait.clear();
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

    let tripletBeam = "begin";
    for (const chord of stream) {
      if (duration >= MIDI.WholeNoteTicks) {
        const measure = MusicXML.createMeasure(
          measureNotes,
          measures.length + 1
        );
        measures.push(measure);
        measureNotes = [];
        duration = 0;
      }
      const chordNotes = chord.map((note) => note.MIDI);
      const firstNote = chord?.[0];
      const isTriplet = MIDI.isTriplet(firstNote);
      const xmlNote = MusicXML.createChord(chordNotes, {
        duration: firstNote?.duration,
        type: ticksToDuration(firstNote?.duration),
        beam: isTriplet ? tripletBeam : undefined,
      });

      if (isTriplet) {
        if (tripletBeam === "begin") tripletBeam = "continue";
        else if (tripletBeam === "continue") tripletBeam = "end";
        else tripletBeam = "begin";
      } else {
        tripletBeam = "begin";
      }
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
    PresetPatterns.Sus2Chord,
    PresetPatterns.Sus4Chord,
    PresetPatterns.QuartalChord,
    PresetPatterns.QuintalChord,
    PresetPatterns.PowerChord,
    PresetPatterns.Octave,
  ];

  static SeventhChords = [
    PresetPatterns.Major7thChord,
    PresetPatterns.Major7thSus2Chord,
    PresetPatterns.Major7thSus4Chord,
    PresetPatterns.Major7thFlat5Chord,
    PresetPatterns.Minor7thChord,
    PresetPatterns.Minor7thSus2Chord,
    PresetPatterns.Minor7thSus4Chord,
    PresetPatterns.Minor7thFlat5Chord,
    PresetPatterns.Dominant7thChord,
    PresetPatterns.Dominant7thFlat5Chord,
    PresetPatterns.Dominant7thSharp5Chord,
    PresetPatterns.Diminished7thChord,
    PresetPatterns.Augmented7thChord,
  ];

  static ExtendedChords = [
    PresetPatterns.Major9thChord,
    PresetPatterns.Major11thChord,
    PresetPatterns.MajorSharp11thChord,
    PresetPatterns.Major13thChord,
    PresetPatterns.Minor9thChord,
    PresetPatterns.Minor11thChord,
    PresetPatterns.MinorSharp11thChord,
    PresetPatterns.Minor13thChord,
    PresetPatterns.Dominant9thChord,
    PresetPatterns.DominantFlat9thChord,
    PresetPatterns.DominantSharp9thChord,
    PresetPatterns.Dominant11thChord,
    PresetPatterns.DominantSharp11thChord,
    PresetPatterns.Dominant13thChord,
  ];

  static FamousChords = [
    PresetPatterns.TristanChord,
    PresetPatterns.MysticChord,
    PresetPatterns.ElektraChord,
    PresetPatterns.FarbenChord,
    PresetPatterns.RiteOfSpringChord,
    PresetPatterns.DreamChord,
    PresetPatterns.KennyBarronMajorChord,
    PresetPatterns.KennyBarronMinorChord,
    PresetPatterns.SoWhatChord,
    PresetPatterns.HendrixChord,
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

  static BasicMelodies = [
    PresetPatterns.StraightMajorArpeggio,
    PresetPatterns.TripletMajorArpeggio,
    PresetPatterns.StraightMinorArpeggio,
    PresetPatterns.TripletMinorArpeggio,
    PresetPatterns.StraightDiminishedArpeggio,
    PresetPatterns.TripletDiminishedArpeggio,
    PresetPatterns.StraightAugmentedArpeggio,
    PresetPatterns.TripletAugmentedArpeggio,
  ];

  static ExtendedMelodies = [
    PresetPatterns.Major7thArpeggio,
    PresetPatterns.Major9thArpeggio,
    PresetPatterns.Major11thArpeggio,
    PresetPatterns.Major13thArpeggio,
    PresetPatterns.Minor7thArpeggio,
    PresetPatterns.Minor9thArpeggio,
    PresetPatterns.Minor11thArpeggio,
    PresetPatterns.Minor13thArpeggio,
    PresetPatterns.Dominant7thArpeggio,
    PresetPatterns.Dominant9thArpeggio,
    PresetPatterns.Dominant11thArpeggio,
    PresetPatterns.Dominant13thArpeggio,
  ];

  static BasicDurations = [
    PresetPatterns.WholeNote,
    PresetPatterns.HalfNotes,
    PresetPatterns.QuarterNotes,
    PresetPatterns.EighthNotes,
    PresetPatterns.SixteenthNotes,
    PresetPatterns.ThirtySecondNotes,
    PresetPatterns.SixtyFourthNotes,
  ];

  static DottedDurations = [
    PresetPatterns.DottedWholeNotes,
    PresetPatterns.DottedHalfNotes,
    PresetPatterns.DottedQuarterNotes,
    PresetPatterns.DottedEighthNotes,
    PresetPatterns.DottedSixteenthNotes,
    PresetPatterns.DottedThirtySecondNotes,
    PresetPatterns.DottedSixtyFourthNotes,
  ];

  static TripletDurations = [
    PresetPatterns.TripletWholeNotes,
    PresetPatterns.TripletHalfNotes,
    PresetPatterns.TripletQuarterNotes,
    PresetPatterns.TripletEighthNotes,
    PresetPatterns.TripletSixteenthNotes,
    PresetPatterns.TripletThirtySecondNotes,
    PresetPatterns.TripletSixtyFourthNotes,
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

  static BellPatterns = [
    PresetPatterns.BellPattern1,
    PresetPatterns.BellPattern2,
    PresetPatterns.BellPattern3,
    PresetPatterns.BellPattern4,
    PresetPatterns.BellPattern5,
    PresetPatterns.BellPattern6,
    PresetPatterns.BellPattern7,
    PresetPatterns.BellPattern8,
    PresetPatterns.BellPattern9,
  ];

  static CustomPatterns = [] as Pattern[];

  static PresetGroups = {
    "Custom Patterns": Patterns.CustomPatterns,
    "Basic Chords": Patterns.BasicChords,
    "Seventh Chords": Patterns.SeventhChords,
    "Extended Chords": Patterns.ExtendedChords,
    "Famous Chords": Patterns.FamousChords,
    "Basic Melodies": Patterns.BasicMelodies,
    "Extended Melodies": Patterns.ExtendedMelodies,
    "Famous Patterns": Patterns.FamousPatterns,
    "Basic Durations": Patterns.BasicDurations,
    "Dotted Durations": Patterns.DottedDurations,
    "Triplet Durations": Patterns.TripletDurations,
    "Simple Rhythms": Patterns.SimpleRhythms,
    "Latin Rhythms": Patterns.LatinRhythms,
    "Clave Patterns": Patterns.ClavePatterns,
    "Bell Patterns": Patterns.BellPatterns,
  };

  static PresetCategories = Object.keys(
    Patterns.PresetGroups
  ) as (keyof typeof Patterns.PresetGroups)[];

  static Presets = Object.values(this.PresetGroups).flat();

  static PresetMap = Patterns.Presets.reduce((acc, pattern) => {
    acc[pattern.id] = pattern;
    return acc;
  }, {} as Record<PatternId, Pattern>);
}
