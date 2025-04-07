import { isNumber } from "lodash";
import { getScaleNoteMidiValue, getScaleNotes } from "./ScaleFunctions";
import {
  transposeNoteThroughScales,
  transposeNoteThroughScale,
} from "./ScaleTransformers";
import { ScaleNote, Scale, NestedNote, ScaleVector } from "./ScaleTypes";
import { MidiScale } from "utils/midi";

/** Resolve a `ScaleNote` to a `MidiNoteValue` using the `Scales` provided. */
export const resolveScaleNoteToMidi = (note: ScaleNote, scales: Scale[]) => {
  const chainedNote = transposeNoteThroughScales(note, scales);
  return getScaleNoteMidiValue(chainedNote);
};

/** Resolve a `Scale` to an array of `MidiNoteValues`. */
export const resolveScaleToMidi = (scale?: Scale): MidiScale => {
  if (!scale) return [];
  const notes = getScaleNotes(scale);
  return notes.map(getScaleNoteMidiValue);
};

/** Resolve a list of `Scales` to an array of `MidiNoteValues`, starting from the end. */
export const resolveScaleChainToMidi = (scales: Scale[]): MidiScale => {
  const allScales = [...scales];
  const scaleCount = allScales.length;
  if (scaleCount === 1) return resolveScaleToMidi(allScales[0]);

  // Get the last scale in the array
  let cur = allScales.pop();
  if (cur === undefined) return [];

  // Transpose the scale through itself to apply its own offsets
  const id = "id" in cur ? cur.id : undefined;
  if (id !== undefined) {
    cur = getScaleNotes(cur)
      .map((_, i): NestedNote => {
        const offset: ScaleVector = {};
        if (!isNumber(_) && "offset" in _) {
          offset[id] = _.offset?.[id];
        }
        return { degree: i, offset };
      })
      .map((note) => transposeNoteThroughScale(note, cur));
  }

  // While there are parents, unpack the scale and apply offsets
  while (allScales.length) {
    const parent = allScales.pop();
    if (!parent) break;

    // Get a new scale by chaining the current notes through the parent
    const curNotes = getScaleNotes(cur);
    cur = curNotes.map((note) => transposeNoteThroughScale(note, parent));
  }

  // Return the notes of the last scale applied to the chromatic scale
  return resolveScaleToMidi(cur);
};
