import { SixteenthNoteTicks } from "utils/duration";
import { Seconds } from "types/units";
import { Frequency, Sampler } from "tone";
import { EighthNoteTicks } from "utils/duration";
import { DEFAULT_VELOCITY, MAX_VELOCITY } from "utils/constants";
import { range, sample } from "lodash";
import { PresetScaleList } from "assets/scales";
import { Thunk } from "types/Project/ProjectTypes";
import { ScaleVector } from "types/Scale/ScaleTypes";
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
import { selectNewMotifName } from "types/Timeline/TimelineSelectors";
import {
  selectTrackScaleChain,
  selectTrackById,
} from "types/Track/TrackSelectors";
import { Payload, unpackData, unpackUndoType } from "types/redux";
import { TrackId } from "types/Track/TrackTypes";

/** Creates a pattern and adds it to the slice. */
export const createPattern =
  (
    payload: Payload<Partial<Pattern>> = { data: defaultPattern }
  ): Thunk<Pattern> =>
  (dispatch, getProject) => {
    const pattern = payload.data;
    const undoType = unpackUndoType(payload, "createPattern");
    const project = getProject();

    // Get the name of the new pattern
    const newName = selectNewMotifName(project, "pattern");
    const givenName = pattern.name;
    const noName = !givenName;
    const name = noName ? newName : givenName;

    // Initialize a new pattern
    const newPattern = initializePattern({ ...pattern, name });
    dispatch(addPattern({ data: newPattern, undoType }));

    // Return the id
    return newPattern;
  };

/** Copies a pattern and adds it to the slice. */
export const copyPattern =
  (payload: Payload<Partial<Pattern>, true>): Thunk<Pattern> =>
  (dispatch) => {
    const defaultUndoType = unpackUndoType(payload, "copyPattern");
    const undoType = payload?.undoType ?? defaultUndoType;
    const pattern = payload?.data ?? {};
    const name = `${pattern.name} Copy`;
    return dispatch(createPattern({ data: { ...pattern, name }, undoType }));
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
    payload: Payload<{ id: PatternId; trackId?: TrackId; duration?: number }>
  ): Thunk =>
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

    // Pick a random note from the scale for each note in the pattern
    const streamLength = pattern.stream.length || 8;
    let degrees = range(0, scale.notes.length);
    let stream: PatternStream = [];
    for (let i = 0; i < streamLength; i++) {
      if (!degrees.length) degrees.push(...range(0, scale.notes.length));
      const degree = sample(degrees) || 0;
      degrees = degrees.filter((d) => d !== degree);
      const velocity = 100;
      const duration = data.duration ?? SixteenthNoteTicks;
      const offset = {} as ScaleVector;
      const neighborSeed = Math.random();
      const isNeighbor = neighborSeed < neighborChance;
      const neighbor = neighbors.at(-1);
      if (isNeighbor && neighbor) {
        offset[neighbor.id] = Math.floor(Math.random() * 2) - 1;
      }
      const note: PatternNote = { degree, velocity, duration, scaleId, offset };
      stream.push(note);
      if (isNeighbor && neighbor) {
        stream.push({ ...note, offset: {} });
        i++;
      }
    }
    stream = stream.slice(0, streamLength);

    // Update the pattern
    dispatch(updatePattern({ data: { id, stream }, undoType }));
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
  const pitches: string[] = notes.map((note) =>
    Frequency(note.MIDI, "midi").toNote()
  );

  // Get the Tone.js subdivision
  const duration = getPatternBlockDuration(notes) ?? EighthNoteTicks;
  const subdivision = `${duration}i`;

  // Get the velocity scaled for Tone.js
  const velocity = notes[0].velocity ?? DEFAULT_VELOCITY;
  const scaledVelocity = velocity / MAX_VELOCITY;

  // Play the chord with the sampler
  if (!sampler.loaded) return;
  sampler.triggerAttackRelease(pitches, subdivision, time, scaledVelocity);
};
