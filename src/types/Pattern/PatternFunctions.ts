import { Time } from "tone/build/esm/core/type/Units";
import { MIDI } from "types/midi";
import {
  Scale,
  chromaticScale,
  getScalePitchClasses,
  getSortedPitchClasses,
  isScale,
  unpackScale,
} from "types/Scale";
import { ERROR_TAG, Key, Tick } from "types/units";
import { mod, ticksToToneSubdivision } from "utils";
import {
  isPattern,
  PatternNote,
  isPatternNote,
  PatternChord,
  isPatternChord,
  PatternStream,
  isPatternStream,
  Pattern,
  defaultPattern,
} from "./PatternTypes";
import { Sampler } from "tone";
import { range } from "lodash";

/**
 * Get the options of a given Pattern.
 * @param pattern The Pattern object.
 * @returns PatternOptions object.
 */
export const getPatternOptions = (pattern?: Pattern) => {
  return {
    ...defaultPattern.options,
    ...pattern?.options,
  };
};

/**
 * Get the unique tag of a given Pattern.
 * @param pattern The Pattern object.
 * @returns Unique tag string. If the Pattern is invalid, return the error tag.
 */
export const getPatternTag = (pattern: Pattern) => {
  if (!isPattern(pattern)) return ERROR_TAG;
  const { id, name, stream } = pattern;
  const streamTag = getPatternStreamTag(stream);
  return `${id}@${name}@${streamTag}`;
};

/**
 * Get the unique tag of a given PatternNote.
 * @param patternNote The PatternNote object.
 * @returns Unique tag string. If the PatternNote is invalid, return the error tag.
 */
export const getPatternNoteTag = (patternNote: PatternNote) => {
  if (!isPatternNote(patternNote)) return ERROR_TAG;
  const { MIDI, duration, velocity } = patternNote;
  return `${MIDI}:${duration}:${velocity}`;
};

/**
 * Get the unique tag of a given PatternChord.
 * @param patternChord The PatternChord object.
 * @returns Unique tag string. If the PatternChord is invalid, return the error tag.
 */
export const getPatternChordTag = (patternChord: PatternChord) => {
  if (!isPatternChord(patternChord)) return ERROR_TAG;
  return patternChord.map(getPatternNoteTag).join(",");
};

/**
 * Get the unique tag of a given PatternStream.
 * @param stream The PatternStream object.
 * @returns Unique tag string. If the PatternStream is invalid, return the error tag.
 */
export const getPatternStreamTag = (patternStream: PatternStream) => {
  if (!isPatternStream(patternStream)) return ERROR_TAG;
  return patternStream.map(getPatternChordTag).join("|");
};

/**
 * Gets the total duration of a PatternStream in ticks.
 * @param stream The PatternStream object.
 * @returns Duration in ticks. If the PatternStream is invalid, return 1.
 */
export const getPatternStreamTicks = (stream: PatternStream): Tick => {
  if (!isPatternStream(stream) || !stream.length) return 1;

  // Return the sum of the duration of each chord
  const streamDuration = stream.reduce((pre, cur) => {
    if (!isPatternChord(cur)) return pre;
    if (!cur.length) return pre;
    return pre + cur[0].duration;
  }, 0);

  return streamDuration;
};

/**
 * Flattens a PatternStream into a single PatternChord.
 * @param stream The PatternStream object.
 * @returns A flattened PatternChord. If the PatternStream is invalid, return an empty array.
 */
export const getPatternStreamChord = (stream: PatternStream) => {
  if (!isPatternStream(stream)) return [];
  return stream
    .flat()
    .filter(MIDI.isNotRest)
    .map((note) => note.MIDI);
};

/**
 * Get the MIDI range of a PatternStream.
 * @param stream The PatternStream object.
 * @returns The MIDI range of the PatternStream. If the PatternStream is invalid, return an empty array.
 */
export const getPatternStreamRange = (stream?: PatternStream) => {
  if (!isPatternStream(stream) || !stream.length) return [];

  // Get the pattern stream chord
  const streamChord = getPatternStreamChord(stream);
  if (!streamChord.length) return [];

  const min = Math.min(...streamChord);
  const max = Math.max(...streamChord);
  return range(min, max + 1);
};

/**
 * Gets a PatternStream as a sorted array of unique pitch classes.
 * @param stream The PatternStream object.
 * @param key Optional. The Key used to contextualize pitch classes.
 * @returns A sorted array of unique pitch classes. If the PatternStream is invalid, return an empty array.
 */
