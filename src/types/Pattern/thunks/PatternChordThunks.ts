import { updatePattern } from "../PatternSlice";
import { Thunk } from "types/Project/ProjectTypes";
import { selectPatternById } from "../PatternSelectors";
import {
  isPatternChord,
  PatternBlock,
  PatternId,
  PatternRest,
  PatternStream,
} from "../PatternTypes";
import {
  getPatternChordNotes,
  getPatternChordWithNewNotes,
} from "../PatternUtils";
import { createUndoType, Payload } from "utils/redux";
import { getPatternBlockDuration } from "../PatternFunctions";
import { inRange, uniqBy } from "lodash";
import { isNestedNote } from "types/Scale/ScaleTypes";
import { createPattern } from "../PatternThunks";
import { getStraightDuration, getTickDuration } from "utils/durations";

export const extractChordsFromPattern =
  ({ data }: Payload<{ id: PatternId; indices: number[] }>): Thunk =>
  (dispatch, getProject) => {
    const { id, indices } = data;
    const undoType = createUndoType("extractChords", data);
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    // Make sure all indices are valid
    const streamLength = pattern.stream.length;
    if (indices.some((_) => isNaN(_) || !inRange(_, 0, streamLength))) return;

    const pattern1Stream: PatternStream = [];
    const pattern2Stream: PatternStream = [];

    // Move chords at the indices to a new pattern
    for (let i = 0; i < streamLength; i++) {
      const block: PatternBlock = pattern.stream[i];
      const rest: PatternRest = { duration: getPatternBlockDuration(block) };
      if (!isPatternChord(block)) {
        pattern1Stream.push(rest);
        pattern2Stream.push(rest);
        continue;
      }
      if (indices.includes(i)) {
        pattern1Stream.push(rest);
        pattern2Stream.push(block);
      } else {
        pattern1Stream.push(block);
        pattern2Stream.push(rest);
      }
    }

    // Update the original pattern
    dispatch(updatePattern({ data: { id, stream: pattern1Stream }, undoType }));

    // Create a new pattern for the extracted chords
    dispatch(
      createPattern({
        data: {
          id,
          name: `${pattern.name ?? "Pattern"} Extraction`,
          stream: pattern2Stream,
        },
        undoType,
      })
    );
  };

/** Subdivide the stream of a pattern. */
export const subdividePattern =
  ({ data }: Payload<PatternId>): Thunk =>
  (dispatch, getProject) => {
    const id = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const stream = [];
    for (const block of pattern.stream) {
      if (!isPatternChord(block)) {
        stream.push(block);
        continue;
      }

      const duration = getPatternBlockDuration(block);
      const durationType = getTickDuration(duration);
      if (getStraightDuration(durationType) === "64th") {
        stream.push(block);
        continue;
      }

      const newChord = getPatternChordWithNewNotes(block, (notes) =>
        notes.map((_) => ({ ..._, duration: duration / 2 }))
      );
      stream.push(newChord);
      stream.push(newChord);
    }

    dispatch(updatePattern({ data: { id, stream } }));
  };

/** Merge the stream of a pattern. */
export const mergePattern =
  ({ data }: Payload<PatternId>): Thunk =>
  (dispatch, getProject) => {
    const id = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const allNotes = pattern.stream
      .filter(isPatternChord)
      .map(getPatternChordNotes)
      .flat();
    const uniqueNotes = uniqBy(allNotes, (note) =>
      isNestedNote(note) ? note.degree : note.MIDI
    );

    const newChord = new Array(uniqueNotes.length).fill(0).map((_, i) => {
      return uniqueNotes[i];
    });

    dispatch(updatePattern({ data: { id, stream: [newChord] } }));
  };

export const flattenPattern =
  ({ data }: Payload<PatternId>): Thunk =>
  (dispatch, getProject) => {
    const id = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const newStream = pattern.stream.flatMap((block) => {
      if (!isPatternChord(block)) return block;
      const notes = getPatternChordNotes(block);
      return notes;
    });

    dispatch(updatePattern({ data: { id, stream: newStream } }));
  };
