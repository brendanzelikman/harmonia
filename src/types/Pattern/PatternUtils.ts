import { MidiScale, getMidiDegree, getMidiValue } from "utils/midi";
import {
  PatternBlock,
  PatternChord,
  PatternMidiBlock,
  PatternMidiChord,
  PatternMidiNote,
  PatternMidiStream,
  PatternNote,
  PatternRest,
  PatternStream,
  isPatternMidiChord,
  isPatternMidiStream,
  isPatternRest,
  isPatternStrummedChord,
  isPatternStrummedMidiChord,
} from "./PatternTypes";
import { Chords } from "assets/patterns";
import { initializeScale } from "types/Scale/ScaleTypes";
import { STAFF_PIVOT } from "utils/xml";
import { isNumber } from "types/utils";
import { range } from "utils/array";

// ------------------------------------------------------------
// Pattern Chord Helpers
// ------------------------------------------------------------

/** Replace a rest with a note or push a note to a chord */
export const addNoteToBlock = (
  block: PatternBlock,
  note: PatternNote
): Exclude<PatternBlock, PatternRest> => {
  if (Array.isArray(block)) return [...block, note];
  if (isPatternStrummedChord(block)) {
    return { ...block, chord: [...block.chord, note] };
  }
  return [note];
};

/** Replace a rest with a MIDI note or push a note to a chord */
export const addMidiNoteToBlock = (
  block: PatternMidiBlock,
  note: PatternMidiNote
): Exclude<PatternMidiChord, PatternRest> => {
  if (Array.isArray(block)) return [...block, note];
  if (isPatternStrummedMidiChord(block)) {
    return { ...block, chord: [...block.chord, note] };
  }
  return [note];
};

/** Get a `PatternChord` as an array of notes. */
export const getPatternChordNotes = (chord: PatternChord) => {
  if (Array.isArray(chord)) return chord;
  if (isPatternStrummedChord(chord)) return chord.chord;
  return [chord];
};

/** Get a `PatternMidiChord` as an array of notes. */
export const getPatternMidiChordNotes = (chord: PatternMidiChord) => {
  if (Array.isArray(chord)) return chord;
  if (isPatternStrummedChord(chord)) return chord.chord;
  return [chord];
};

/** Get a `PatternBlock` as an array of notes. */
export const getPatternBlockNotes = (block: PatternBlock) => {
  if (isPatternRest(block)) return [];
  return getPatternChordNotes(block);
};

/** Get a `PatternStream` as an array of notes. */
export const getPatternStreamNotes = (stream: PatternStream) => {
  return stream.flatMap(getPatternBlockNotes);
};

/** Update the notes of a `PatternChord` */
export const getPatternChordWithNewNotes = (
  chord: PatternChord,
  _notes: PatternNote[] | ((_note: PatternNote[]) => PatternNote[])
): PatternChord => {
  const notes = Array.isArray(_notes)
    ? _notes
    : _notes(getPatternChordNotes(chord));
  if (Array.isArray(chord)) return notes;
  if (isPatternStrummedChord(chord)) return { ...chord, chord: notes };
  return [notes[0]];
};

/** Update the notes of a `PatternMidiChord` */
export const getPatternMidiChordWithNewNotes = (
  chord: PatternMidiChord,
  _notes: PatternMidiNote[] | ((_note: PatternMidiNote[]) => PatternMidiNote[])
): PatternMidiChord => {
  const notes = Array.isArray(_notes)
    ? _notes
    : _notes(getPatternMidiChordNotes(chord));
  if (Array.isArray(chord)) return notes;
  if (isPatternStrummedChord(chord)) return { ...chord, chord: notes };
  return [notes[0]];
};

/** Update the notes of a `PatternBlock` */
export const getPatternBlockWithNewNotes = (
  block: PatternBlock,
  _notes?: PatternNote[] | ((_note: PatternNote[]) => PatternNote[]),
  restHandler?: (block: PatternRest) => PatternRest
): PatternBlock => {
  if (restHandler && isPatternRest(block)) {
    return restHandler?.(block) ?? block;
  }
  if (_notes === undefined || isPatternRest(block)) return block;
  return getPatternChordWithNewNotes(block, _notes);
};

