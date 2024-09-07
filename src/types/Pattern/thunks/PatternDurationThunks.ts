import { Thunk } from "types/Project/ProjectTypes";
import { selectPatternById } from "../PatternSelectors";
import {
  createSixteenthRest,
  getDurationTicks,
  SixteenthNoteTicks,
  SixtyFourthNoteTicks,
  StraightDurationType,
} from "utils/durations";
import { isPatternChord, PatternId, PatternNote } from "../PatternTypes";
import {
  getPatternChordNotes,
  getPatternChordWithNewNotes,
} from "../PatternUtils";
import { updatePattern } from "../PatternSlice";
import { Payload } from "lib/redux";
import { clamp, sample, shuffle, uniq, uniqBy } from "lodash";
import { getPatternBlockDuration } from "../PatternFunctions";
import { isMidiNote } from "types/Scale/ScaleTypes";
import { getMidiNoteValue } from "utils/midi";

/** Repeat a pattern a certain number of times. */
export const repeatPattern =
  ({ data }: Payload<{ id: PatternId; repeat: number }>): Thunk =>
  (dispatch, getProject) => {
    const { id, repeat } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const stream = new Array(repeat + 1).fill(pattern.stream).flat();
    dispatch(updatePattern({ data: { id, stream } }));
  };

/** Continue a pattern for a certain number of notes. */
export const continuePattern =
  ({ data }: Payload<{ id: PatternId; length: number }>): Thunk =>
  (dispatch, getProject) => {
    const { id, length } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const stream = new Array(length)
      .fill(0)
      .map((_, i) => pattern.stream[i % pattern.stream.length]);
    dispatch(updatePattern({ data: { id, stream } }));
  };

/** Stretch a pattern by a scaling factor. */
export const stretchPattern =
  ({ data }: Payload<{ id: PatternId; factor: number }>): Thunk =>
  (dispatch, getProject) => {
    const { id, factor } = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const stream = pattern.stream.map((block) => {
      const duration = getPatternBlockDuration(block);
      const newDuration = clamp(
        duration * factor,
        SixtyFourthNoteTicks,
        Infinity
      );
      if (!isPatternChord(block)) return { duration: newDuration };
      const notes = getPatternChordNotes(block);
      return notes.map((note) => ({ ...note, duration: newDuration }));
    });

    dispatch(updatePattern({ data: { id, stream } }));
  };

/** Create a random beat out of the unique notes of a pattern. */
export const beatifyPattern =
  ({ data }: Payload<PatternId>): Thunk =>
  (dispatch, getProject) => {
    const id = data;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const flatStream = pattern.stream
      .flatMap((block) => {
        if (isPatternChord(block)) return getPatternChordNotes(block);
        return undefined;
      })
      .filter(Boolean) as PatternNote[];
    const flatSet = uniqBy(flatStream, (note) =>
      isMidiNote(note) ? getMidiNoteValue(note) : JSON.stringify(note)
    );
    const flatPicks = shuffle(flatSet);
    const restChance = 0.2;
    const halfBeat = new Array(8).fill(0).map(() => {
      const note = flatPicks.pop() ?? sample(flatSet);
      if (!note || Math.random() < restChance) return createSixteenthRest();
      return { ...note, duration: SixteenthNoteTicks };
    });
    const beat = [...halfBeat, ...halfBeat];

    return dispatch(updatePattern({ data: { id, stream: beat } }));
  };

/** Randomize the durations of each note */
export const randomizePatternDurations =
  ({ data }: Payload<PatternId>): Thunk =>
  (dispatch, getProject) => {
    const patternId = data;
    const project = getProject();
    const pattern = selectPatternById(project, patternId);
    if (!pattern) return;

    // Create a seeded duration record
    const durationSeeds: Record<StraightDurationType, number> = {
      "64th": 0.025,
      "32nd": 0.1,
      "16th": 0.2,
      eighth: 0.3,
      quarter: 0.2,
      half: 0.1,
      whole: 0.025,
    };

    const sampleDuration = () => {
      let sum = 0;
      let r = Math.random();
      for (const duration in durationSeeds) {
        const type = duration as StraightDurationType;
        sum += durationSeeds[type];
        if (r <= sum) return getDurationTicks(type);
      }
    };

    // Iterate over the pattern
    const stream = pattern.stream.map((block) => {
      if (!isPatternChord(block)) return block;

      // Create a new chord with random velocities
      const sampledDuration = sampleDuration();

      const updatedChord = getPatternChordWithNewNotes(block, (notes) =>
        notes.map((note) => ({
          ...note,
          duration: sampledDuration ?? note.duration,
        }))
      );
      return updatedChord;
    });

    dispatch(updatePattern({ data: { id: patternId, stream } }));
  };

/** Set the durations of the stream of a pattern. */
export const setPatternDurations =
  ({ data }: Payload<{ id: PatternId; duration: number }>): Thunk =>
  (dispatch, getProject) => {
    const { id, duration } = data;
    if (isNaN(duration)) return;

    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    const stream = [...pattern.stream].map((block) => {
      if (!isPatternChord(block)) return block;
      return getPatternChordWithNewNotes(block, (notes) =>
        notes.map((note) => ({ ...note, duration }))
      );
    });

    dispatch(updatePattern({ data: { id, stream } }));
  };
