import { ticksToToneSubdivision } from "utils";
import {
  selectPatternById,
  selectRoot,
  selectTransport,
} from "redux/selectors";
import { AppThunk } from "redux/store";
import { MIDI } from "types/midi";
import {
  Pattern,
  PatternId,
  PatternNoId,
  PatternStream,
  defaultPattern,
  getRealizedPatternNotes,
  initializePattern,
  transposePatternStream,
} from "types/Pattern";
import { Midi } from "@tonejs/midi";
import {
  addPattern,
  removePattern,
  updatePattern,
  selectPatternIds,
} from "redux/Pattern";
import { convertTicksToSeconds } from "types/Transport";
import { PresetPatternList } from "presets/patterns";
import { LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { setSelectedPattern } from "redux/Root";

/**
 * Creates a pattern and adds it to the store.
 * @param scale Optional. `Partial<PatternNoId>` to override default values.
 * @returns A promise that resolves to the ID of the created pattern.
 */
export const createPattern =
  (
    pattern: Partial<PatternNoId> = defaultPattern
  ): AppThunk<Promise<PatternId>> =>
  async (dispatch) => {
    return new Promise((resolve) => {
      const newPattern = initializePattern(pattern);
      dispatch(addPattern(newPattern));
      resolve(newPattern.id);
    });
  };

/**
 * Removes a list of patterns from the store.
 * @param ids The IDs of the patterns to remove.
 */
export const deletePattern =
  (id: PatternId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const { selectedPatternId } = selectRoot(state);
    const patternIds = selectPatternIds(state);

    // Get the index of the pattern to remove
    const index = patternIds.findIndex((patternId) => patternId === id);
    if (index === -1) return;
    // If the pattern is selected, select the previous or next pattern
    if (selectedPatternId === id) {
      const nextId = patternIds?.[index - 1] || patternIds?.[index + 1];
      if (nextId) dispatch(setSelectedPattern(nextId));
    }
    // Remove the pattern
    dispatch(removePattern(id));
  };

/**
 * Play a pattern using the global audio instance.
 * @param pattern The pattern to play.
 */
export const playPattern =
  (pattern?: Pattern): AppThunk =>
  (dispatch, getState) => {
    if (!pattern) return;
    const state = getState();
    const transport = selectTransport(state);

    // Get the global audio instance
    const instance = LIVE_AUDIO_INSTANCES.global;
    if (!instance.isLoaded()) return;

    // Get the realized pattern notes
    const stream = getRealizedPatternNotes(pattern);
    if (!stream.length) return;

    // Make sure the instance is heard
    instance.solo = true;

    // Accumulate time
    let time = 0;

    // Iterate over each chord
    for (let i = 0; i < stream.length; i++) {
      // Get the stream chord
      const chord = stream[i];
      if (!chord.length) continue;
      const firstNote = chord[0];

      // Compute the time and skip if it's a rest
      const seconds = convertTicksToSeconds(transport, firstNote.duration);
      if (MIDI.isRest(chord)) {
        time += seconds;
        continue;
      }

      // Compute the subdivisions and pitches
      const subdivision = ticksToToneSubdivision(firstNote.duration);
      const pitches = chord.map((note) => MIDI.toPitch(note.MIDI));

      // Set a timeout to play the chord
      setTimeout(() => {
        if (!instance.isLoaded()) return;
        instance.sampler.triggerAttackRelease(pitches, subdivision);
      }, time * 1000);

      // Accumulate time
      time += seconds;
    }

    // Un-solo the instance
    setTimeout(() => {
      instance.solo = false;
    }, time * 1000);
  };

/**
 * Parse the expression and return a pattern stream.
 * @param expression The expression to parse.
 * @returns A pattern stream.
 */
export const parsePatternRegex = (expression: string) => {
  const pitchClassRegex = `([A-Ga-g][#|b]?)?`;

  // Find all matches of pitch class + pattern aliases
  const matches = PresetPatternList.filter((pattern) => {
    const phrases = [pattern.id, ...(pattern.aliases || [])];
    const safePhrases = phrases.map((phrase) => phrase.replace("+", "\\+"));
    const optionsRegex = safePhrases.join("|");
    const regex = new RegExp(`^${pitchClassRegex} ?(${optionsRegex})$`);
    return regex.test(expression);
  });
  if (!matches.length) return;

  // Iterate over each match and get the corresponding stream
  let newStream: PatternStream = [];
  for (const match of [matches[0]]) {
    const phrases = [match.id, ...(match.aliases || [])];
    const safePhrases = phrases.map((phrase) => phrase.replace("+", "\\+"));
    const optionsRegex = safePhrases.join("|");
    const regex = new RegExp(`^${pitchClassRegex} ?(${optionsRegex})$`);
    const result = regex.exec(expression);
    if (!result) continue;

    // Extract pitch class
    const pitchClass = (result[1] || "C").toUpperCase();
    const distanceFromC = MIDI.ChromaticNumber(pitchClass);

    // Extract transposed pattern
    const stream = transposePatternStream(match.stream, distanceFromC);
    newStream.push(...stream);
  }

  return newStream;
};

/**
 * Update the pattern stream by parsing a regex expression.
 * @param id The ID of the pattern to update.
 * @param regex The regex expression to parse.
 */
export const updatePatternByRegex =
  (id: PatternId, regex: string): AppThunk =>
  (dispatch, getState) => {
    const state = getState();

    // Get the pattern and parsed stream
    const pattern = selectPatternById(state, id);
    const parsedStream = parsePatternRegex(regex);
    if (!pattern || !parsedStream?.length) return;

    // Get the updated pattern
    const newPattern = {
      ...pattern,
      stream: [...pattern.stream, ...parsedStream],
    };

    // Dispatch the update
    dispatch(updatePattern(newPattern));
  };

/**
 * Export a pattern to a MIDI file.
 * @param id The ID of the pattern to export.
 */
export const exportPatternToMIDI =
  (id: PatternId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const transport = selectTransport(state);

    // Get the pattern
    const pattern = selectPatternById(state, id);
    if (!pattern) return;

    // Prepare a new MIDI file
    const midi = new Midi();
    const track = midi.addTrack();
    const stream = pattern.stream;

    // Accumulate time
    let time = 0;

    // Iterate over each chord
    for (let i = 0; i < stream.length; i++) {
      const chord = stream[i];
      if (!chord.length) continue;

      // Get the first note in the chord and update time
      const firstNote = chord[0];
      const duration = convertTicksToSeconds(transport, firstNote.duration);
      time += duration;

      // Keep going if it's a rest
      if (MIDI.isRest(chord)) continue;

      // Otherwise, add the notes to the track
      const noteTime = convertTicksToSeconds(transport, time);
      for (const note of chord) {
        track.addNote({
          midi: note.MIDI,
          duration,
          time: noteTime,
          velocity: note.velocity,
        });
      }
    }

    // Create a MIDI blob
    const blob = new Blob([midi.toArray()], {
      type: "audio/midi",
    });
    const url = URL.createObjectURL(blob);

    // Download the MIDI file
    const a = document.createElement("a");
    a.href = url;
    a.download = `${pattern.name || "pattern"}.mid`;
    a.click();
    URL.revokeObjectURL(url);
  };
