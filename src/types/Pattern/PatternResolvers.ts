import { isVoiceLeading, PoseOperation } from "types/Pose/PoseTypes";
import { getScaleNoteMidiValue } from "types/Scale/ScaleFunctions";
import { ScaleChain, ScaleId, isMidiNote } from "types/Scale/ScaleTypes";
import { getPatternChordNotes, getPatternMidiChordNotes } from "./PatternUtils";
import { getPatternChordWithNewNotes } from "./PatternUtils";
import {
  transposeStream,
  rotateStream,
  TRANSFORMATIONS,
} from "./PatternTransformers";
import {
  PatternMidiChord,
  PatternBlock,
  PatternMidiBlock,
  PatternStream,
  PatternMidiStream,
  Pattern,
  PatternNote,
  isPatternRest,
} from "./PatternTypes";
import { transposeNoteThroughScales } from "types/Scale/ScaleTransformers";
import { applyVoiceLeadingsToMidiStream } from "types/Clip/PoseClip/PoseClipFunctions";

/** Resolve a `PatternNote` to a `MidiValue` using the `Scales` provided. */
export const resolvePatternNoteToMidi = (
  note: PatternNote,
  scales: ScaleChain = []
) => {
  const chainedNote = transposeNoteThroughScales(note, scales);
  return getScaleNoteMidiValue(chainedNote);
};

/** Resolve a `PatternBlock` to `MIDI` using the `Scales` provided. */
export const resolvePatternBlockToMidi = <T extends PatternBlock>(
  block: T,
  scales: ScaleChain = []
): PatternMidiBlock => {
  if (isPatternRest(block)) return block;
  const notes = getPatternChordNotes(block);
  const indexMap = (scales ?? []).reduce((acc, cur, i) => {
    return { ...acc, [cur.id]: i };
  }, {} as Record<ScaleId, number>);

  return notes.map((note) => {
    // If the note is a MIDI note, return it as is
    if (isMidiNote(note)) return note;

    // If the note doesn't have a scale, realize it within the chromatic scale
    const defaultNote = {
      duration: note.duration,
      velocity: note.velocity,
      MIDI: getScaleNoteMidiValue(note),
    };
    if (!note.scaleId) return defaultNote;

    // Try to find the note's scale in the scale chain
    const scaleIndex = indexMap[note.scaleId];

    // Resolve the note to MIDI using the scales preceding it
    const parentScales = scales.slice(0, scaleIndex + 1);
    const MIDI = resolvePatternNoteToMidi(note, parentScales);
    return { ...defaultNote, MIDI };
  });

  // const chord = getPatternChordWithNewNotes(block, newChord);
  // const midiChord = chord as PatternMidiChord;
  // return getPatternMidiChordNotes(midiChord);
};

/** Resolve a `PatternStream` to MIDI using a `ScaleChain` and `PoseVector` */
export const resolvePatternStreamToMidi = (
  stream: PatternStream,
  scales?: ScaleChain,
  transformations?: PoseOperation[]
): PatternMidiStream => {
  // Get the stream with or without the scales
  let midiStream = stream.map((b) => resolvePatternBlockToMidi(b, scales));

  // Apply all of the pattern transformations
  if (transformations) {
    for (const transformation of transformations) {
      // Apply the chromatic offset
      const N = transformation.vector?.chromatic;
      if (N) {
        midiStream = transposeStream(midiStream, N);
      }

      // Apply the chordal offset
      const t = transformation.vector?.chordal;
      if (t) {
        midiStream = rotateStream(midiStream, t);
      }

      // Apply the octave offset
      const O = transformation.vector?.octave;
      if (O) {
        midiStream = transposeStream(midiStream, 12 * O);
      }

      // Apply any voice leadings
      const v = transformation.vector;
      const isVL = isVoiceLeading(v);
      if (isVL) {
        midiStream = applyVoiceLeadingsToMidiStream(midiStream, [v]);
      }

      // Apply the transformations in order
      for (const operation of transformation.operations ?? []) {
        const callback = TRANSFORMATIONS[operation.id]?.["callback"];
        if (!callback) continue;
        midiStream = callback(midiStream, operation.args);
      }
    }
  }

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
