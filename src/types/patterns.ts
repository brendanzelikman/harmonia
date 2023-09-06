import { nanoid } from "@reduxjs/toolkit";
import { ticksToDuration, mod } from "utils";
import { MIDI } from "./midi";
import MusicXML from "./musicxml";
import Scales, { Scale, chromaticScale } from "./scales";
import { Pitch, Tick, Velocity, XML } from "./units";
import { inRange } from "lodash";

export type PatternId = string;

export interface Pattern {
  id: PatternId;
  stream: PatternStream;
  name: string;
  aliases?: string[];
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

// A pattern note is defined by a MIDI number, a velocity, and a duration in ticks
export type PatternNote = {
  MIDI: number;
  duration: Tick;
  velocity: Velocity;
};
export const isPatternNoteValid = (note: PatternNote) => {
  return MIDI.isRest(note) || inRange(note.MIDI, MIDI.MinNote, MIDI.MaxNote);
};

// A pattern chord is a collection of notes that are played at the same time.
export type PatternChord = PatternNote[];
export const isPatternChordValid = (chord?: PatternChord) => {
  if (!chord?.length) return false;
  return chord.every(isPatternNoteValid);
};

// A pattern stream is a collection of pattern chords
export type PatternStream = PatternChord[];
export const isPatternStreamValid = (stream?: PatternStream) => {
  if (!stream) return false;
  return stream.every(isPatternChordValid);
};

// Validate a pattern through its stream
export const isPatternValid = (pattern?: Pattern) => {
  if (!pattern?.stream) return false;
  return isPatternStreamValid(pattern.stream);
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
      const pitchClass = MIDI.closestPitchClass(oldPitch, scale.notes);
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
export interface TimelineNote extends PatternNote {
  pitch: Pitch;
  start: Tick;
}
export const getStreamTimelineNotes = (stream: PatternStream) => {
  if (!stream?.length) return [];
  return stream.map((chord, i) => {
    if (!chord?.length) return [];
    return chord
      .filter((note) => !MIDI.isRest(note))
      .sort((a, b) => b.MIDI - a.MIDI)
      .map((note) => ({
        ...note,
        pitch: MIDI.toPitch(note.MIDI),
        start: i,
      })) as TimelineNote[];
  });
};

// Transpose a pattern stream with respect to a scale by a given number of steps
export const transposePatternStream = (
  stream: PatternStream,
  steps: number,
  scale = chromaticScale
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
      const clampedMIDI = MIDI.clampNote(newMIDI);
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
  static exportToXML(pattern?: Pattern, scale: Scale = chromaticScale): XML {
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
}
