import { Thunk } from "types/Project/ProjectTypes";
import { updatePattern } from "../PatternSlice";
import { selectPatternById } from "../PatternSelectors";
import { isPatternChord, PatternId, PatternNote } from "../PatternTypes";
import { inRange, shuffle } from "lodash";
import {
  getPatternChordNotes,
  getPatternChordWithNewNotes,
} from "../PatternUtils";
import { Payload } from "types/redux";
import { isBounded } from "utils/math";

/** Set the velocities of the notes in a pattern. */
export const setPatternVelocities =
  ({ data }: Payload<{ id: PatternId; velocity: number }>): Thunk =>
  (dispatch, getProject) => {
    const { id, velocity } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;
    const stream = pattern.stream.map((block) => {
      if (!isPatternChord(block)) return block;
      return getPatternChordWithNewNotes(block, (notes) =>
        notes.map((note) => ({ ...note, velocity }))
      );
    });
    dispatch(updatePattern({ data: { id, stream } }));
  };

/** Graduate the velocities of the stream of a pattern. */
export const graduatePatternVelocities =
  ({
    data,
  }: Payload<{
    id: PatternId;
    startIndex: number;
    endIndex: number;
    startVelocity: number;
    endVelocity: number;
  }>): Thunk =>
  (dispatch, getProject) => {
    const { id, startIndex, endIndex, startVelocity, endVelocity } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;
    const streamLength = pattern.stream.length;

    if (!isBounded(startIndex, 0, streamLength - 1)) return;
    if (!isBounded(endIndex, 0, streamLength - 1)) return;
    if (!isBounded(startVelocity, 0, 127)) return;
    if (!isBounded(endVelocity, 0, 127)) return;

    const velocityRange = endVelocity - startVelocity;
    const stepCount = endIndex - startIndex + 1;
    const stepSize = velocityRange / Math.max(stepCount - 1, 1);

    const stream = pattern.stream.map((block, i) => {
      if (!inRange(i, startIndex, endIndex + 1)) return block;
      if (!isPatternChord(block)) return block;
      const offset = i - startIndex;
      const velocity = startVelocity + Math.round(offset * stepSize);
      return getPatternChordWithNewNotes(block, (notes) =>
        notes.map((note) => ({ ...note, velocity }))
      );
    });
    dispatch(updatePattern({ data: { id, stream } }));
  };

/** Shuffle the velocities of a pattern. */
export const shufflePatternVelocities =
  ({ data }: Payload<{ id: PatternId }>): Thunk =>
  (dispatch, getProject) => {
    const { id } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    // Get all notes in the pattern
    const notes = pattern.stream
      .filter(isPatternChord)
      .map(getPatternChordNotes)
      .flat();
    const shuffledNotes = shuffle(notes);
    const shuffledStream = [];

    // Iterate over the pattern
    for (const block of pattern.stream) {
      // Push the rests as is
      if (!isPatternChord(block)) {
        shuffledStream.push(block);
        continue;
      }

      // Return the updated chord
      const updatedChord = getPatternChordWithNewNotes(
        block,
        (notes) =>
          notes
            .map((note) => {
              const shuffledNote = shuffledNotes.pop();
              if (!shuffledNote) return undefined;
              return { ...note, velocity: shuffledNote.velocity };
            })
            .filter(Boolean) as PatternNote[]
      );
      shuffledStream.push(updatedChord);
    }

    dispatch(updatePattern({ data: { id, stream: shuffledStream } }));
  };

/** Randomize the velocities of each note */
export const randomizePatternVelocities =
  (id: PatternId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    // Iterate over the pattern
    const stream = pattern.stream.map((block) => {
      if (!isPatternChord(block)) return block;

      // Create a new chord with random velocities
      const notes = getPatternChordNotes(block);
      const updatedNotes = notes.map((note) => ({
        ...note,
        velocity: Math.round(Math.random() * 127),
      }));

      const updatedChord = getPatternChordWithNewNotes(block, updatedNotes);
      return updatedChord;
    });

    dispatch(updatePattern({ data: { id, stream } }));
  };
