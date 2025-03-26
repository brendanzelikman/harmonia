import { isVoiceLeading, PoseOperation } from "types/Pose/PoseTypes";
import { getScaleNoteMidiValue } from "types/Scale/ScaleFunctions";
import { ScaleChain, ScaleId, isMidiNote } from "types/Scale/ScaleTypes";
import { getPatternChordNotes } from "./PatternUtils";
import {
  transposeStream,
  rotateStream,
  TRANSFORMATIONS,
} from "./PatternTransformers";
import {
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

  // Pre-compute the index of each scale in the chain
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
      const chromatic = transformation.vector?.chromatic;
      if (chromatic) {
        midiStream = transposeStream(midiStream, chromatic);
      }

      // Apply the chordal offset
      const chordal = transformation.vector?.chordal;
      if (chordal) {
        midiStream = rotateStream(midiStream, chordal);
      }

      // Apply the octave offset
      const octave = transformation.vector?.octave;
      if (octave) {
        midiStream = transposeStream(midiStream, 12 * octave);
      }

      // Apply any voice leadings
      const v = transformation.vector;
      const isVL = isVoiceLeading(v);
      if (isVL) {
        midiStream = applyVoiceLeadingsToMidiStream(midiStream, [v]);
      }

      // Apply any other operations in order
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
