import { SixteenthNoteTicks, WholeNoteTicks } from "utils/duration";
import { Seconds } from "types/units";
import { Sampler } from "tone";
import { EighthNoteTicks } from "utils/duration";
import { DEFAULT_VELOCITY, MAX_VELOCITY } from "utils/constants";
import { isEqual, range, sample } from "lodash";
import { PresetScaleList } from "lib/presets/scales";
import { Thunk } from "types/Project/ProjectTypes";
import { getPatternBlockDuration } from "./PatternFunctions";
import { getPatternMidiChordNotes } from "./PatternUtils";
import { selectPatternIds, selectPatternById } from "./PatternSelectors";
import { addPattern, removePattern, updatePattern } from "./PatternSlice";
import {
  defaultPattern,
  PatternId,
  initializePattern,
  PatternMidiChord,
  Pattern,
  PatternNote,
  PatternStream,
} from "./PatternTypes";
import {
  selectTrackScaleChain,
  selectTrackById,
} from "types/Track/TrackSelectors";
import { Payload, unpackData, unpackUndoType } from "types/redux";
import { TrackId } from "types/Track/TrackTypes";
import { getMidiFrequency } from "utils/midi";

/** Creates a pattern and adds it to the slice. */
export const createPattern =
  (
    payload: Payload<Partial<Pattern>> = { data: defaultPattern }
  ): Thunk<Pattern> =>
  (dispatch) => {
    const pattern = payload.data;
    const undoType = unpackUndoType(payload, "createPattern");

    // Initialize a new pattern
    const newPattern = initializePattern({ ...pattern });
    dispatch(addPattern({ data: newPattern, undoType }));

    // Return the id
    return newPattern;
  };

/** Removes a list of patterns from the store. */
export const deletePattern =
  (payload: Payload<PatternId>): Thunk =>
  (dispatch, getProject) => {
    const id = payload.data;
    const undoType = unpackUndoType(payload, "deletePattern");
    const project = getProject();
    const patternIds = selectPatternIds(project);

    // Get the index of the pattern to remove
    const index = patternIds.findIndex((patternId) => patternId === id);
    if (index === -1) return;

    // Remove the pattern
    dispatch(removePattern({ data: id, undoType }));
  };

/** Clear the notes of a pattern. */
export const clearPattern =
  (id: PatternId): Thunk =>
  (dispatch) => {
    dispatch(updatePattern({ id, stream: [] }));
  };

/** Randomize a pattern and give all notes a random pitch, duration, and velocity */
export const randomizePattern =
  (
    payload: Payload<{
      id: PatternId;
      trackId?: TrackId;
      duration?: number;
      clipDuration?: number;
    }>
  ): Thunk<PatternStream> =>
  (dispatch, getProject) => {
    const data = payload.data;
    const { id, trackId } = unpackData(payload);
    const undoType = unpackUndoType(payload, "randomizePattern");
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    // Get the last scale from the track
    const track = trackId ? selectTrackById(project, trackId) : undefined;
    const scaleChain = trackId ? selectTrackScaleChain(project, trackId) : [];
    const scales = track ? scaleChain : Object.values(PresetScaleList);
    const scale = scales[scales.length - 1];
    const scaleId = scale?.id;
    if (!scale) return;

    const neighbors = scales.slice(0, scales.length - 1);
    const neighborChance = neighbors.length ? 0.5 : 0;

    let isStraight = true;
    const firstDuration = getPatternBlockDuration(pattern.stream[0]);
    const durations: number[] = [];

    // Check if the pattern is straight
    if (pattern.stream.length) {
      for (let i = 0; i < pattern.stream.length; i++) {
        const block = pattern.stream[i];
        const duration = getPatternBlockDuration(block);
        durations.push(duration);
        if (i === 0) continue;
        if (duration !== firstDuration) isStraight = false;
      }
    }

    // Pick a random note from the scale for each note in the pattern
    const streamLength = isStraight
      ? (data.clipDuration ?? WholeNoteTicks) /
        (data.duration ?? SixteenthNoteTicks)
      : pattern.stream.length;
    let degrees = range(0, scale.notes.length);
    let stream: PatternStream = [];
    let loopCount = 0;
    for (let i = 0; i < streamLength; i++) {
      if (!degrees.length) degrees.push(...range(0, scale.notes.length));
      const degree = sample(degrees) || 0;
      degrees = degrees.filter((d) => d !== degree);
      const velocity = 100;
      const duration = isStraight
        ? data.duration ?? SixteenthNoteTicks
        : durations[i];

      const neighborSeed = Math.random();
      const isNeighbor = neighborSeed < neighborChance;
      const neighbor = neighbors.at(-1);
      const note: PatternNote = { degree, velocity, duration, scaleId };
      const last = stream[i - 1];
      if (loopCount < 3 && isEqual(last, note)) {
        i--;
        loopCount++;
        continue;
      }
      loopCount = 0;
      if (isNeighbor && neighbor) {
        i++;
        const value = sample([-1, 1]);
        const offset = { [neighbor.id]: value };
        stream.push({ ...note, duration, offset });
      }
      stream.push({ ...note, duration: !isStraight ? durations[i] : duration });
    }
    stream = stream.slice(0, streamLength);

    // Update the pattern
    dispatch(updatePattern({ data: { id, stream }, undoType }));
    return stream;
  };

/** Play a PatternChord with a Sampler at a given time. */
export const playPatternChord = (
  sampler: Sampler,
  chord: PatternMidiChord,
  time: Seconds
) => {
  // Do nothing if the sampler is not loaded
  if (!sampler) return;

  // Get the pitches
  const notes = getPatternMidiChordNotes(chord);
  if (!notes.length) return;

  // Get the Tone.js subdivision
  const duration = getPatternBlockDuration(notes) ?? EighthNoteTicks;
  const subdivision = `${duration}i`;

  // Get the velocity scaled for Tone.js
  const velocity = notes[0].velocity ?? DEFAULT_VELOCITY;
  const scaledVelocity = velocity / MAX_VELOCITY;

  // Play the chord with the sampler
  if (!sampler.loaded) return;
  const pitches = notes.map(getMidiFrequency);
  sampler.triggerAttackRelease(pitches, subdivision, time, scaledVelocity);
};
