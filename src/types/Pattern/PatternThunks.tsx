import {
  getTickSubdivision,
  SixteenthNoteTicks,
  ticksToSeconds,
} from "utils/durations";
import { Seconds } from "types/units";
import { Sampler } from "tone";
import { getMidiOctaveDistance, getMidiPitch } from "utils/midi";
import { EighthNoteTicks } from "utils/durations";
import { DEFAULT_VELOCITY, MAX_VELOCITY } from "utils/constants";
import { range, sample, sampleSize } from "lodash";
import { PresetScaleList } from "assets/scales";
import { normalize } from "utils/math";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument/InstrumentClass";
import { Thunk } from "types/Project/ProjectTypes";
import { getScaleNotes } from "types/Scale/ScaleFunctions";
import { ScaleVector } from "types/Scale/ScaleTypes";
import { getPatternBlockDuration } from "./PatternFunctions";
import { getPatternChordNotes, getPatternMidiChordNotes } from "./PatternUtils";
import { getPatternChordWithNewNotes } from "./PatternUtils";
import { resolvePatternStreamToMidi } from "./PatternResolvers";
import { selectPatternIds, selectPatternById } from "./PatternSelectors";
import { addPattern, removePattern, updatePattern } from "./PatternSlice";
import {
  defaultPattern,
  PatternId,
  initializePattern,
  isPatternChord,
  isPatternMidiChord,
  PatternMidiChord,
  Pattern,
  PatternNote,
  PatternStream,
} from "./PatternTypes";
import { selectNewMotifName } from "types/Timeline/TimelineSelectors";
import {
  selectPatternTrackById,
  selectTrackScaleChain,
  selectTrackMidiScaleMap,
  selectScaleTrackChain,
  selectTrackById,
} from "types/Track/TrackSelectors";
import { selectTransportBPM } from "types/Transport/TransportSelectors";
import { Payload, unpackUndoType } from "lib/redux";
import { getDegreeOfNoteInTrack } from "types/Track/TrackUtils";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";

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
  (payload: Payload<{ id: PatternId; duration?: number }>): Thunk =>
  (dispatch, getProject) => {
    const data = payload.data;
    const id = data.id;
    const undoType = unpackUndoType(payload, "randomizePattern");
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    // Get the last scale from the track
    const { trackId } = pattern;
    const track = trackId ? selectTrackById(project, trackId) : undefined;
    const scaleChain = selectTrackScaleChain(project, trackId);
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

/** Randomize a pattern using a random scale or the pattern's track chain */
export const randomizePatternPitches =
  (id: PatternId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    // Get a random scale from the pattern track if possible
    const { trackId } = pattern;
    const track = isPatternTrackId(trackId)
      ? selectPatternTrackById(project, trackId)
      : undefined;
    const scaleChain = selectTrackScaleChain(project, trackId);
    const scales = track ? scaleChain : Object.values(PresetScaleList);
    const scale = sample(scales);
    if (!scale) return;

    // Initialize the pattern stream
    const stream = pattern.stream.map((block) => {
      if (!isPatternChord(block)) return block;
      const scaleNotes = getScaleNotes(scale);
      const chordNotes = getPatternChordNotes(block);
      const noteCount = chordNotes.length;

      const randomDegrees = sampleSize(range(0, scaleNotes.length), noteCount);
      const newNotes = chordNotes.map((note, i) => {
        const degree = randomDegrees[i];
        const newNote = {
          duration: note.duration,
          velocity: note.velocity,
          degree,
          scaleId: scale?.id,
        };
        return newNote;
      });

      const newChord = getPatternChordWithNewNotes(block, newNotes);
      return newChord;
    });

    // Update the pattern
    dispatch(updatePattern({ data: { id, stream } }));
  };

/** Auto-bind a pattern to use the highest scales possible for each note. */
export const autoBindPattern =
  (id?: PatternId): Thunk =>
  (dispatch, getProject) => {
    if (!id) return;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern || !pattern.trackId) return;

    // Get all of the pattern's scales
    const scaleTrackMap = selectTrackMidiScaleMap(project);
    const trackChain = [...selectScaleTrackChain(project, pattern.trackId)];
    const scaleChain = selectTrackScaleChain(project, pattern.trackId);

    // Order the pattern's MIDI scales from highest to lowest
    trackChain.reverse();
    const trackMidiScales = trackChain.map((track) => scaleTrackMap[track.id]);

    // Map the pattern's stream to the highest scales
    const midiStream = resolvePatternStreamToMidi(pattern.stream, scaleChain);
    const mappedStream = pattern.stream.map((block, i) => {
      // Skip if the block is a rest
      const midiBlock = midiStream[i];
      if (!isPatternChord(block) || !isPatternMidiChord(midiBlock)) {
        return block;
      }

      // Get the notes from both blocks
      const notes = getPatternChordNotes(block);
      const midiNotes = getPatternMidiChordNotes(midiBlock);

      // Iterate over each note of the block
      const newChord = notes.map((note, j) => {
        const midiNote = midiNotes[j].MIDI;
        // For each note, iterate over every track
        for (let t = 0; t < trackChain.length; t++) {
          // Find if a degree exists in the track
          const track = trackChain[t];
          const degree = dispatch(getDegreeOfNoteInTrack(track?.id, note));
          if (degree < 0) continue;

          // If a degree is found, find the corresponding MIDI note
          const midiScale = trackMidiScales[t];
          const scaleMidi = midiScale?.[degree];
          if (!midiScale || !scaleMidi) continue;

          const octave = getMidiOctaveDistance(scaleMidi, midiNote);
          const offset: ScaleVector = { octave };

          // Return the new note
          return {
            duration: note.duration,
            velocity: note.velocity,
            degree,
            offset,
            scaleId: track.scaleId,
          };
        }

        // If not possible, just return the note as is
        return note;
      });

      const newBlock = getPatternChordWithNewNotes(block, newChord);
      return newBlock;
    });

    dispatch(updatePattern({ data: { id, stream: mappedStream } }));
  };