/** Update the notes of a `PatternMidiBlock` */
export const getPatternMidiBlockWithNewNotes = (
  block: PatternMidiBlock,
  _notes?:
    | PatternMidiNote[]
    | ((_note: PatternMidiNote[]) => PatternMidiNote[]),
  restHandler?: (block: PatternRest) => PatternRest
): PatternMidiBlock => {
  if (restHandler && isPatternRest(block)) {
    return restHandler?.(block) ?? block;
  }
  if (_notes === undefined || isPatternRest(block)) return block;
  return getPatternMidiChordWithNewNotes(block, _notes);
};

/** Update the notes of a `PatternStream` */
export const getPatternStreamWithNewNotes = (
  stream: PatternStream,
  _notes?: PatternNote[] | ((_note: PatternNote[]) => PatternNote[]),
  restHandler?: (block: PatternRest) => PatternRest
): PatternStream => {
  return stream.map((block) =>
    getPatternBlockWithNewNotes(block, _notes, restHandler)
  );
};

/** Update the notes of a `PatternMidiStream` */
export const getPatternMidiStreamWithNewNotes = (
  stream: PatternMidiStream,
  _notes: PatternMidiNote[] | ((_note: PatternMidiNote[]) => PatternMidiNote[]),
  restHandler?: (block: PatternRest) => PatternRest
): PatternMidiStream => {
  return stream.map((block) =>
    getPatternMidiBlockWithNewNotes(block, _notes, restHandler)
  );
};

// ------------------------------------------------------------
// Pattern Midi Stream Helpers
// ------------------------------------------------------------

/** Get a `PatternMidiStream` flattened into an array of `PatternMidiNotes` */
export const flattenMidiStreamNotes = (stream: PatternMidiStream) => {
  const chords = stream.filter(isPatternMidiChord);
  return chords.flatMap((c) => (isPatternStrummedChord(c) ? c.chord : c));
};

/** Get a `PatternMidiStream` flattened into an array of `MIDIValues` */
export const flattenMidiStreamValues = (
  stream: PatternMidiStream
): MidiScale => {
  return flattenMidiStreamNotes(stream)
    .map((n) => n?.MIDI ?? undefined)
    .filter(isNumber);
};

export const getMidiStreamStaves = (stream: PatternMidiStream) => {
  const values = flattenMidiStreamValues(stream);
  const hasTreble = values.some((v) => v >= STAFF_PIVOT);
  const hasBass = values.some((v) => v < STAFF_PIVOT);
  return hasTreble && hasBass ? "grand" : hasBass ? "bass" : "treble";
};

/** Get the intrinsic scale of a `PatternMidiStream` */
export const getMidiStreamScale = (
  stream: MidiScale | PatternMidiStream
): MidiScale => {
  const flatValues = isPatternMidiStream(stream)
    ? flattenMidiStreamNotes(stream)
    : stream;
  const scale = flatValues.map(getMidiValue).sort((a, b) => a - b);
  const notes = [scale[0]];
  const root = notes[0];
  for (let i = 1; i < scale.length; i++) {
    let note = scale[i];
    if (root % 12 === note % 12) {
      continue;
    }
    while (note - root > 12) {
      note -= 12;
    }
    notes.push(note);
  }
  return notes.sort((a, b) => a - b);
};

export const PatternChords = Object.values(Chords).flat();
export const ChordStreams = PatternChords.map(
  (p) => p.stream
) as PatternMidiStream[];
export const PatternScales = PatternChords.map((p) =>
  initializeScale({
    name: p.name,
    aliases: p.aliases,
    notes: getMidiStreamScale(p.stream as PatternMidiStream),
  })
);
export const PatternScaleNotes = ChordStreams.map(getMidiStreamScale);

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

export const getMidiStreamMinMax = (stream: PatternMidiStream) => {
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