export const getPatternStreamScale = (stream: PatternStream, key?: Key) => {
  if (!isPatternStream(stream) || !stream.length) return [];

  // Get the pitch classes of the stream
  const streamChord = getPatternStreamChord(stream);
  const pitchClasses = streamChord.map((note) => MIDI.toPitchClass(note, key));

  // Return the unique pitch classes sorted as a scale
  const uniquePitchClasses = [...new Set(pitchClasses)];
  return getSortedPitchClasses(uniquePitchClasses);
};

/**
 * Gets a PatternStream realized within a given scale.
 * @param pattern The Pattern object.
 * @param scale Optional. The Scale to realize the Pattern within.
 * @returns A PatternStream realized within the given Scale. If the Pattern or Scale is invalid, return an empty array.
 */
export const getRealizedPatternNotes = (
  pattern: Pattern,
  scale: Scale = chromaticScale
): PatternStream => {
  if (!isPattern(pattern) || !isScale(scale)) return [];

  // Get the pitches of the scale
  const scaleNotes = unpackScale(scale);
  const pitches = scaleNotes.map((note) => MIDI.toPitchClass(note));

  // Initialize loop variables
  const stream = pattern.stream;
  const streamLength = stream.length;
  const realizedPattern = [];

  // Iterate over the chords of the pattern
  for (let i = 0; i < streamLength; i++) {
    // Get the chord and initialize the realized chord
    const chord = stream[i];
    const realizedChord = [];

    // Iterate over the notes of the chord
    for (let j = 0; j < chord.length; j++) {
      // If the note is a rest, return it as is
      if (MIDI.isRest(chord)) {
        realizedChord.push(...chord);
        break;
      }

      // Get the pitch of the old note
      const note = chord[j];
      const oldPitch = MIDI.toPitchClass(note.MIDI);

      // If the note is already in the scale, return it as is
      if (pitches.includes(oldPitch)) {
        realizedChord.push(note);
        continue;
      }

      // Otherwise, find the nearest pitch class in the new scale
      const pitchClass = MIDI.closestPitchClass(
        oldPitch,
        scaleNotes,
        getPatternStreamScale(pattern.stream)
      );
      // If no pitch class is found, return the note as is
      if (!pitchClass) {
        realizedChord.push(note);
        continue;
      }

      // Compute the offset to adjust the note within the scale
      const offset = MIDI.ChromaticDistance(note.MIDI, pitchClass);

      // Return the new note
      realizedChord.push({ ...note, MIDI: note.MIDI + offset });
    }

    // Add the realized chord to the realized pattern
    realizedPattern.push(realizedChord);
  }
  return realizedPattern;
};

/**
 * Transpose a PatternStream by a given number of steps with respect to a scale
 * @param stream The PatternStream to transpose.
 * @param steps The number of steps to transpose by.
 * @param scale Optional. The Scale to transpose the pattern stream within.
 * @returns A transposed PatternStream. If the PatternStream or Scale is invalid, return an empty array.
 */
export const transposePatternStream = (
  stream: PatternStream,
  steps: number,
  scale: Scale = chromaticScale
): PatternStream => {
  if (!isPatternStream(stream) || !isScale(scale)) return [];
  return stream.map((chord) => transposePatternChord(chord, steps, scale));
};

/**
 * Transpose a PatternChord by a given number of steps with respect to a scale
 * @param chord The PatternChord to transpose.
 * @param steps The number of steps to transpose by.
 * @param scale Optional. The Scale to transpose the pattern chord within.
 * @param stream Optional. The PatternStream to use for reference pitches.
 * @returns A transposed PatternChord. If the PatternChord or Scale is invalid, return an empty array.
 */
