import { range } from "lodash";
import { MidiScale, getMidiDegree, getMidiNoteValue } from "utils/midi";
import {
  PatternChord,
  PatternMidiChord,
  PatternMidiStream,
  PatternNote,
  isPatternChord,
  isPatternMidiChord,
  isPatternMidiStream,
  isPatternStrummedChord,
} from "./PatternTypes";
import { Chords } from "assets/patterns";

// ------------------------------------------------------------
// Pattern Chord Helpers
// ------------------------------------------------------------

/** Get a `PatternChord` as an array of notes. */
export const getPatternChordNotes = (chord: PatternChord) => {
  if (!isPatternChord(chord)) return [];
  if (isPatternStrummedChord(chord)) return chord.chord;
  if (Array.isArray(chord)) return chord;
  return [chord];
};

/** Get a `PatternMidiChord` as an array of notes. */
export const getPatternMidiChordNotes = (chord: PatternMidiChord) => {
  if (!isPatternMidiChord(chord)) return [];
  if (isPatternStrummedChord(chord)) return chord.chord;
  if (Array.isArray(chord)) return chord;
  return [chord];
};

/** Update the notes of a `PatternChord` */
export const getPatternChordWithNewNotes = (
  chord: PatternChord,
  _notes: PatternNote[] | ((_note: PatternNote[]) => PatternNote[])
): PatternChord => {
  const notes = Array.isArray(_notes)
    ? _notes
    : _notes(getPatternChordNotes(chord));
  if (!isPatternChord(chord)) return chord;
  if (isPatternStrummedChord(chord)) return { ...chord, chord: notes };
  if (Array.isArray(chord)) return notes;
  return [notes[0]];
};

// ------------------------------------------------------------
// Pattern Midi Stream Helpers
// ------------------------------------------------------------

/** Get a `PatternMidiStream` flattened into an array of `PatternMidiNotes` */
export const flattenMidiStreamNotes = (stream: PatternMidiStream) => {
  const chords = stream.filter(isPatternMidiChord);
  return chords.map((c) => (isPatternStrummedChord(c) ? c.chord : c)).flat();
};

/** Get a `PatternMidiStream` flattened into an array of `MIDIValues` */
export const flattenMidiStreamValues = (
  stream: PatternMidiStream
): MidiScale => {
  return flattenMidiStreamNotes(stream).map((n) => n.MIDI);
};

/** Get the intrinsic scale of a `PatternMidiStream` */
export const getMidiStreamScale = (
  stream: MidiScale | PatternMidiStream
): MidiScale => {
  const flatValues = isPatternMidiStream(stream)
    ? flattenMidiStreamNotes(stream)
    : stream;
  const basicValues = flatValues.map(getMidiNoteValue);
  return [...new Set(basicValues)].sort((a, b) => a - b);
};

export const PatternChords = Object.values(Chords).flat();
export const ChordStreams = PatternChords.map(
  (p) => p.stream
) as PatternMidiStream[];
export const PatternScales = ChordStreams.map(getMidiStreamScale);

/** Get the intrinsic scale of a `PatternMidiStream` */
export const getMidiStreamIntrinsicScale = (
  stream: MidiScale | PatternMidiStream
): MidiScale => {
  const flatValues = isPatternMidiStream(stream)
    ? flattenMidiStreamNotes(stream)
    : stream;
  const basicValues = flatValues.map(getMidiDegree);
  return [...new Set(basicValues)].sort((a, b) => a - b);
};

export const getMidiStreamMinMax = (stream?: PatternMidiStream) => {
  if (!stream) return { min: 0, max: 0 };
  const values = flattenMidiStreamValues(stream);
  return { min: Math.min(...values), max: Math.max(...values) };
};

/** Get a range of `MidiValues` bounded by the lowest and highest notes of a `PatternMidiStream`. */
export const getMidiStreamRange = (stream?: PatternMidiStream) => {
  if (!stream) return [];
  const streamChord = flattenMidiStreamNotes(stream);
  if (!streamChord.length) return [];
  const min = Math.min(...streamChord.map((n) => n.MIDI));
  const max = Math.max(...streamChord.map((n) => n.MIDI));
  return range(min, max + 1);
};
