import { getVector_T, getVector_O, getVector_t } from "utils/vector";
import { PoseVector } from "types/Pose/PoseTypes";
import { getScaleNoteMidiValue } from "types/Scale/ScaleFunctions";
import { ScaleChain, isNestedNote } from "types/Scale/ScaleTypes";
import { getPatternChordNotes, getPatternMidiChordNotes } from "./PatternUtils";
import { getPatternChordWithNewNotes } from "./PatternUtils";
import {
  getTransposedMidiStream,
  getRotatedMidiStream,
} from "./PatternTransformers";
import {
  PatternChord,
  PatternMidiNote,
  PatternMidiChord,
  PatternBlock,
  PatternMidiBlock,
  isPatternChord,
  PatternStream,
  PatternMidiStream,
  Pattern,
  PatternNote,
} from "./PatternTypes";
import { transposeNoteThroughScales } from "types/Scale/ScaleTransformers";

/** Resolve a `PatternNote` to a `MidiValue` using the `Scales` provided. */
export const resolvePatternNoteToMidi = (
  note: PatternNote,
  scales: ScaleChain = []
) => {
  const chainedNote = transposeNoteThroughScales(note, scales);
  return getScaleNoteMidiValue(chainedNote);
};

/** Resolve a `PatternChord` to `MIDI` using the `Scales` provided. */
export const resolvePatternChordToMidi = (
  chord?: PatternChord,
  scales?: ScaleChain
): PatternMidiNote[] => {
  if (!chord) return [];
  const notes = getPatternChordNotes(chord);
  const chordLength = notes.length;
  if (!chordLength) return [];

  const newChord = notes.map((note) => {
    // If the note is a MIDI note, return it as is
    if (!isNestedNote(note)) return note;

    // If the note doesn't have a scale, realize it within the chromatic scale
    const defaultNote = {
      duration: note.duration,
      velocity: note.velocity,
      MIDI: getScaleNoteMidiValue(note),
    };
    if (!scales || !note.scaleId) return defaultNote;

    // Try to find the note's scale in the scale chain
    const scaleIndex = scales.findIndex((s) => s.id === note.scaleId);
    if (scaleIndex < 0) return defaultNote;

    // Resolve the note to MIDI using the scales preceding it
    const parentScales = scales.slice(0, scaleIndex + 1);
    return {
      duration: note.duration,
      velocity: note.velocity,
      MIDI: resolvePatternNoteToMidi(note, parentScales),
    };
  });

  const midiChord = getPatternChordWithNewNotes(
    chord,
    newChord
  ) as PatternMidiChord;
  return getPatternMidiChordNotes(midiChord);
};

/** Resolve a `PatternBlock` to `MIDI` using the `Scales` provided. */
export const resolvePatternBlockToMidi = (
  block: PatternBlock,
  scales?: ScaleChain
): PatternMidiBlock => {
  if (!isPatternChord(block)) return block;
  return resolvePatternChordToMidi(block, scales);
};

/** Resolve a `PatternStream` to MIDI using a `ScaleChain` and `PoseVector` */
export const resolvePatternStreamToMidi = (
  stream: PatternStream,
  scales?: ScaleChain,
  vector?: PoseVector
): PatternMidiStream => {
  if (!stream) return [];

  // Get the stream with or without the scales
  let midiStream = stream.map((b) => resolvePatternBlockToMidi(b, scales));

  // Return the stream if no pose is specified
  if (!vector) return midiStream;

  // Apply the chromatic offset
  const N = getVector_T(vector);
  midiStream = getTransposedMidiStream(midiStream, N);

  // Apply the chordal offset
  const t = getVector_t(vector);
  midiStream = getRotatedMidiStream(midiStream, t);

  // Apply the octave offset
  const O = getVector_O(vector);
  midiStream = getTransposedMidiStream(midiStream, 12 * O);

  // Return the stream
  return midiStream;
};

/** Resolve a `Pattern` to a `PatternMidiStream` using a `ScaleChain` */
export const resolvePatternToMidi = (
  pattern?: Pattern,
  scaleChain?: ScaleChain
): PatternMidiStream => {
  if (!pattern) return [];
  return resolvePatternStreamToMidi(pattern.stream, scaleChain);
};