export const transposePatternChord = (
  patternChord: PatternChord,
  steps: number,
  scale: Scale = chromaticScale,
  stream?: PatternStream
): PatternChord => {
  if (!isPatternChord(patternChord) || !isScale(scale)) return [];
  if (!patternChord.length) return [];

  // Return the chord as is if it contains a rest
  if (patternChord.some((note) => MIDI.isRest(note))) return patternChord;

  // Get the scale pitches
  const scalePitches = getSortedPitchClasses(getScalePitchClasses(scale));
  const trackScale = scalePitches.map((pitch) => MIDI.fromPitchClass(pitch));
  const streamScale = getPatternStreamScale(stream ?? [patternChord]);

  // Initialize loop variables
  const patternChordLength = patternChord.length;
  const stepDirection = steps > 0 ? 1 : -1;
  const stepCount = Math.abs(steps);
  const modulus = scalePitches.length;
  const transposedChord: PatternChord = [];

  // Iterate over each note in the chord
  for (let i = 0; i < patternChordLength; i++) {
    const note = patternChord[i];

    // Get the pitch of the note
    const notePitch = MIDI.toPitchClass(note.MIDI);

    // Find the index of the note in the scale
    let newIndex = scalePitches.indexOf(notePitch);

    // If the note is not in the scale, find the nearest pitch class
    if (newIndex === -1) {
      const nearestPitch = MIDI.closestPitchClass(
        notePitch,
        trackScale,
        streamScale
      );
      newIndex = scalePitches.indexOf(nearestPitch);
    }
    let newOffset = 0;

    // Transpose the chord incrementally
    for (let t = 0; t < stepCount; t++) {
      // Compute the next index, wrapping around the modulus
      const nextIndex = mod(newIndex + stepDirection, modulus);
      // Compute the new offset
      if (stepDirection > 0 && nextIndex <= newIndex) newOffset += 12;
      if (stepDirection < 0 && nextIndex >= newIndex) newOffset -= 12;
      // Update the index
      newIndex = nextIndex;
    }
    // Add the scalar offset and the octave offset based on the new pitch
    const newPitch = scalePitches[newIndex];
    const noteDistance = MIDI.ChromaticDistance(notePitch, newPitch);
    const newMIDI = note.MIDI + noteDistance + newOffset;
    transposedChord.push({ ...note, MIDI: newMIDI });
  }
  return transposedChord;
};

/**
 * Rotate a PatternStream by a given number of steps.
 * @param stream The PatternStream to rotate.
 * @param steps The number of steps to rotate by.
 * @returns A rotated PatternStream. If the PatternStream is invalid, return an empty array.
 */
export const rotatePatternStream = (
  stream: PatternStream,
  steps: number
): PatternStream => {
  if (!isPatternStream(stream)) return [];
  if (!steps) return stream;

  // Get the stream scale
  const streamScale = getPatternStreamScale(stream);
  if (!streamScale.length) return stream;

  // Get the new notes based around middle C in MIDI
  const notes = streamScale.map((pitch) => MIDI.ChromaticNumber(pitch) + 60);
  return transposePatternStream(stream, steps, notes);
};

/**
 * Rotate a PatternChord by a given number of steps.
 * @param stream The PatternChord to rotate.
 * @param steps The number of steps to rotate by.
 * @returns A rotated PatternChord. If the PatternChord is invalid, return an empty array.
 */
export const rotatePatternChord = (
  chord: PatternChord,
  steps: number
): PatternChord => {
  if (!isPatternChord(chord)) return [];
  if (!steps) return chord;
  const stream = [chord];
  const rotatedStream = rotatePatternStream(stream, steps);
  const rotatedChord = rotatedStream[0];
  return rotatedChord;
};

/**
 * Play a PatternChord with a Sampler at a given time.
 * @param sampler The Sampler to play the chord with.
 * @param chord The PatternChord to play.
 * @param time When to start the attack.
 */
export const playPatternChord = (
  sampler: Sampler,
  chord: PatternChord,
  time: Time
) => {
  // Do nothing if the chord is invalid
  if (!isPatternChord(chord) || !chord.length) return;

  // Do nothing if the chord contains a rest
  if (chord.some((note) => MIDI.isRest(note))) return;

  // Do nothing if the sampler is not loaded
  if (!sampler || !sampler.loaded) return;

  // Get the pitches
  const pitches = chord.map((note) => MIDI.toPitch(note.MIDI));

  // Get the Tone.js subdivision
  const duration = chord[0].duration ?? MIDI.EighthNoteTicks;
  const subdivision = ticksToToneSubdivision(duration);

  // Get the velocity scaled for TOne.js
  const velocity = chord[0].velocity ?? MIDI.DefaultVelocity;
  const scaledVelocity = velocity / MIDI.MaxVelocity;

  // Play the chord with the sampler
  sampler.triggerAttackRelease(pitches, subdivision, time, scaledVelocity);
};

/**
 * Get the chord at a given tick in a pattern stream.
 * @param stream The pattern stream.
 * @param tick The tick.
 * @returns The chord at the given tick. If no chord is found, an empty array is returned.
 */
export const getPatternChordAtTick = (stream: PatternStream, tick: Tick) => {
  const emptyChord = [] as PatternChord;
  if (!stream) return emptyChord;
  const index = tick;
  if (index < 0 || index >= stream.length) return emptyChord;
  return stream[index];
};
