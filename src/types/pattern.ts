import { nanoid } from "@reduxjs/toolkit";
import { ticksToDuration, mod, ticksToToneSubdivision } from "utils";
import { MIDI } from "./midi";
import MusicXML from "./musicxml";
import Scales, {
  Scale,
  ScaleId,
  chromaticScale,
  transposeScale,
} from "./scale";
import { Key, Pitch, Tick, Time, Velocity, XML } from "./units";
import { inRange } from "lodash";
import { Sampler } from "tone";
import { InstrumentKey, isSamplerLoaded } from "./instrument";
import { PresetScaleMap } from "./presets/scales";
import { getScaleKey } from "./key";
import { DemoXML } from "assets/demoXML";

export type PatternId = string;

export interface PatternOptions {
  instrument: InstrumentKey;
  tonic: Pitch;
  scaleId: ScaleId;
  quantizeToScale: boolean;
}
export const defaultPatternOptions: PatternOptions = {
  instrument: "grand_piano",
  tonic: "C",
  scaleId: "chromatic-scale",
  quantizeToScale: false,
};

export interface Pattern {
  id: PatternId;
  stream: PatternStream;
  name: string;
  aliases?: string[];
  options?: Partial<PatternOptions>;
}
export const isPattern = (obj: any): obj is Pattern => {
  const { id, name, stream } = obj;
  return id !== undefined && name !== undefined && stream !== undefined;
};
export type PatternNoId = Omit<Pattern, "id">;
export type PatternMap = Record<PatternId, Pattern>;

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
  options: defaultPatternOptions,
};
export const testPattern = (stream: PatternStream = []) => {
  return {
    id: "test-pattern",
    name: "Test Pattern",
    stream,
  };
};
export const createPatternTag = (pattern: Pattern): string => {
  const streamTag = createPatternStreamTag(pattern.stream);
  return `${pattern.id}:${pattern.name}:${streamTag}`;
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
export const createPatternNoteTag = (note: PatternNote): string => {
  return `${note.MIDI}:${note.duration}:${note.velocity}`;
};

// A pattern chord is a collection of notes that are played at the same time.
export type PatternChord = PatternNote[];
export const isPatternChord = (obj: any): obj is PatternChord => {
  if (!Array.isArray(obj)) return false;
  return obj.every(isPatternNoteValid);
};
export const isPatternChordValid = (chord?: PatternChord) => {
  if (!chord?.length) return false;
  return chord.every(isPatternNoteValid);
};
export const createPatternChordTag = (chord: PatternChord): string => {
  return chord.map(createPatternNoteTag).join(",");
};

// A pattern stream is a collection of pattern chords
export type PatternStream = PatternChord[];
export const isPatternStreamValid = (stream?: PatternStream) => {
  if (!stream) return false;
  return stream.every(isPatternChordValid);
};
export const createPatternStreamTag = (stream: PatternStream): string => {
  return stream.map(createPatternChordTag).join("|");
};

// Validate a pattern through its stream
export const isPatternValid = (pattern?: Pattern) => {
  if (!pattern?.stream) return false;
  return isPatternStreamValid(pattern.stream);
};

// Realize a pattern in a particular scale.
export const realizePattern = (
  pattern: Pattern,
  scale: Scale = chromaticScale
): PatternStream => {
  // Get the pitches of the new scale
  const pitches = scale.notes.map((note) => MIDI.toPitchClass(note));
  const realizedPattern = [];

  // Iterate over the chords of the pattern
  for (let i = 0; i < pattern.stream.length; i++) {
    const chord = pattern.stream[i];
    const realizedChord = [];
    for (let j = 0; j < chord.length; j++) {
      // If the note is a rest, return it as is
      if (MIDI.isRest(chord)) {
        realizedChord.push(...chord);
        break;
      }

      // Get the pitch of the old note
      const note = chord[j];
      const oldPitch = MIDI.toPitchClass(note.MIDI);
      if (pitches.includes(oldPitch)) {
        realizedChord.push(note);
        continue;
      }

      // Find the nearest pitch class in the new scale
      const pitchClass = MIDI.closestPitchClass(
        oldPitch,
        scale.notes,
        getStreamPitches(pattern.stream)
      );
      if (!pitchClass) {
        realizedChord.push(note);
        continue;
      }

      // Compute the offset to adjust the note within the scale
      const oldNumber = MIDI.ChromaticNumber(note.MIDI);
      const newNumber = MIDI.ChromaticNumber(pitchClass);
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
export const getStreamTimelineNotes = (stream?: PatternStream, key?: Key) => {
  if (!stream?.length) return [];
  return stream.map((chord, i) => {
    if (!chord?.length) return [];
    return chord
      .filter((note) => !MIDI.isRest(note))
      .sort((a, b) => b.MIDI - a.MIDI)
      .map((note) => ({
        ...note,
        pitch: MIDI.toPitch(note.MIDI, key),
        start: i,
      })) as TimelineNote[];
  });
};

export const getStreamMidiNotes = (stream?: PatternStream) => {
  if (!stream?.length) return [];
  const flattenedStream = stream.flat();
  const notes = flattenedStream.filter((n) => !MIDI.isRest(n));
  const midiNotes = notes.map(({ MIDI }) => MIDI);
  const sortedNotes = Array.from(new Set(midiNotes.sort((a, b) => a - b)));
  return sortedNotes;
};

// Transpose a pattern stream with respect to a scale by a given number of steps
export const transposePatternStream = (
  stream: PatternStream,
  steps: number,
  scale: Scale = chromaticScale
): PatternStream => {
  if (!stream.length) return stream;
  const transposedStream: PatternStream = [];
  for (let i = 0; i < stream.length; i++) {
    const chord = stream[i];
    const transposedChord = transposePatternChord(chord, steps, scale, stream);
    transposedStream.push(transposedChord);
  }
  return transposedStream;
};

// Transpose a pattern chord with respect to a scale by a given number of steps
export const transposePatternChord = (
  chord: PatternChord,
  steps: number,
  scale: Scale = chromaticScale,
  stream?: PatternStream
): PatternChord => {
  if (!chord.length) return [];
  if (chord.some((note) => MIDI.isRest(note))) return chord;

  // Get the scale pitches and modulus/direction
  const scalePitches = Scales.SortPitches(Scales.Pitches(scale));
  const scaleNotes = scalePitches.map((pitch) => MIDI.fromPitchClass(pitch));
  const modulus = scalePitches.length;
  const direction = steps > 0 ? 1 : -1;

  const transposedChord: PatternChord = [];
  // Iterate over each note in the chord
  for (let i = 0; i < chord.length; i++) {
    const note = chord[i];
    // Get the pitch of the note
    const noteMIDI = note.MIDI;
    const notePitch = MIDI.toPitchClass(noteMIDI);

    // Store a new scale degree and offset
    let newIndex = scalePitches.indexOf(notePitch);
    if (newIndex === -1) {
      const nearestPitch = MIDI.closestPitchClass(
        notePitch,
        scaleNotes,
        getStreamPitches(stream ?? [chord])
      );
      if (!nearestPitch) return chord;
      newIndex = scalePitches.indexOf(nearestPitch);
    }
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
    const newNumber = MIDI.ChromaticNumber(thisPitch);
    const oldNumber = MIDI.ChromaticNumber(notePitch);
    const newMIDI = noteMIDI + newNumber - oldNumber + newOffset;
    transposedChord.push({ ...note, MIDI: newMIDI });
  }
  return transposedChord;
};

// Rotate a pattern stream by a given number of steps
export const rotatePatternStream = (
  stream: PatternStream,
  steps: number
): PatternStream => {
  if (!steps) return stream;
  const scalePitches = getStreamPitches(stream);
  if (!scalePitches.length) return stream;
  const chordScale = {
    id: "",
    name: "",
    notes: scalePitches.map((pitch) => MIDI.ChromaticNumber(pitch) + 60),
  };
  return transposePatternStream(stream, steps, chordScale);
};

// Rotate a pattern chord by a given number of steps
export const rotatePatternChord = (
  chord: PatternChord,
  steps: number
): PatternChord => {
  if (!chord?.length || !steps) return chord;
  const stream = [chord];
  const rotatedStream = rotatePatternStream(stream, steps);
  const rotatedChord = rotatedStream[0];
  return rotatedChord;
};

// Play a chord with a sampler at a given time
export const playPatternChord = (
  sampler: Sampler,
  chord: PatternChord,
  time: Time
) => {
  if (!chord || !chord.length) return;
  if (chord.some((note) => MIDI.isRest(note))) return;
  if (!sampler || !isSamplerLoaded(sampler)) return;

  // Get the pitches
  const pitches = chord.map((note) => MIDI.toPitch(note.MIDI));

  // Get the Tone.js subdivision
  const duration = chord[0].duration ?? MIDI.EighthNoteTicks;
  const subdivision = ticksToToneSubdivision(duration);

  // Get the velocity scaled for TOne.js
  const velocity = chord[0].velocity ?? MIDI.DefaultVelocity;
  const scaledVelocity = velocity / MIDI.MaxVelocity;

  // Play the chord with the sampler
  sampler.triggerAttackRelease(pitches, subdivision, time, scaledVelocity);
};

export default class Patterns {
  static exportToXML(pattern?: Pattern): XML {
    if (!pattern) return DemoXML;

    const { tonic, scaleId, quantizeToScale } = {
      ...defaultPatternOptions,
      ...pattern.options,
    };

    const scale = quantizeToScale
      ? PresetScaleMap[scaleId] ?? chromaticScale
      : chromaticScale;

    const tonicDistance = MIDI.ChromaticDistance(tonic, scale.notes[0]);
    const tonicizedScale = transposeScale(scale, tonicDistance) as Scale;
    const key = getScaleKey(tonicizedScale);
    const stream = realizePattern(pattern, tonicizedScale);

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
        key,
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