/** Clear the bindings of a pattern so that all notes are MIDI. */
export const clearPatternBindings =
  (id?: PatternId, clearTrack = false): Thunk =>
  (dispatch, getProject) => {
    if (!id) return;
    const project = getProject();
    const pattern = selectPatternById(project, id);
    if (!pattern) return;

    // Get the MIDI stream
    const scaleChain = selectTrackScaleChain(project, pattern.trackId);
    const midiStream = resolvePatternStreamToMidi(pattern.stream, scaleChain);
    const newStream = pattern.stream.map((block, i) => {
      if (!isPatternChord(block)) return block;
      const midiBlock = midiStream[i];
      if (!isPatternMidiChord(midiBlock)) return block;
      const notes = getPatternMidiChordNotes(midiBlock);
      return getPatternChordWithNewNotes(block, notes);
    });

    // Update the pattern
    dispatch(
      updatePattern({
        data: {
          id,
          stream: newStream,
          trackId: clearTrack ? undefined : pattern.trackId,
        },
      })
    );
  };

/** Play a pattern using the global audio instance. */
export const playPattern =
  (pattern?: Pattern): Thunk =>
  (dispatch, getProject) => {
    if (!pattern) return;
    const project = getProject();
    const bpm = selectTransportBPM(project);

    // Get the global audio instance
    const instance = LIVE_AUDIO_INSTANCES.global;
    if (!instance.isLoaded()) return;

    // Get the realized pattern notes
    const scaleChain = selectTrackScaleChain(project, pattern.trackId);
    const stream = resolvePatternStreamToMidi(pattern.stream, scaleChain);
    if (!stream.length) return;

    // Make sure the instance is heard
    instance.solo = true;

    // Accumulate time
    let time = 0;

    // Iterate over each chord
    for (let i = 0; i < stream.length; i++) {
      // Get the stream chord
      const block = stream[i];
      const blockDuration = getPatternBlockDuration(block);
      if (!block || !blockDuration) continue;

      // Compute the time and skip if it's a rest
      const seconds = ticksToSeconds(blockDuration, bpm);
      if (!isPatternMidiChord(block)) {
        time += seconds;
        continue;
      }

      // Compute the subdivisions and pitches
      const subdivision = getTickSubdivision(blockDuration);
      const notes = getPatternMidiChordNotes(block);
      const pitches = notes.map((note) => getMidiPitch(note.MIDI));

      // Set a timeout to play the chord
      setTimeout(() => {
        if (!instance.isLoaded()) return;
        instance.sampler.triggerAttackRelease(
          pitches,
          subdivision,
          undefined,
          normalize(notes[0]?.velocity, 0, 127)
        );
      }, time * 1000);

      // Accumulate time
      time += seconds;
    }

    // Un-solo the instance
    setTimeout(() => {
      instance.solo = false;
    }, time * 1000);
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
  const pitches: string[] = notes.map((note) => getMidiPitch(note.MIDI));

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
