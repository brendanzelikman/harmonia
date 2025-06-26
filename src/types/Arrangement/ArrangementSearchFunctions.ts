import {
  isPatternRest,
  PatternMidiStream,
  PatternStream,
} from "types/Pattern/PatternTypes";
import { PoseVector, PoseVectorId } from "types/Pose/PoseTypes";
import {
  PatternMidiStreamDependencies,
  getMidiStreamKey,
  getMidiStreamAtTick,
} from "./ArrangementFunctions";
import {
  getVectorComplexity,
  getVectorMagnitude,
  sanitizeVector,
} from "utils/vector";
import {
  getMidiStreamScale,
  getPatternMidiChordNotes,
} from "types/Pattern/PatternUtils";
import { getMidiValue } from "utils/midi";
import { isNumber } from "types/utils";

/** A stream query is a possible transformation of a pattern stream.
 * - vector: The pose vector that transforms the stream
 * - error: The transformed pattern stream
 * - score: The mean square error of the stream
 */
export interface StreamQuery {
  vector: PoseVector;
  stream: PatternMidiStream;
  distance: number;
  complexity: number;
  magnitude: number;
}

export const defaultStreamQuery: StreamQuery = {
  vector: {},
  stream: [],
  distance: 0,
  complexity: 0,
  magnitude: 0,
};

export type StreamQueryOptions = {
  spread: number;
  keys: PoseVectorId[];
  direction: "up" | "down" | "any";
  step?: number;
  select: number | "best" | "random" | "top25" | "top10" | "top5";
};
export type PartialQueryOptions = Partial<StreamQueryOptions>;

export const defaultSearchOptions: StreamQueryOptions = {
  spread: 3,
  keys: [],
  direction: "any",
  select: "best",
};

/** Accept a pattern stream and return possible transformations */
export const getPatternStreamQuery = (
  stream: PatternStream,
  deps: PatternMidiStreamDependencies,
  _options?: Partial<StreamQueryOptions>
): StreamQuery => {
  const options = { ...defaultSearchOptions, ..._options };
  const track = deps.tracks[deps.clip.trackId];
  if (!track) return defaultStreamQuery;

  // Resolve the pattern stream to MIDI using the current scales of the track
  const { midiStream, operations } = getMidiStreamAtTick(stream, deps);
  const midiKey = getMidiStreamKey(midiStream);

  // Get every possible vector with all possible key-value pairs
  const searchVectors = getStreamQueryVectors(deps, options);

  // Get the corresponding queries for each vector
  const queries = searchVectors.map((searchVector) => {
    const ops = [{ vector: searchVector }, ...operations];
    const query = getMidiStreamAtTick(stream, deps, ops);

    // Get the new stream and make sure it is not the same
    const queriedStream = query.midiStream;
    if (midiKey === getMidiStreamKey(queriedStream)) return null;

    // Make sure the stream matches the direction
    const distance = getMidiStreamScaleError(midiStream, queriedStream);
    const error = getMidiStreamMeanError(midiStream, queriedStream);
    if (options.direction === "up" && error < 0) return null;
    if (options.direction === "down" && error > 0) return null;

    // Get the vector and compute its properties
    const queriedVector = sanitizeVector(ops[0].vector);
    const complexity = getVectorComplexity(query.poseVector);
    const magnitude = getVectorMagnitude(query.poseVector);
    return {
      stream: queriedStream,
      vector: queriedVector,
      distance,
      complexity,
      magnitude,
    };
  });

  // Filter and sort the queries
  const filteredQueries = queries.filter((_) => _ !== null) as StreamQuery[];
  const finalQueries = filteredQueries.sort(compareStreamQueries);

  // If selecting by degree, remove everything out the scale
  const step = options.step;
  if (step !== undefined) {
    if (!step) return defaultStreamQuery;
    let vectorId = options.keys[0];
    if (vectorId === "scale-track_1") {
      vectorId = deps.chainIdsByTrack[deps.clip.trackId][0];
    } else if (vectorId === "scale-track_2") {
      vectorId = deps.chainIdsByTrack[deps.clip.trackId][1];
    } else if (vectorId === "scale-track_3") {
      vectorId = deps.chainIdsByTrack[deps.clip.trackId][2];
    } else if (vectorId === "chordal") {
      vectorId = "chordal";
    } else if (vectorId === "octave") {
      vectorId = "octave";
    } else {
      vectorId = "chromatic";
    }
    return finalQueries.filter((query) => query.vector[vectorId] === step)[0];
  }

  const indexedQueries = finalQueries.reduce((acc, query) => {
    const last = acc.at(-1);
    if (!last) return [query];
    if (last.distance === query.distance) {
      return acc;
    } else {
      return [...acc, query];
    }
  }, [] as StreamQuery[]);

  // Return the best query based on the selection
  return getStreamQueryByIndex(indexedQueries, options);
};

// Get all possible vectors within the search range
export const getStreamQueryVectors = (
  deps: PatternMidiStreamDependencies,
  options: StreamQueryOptions
): PoseVector[] => {
  const keys = options.keys;
  const range = options.spread * 2 + 1;
  const searchSize = Math.pow(range, keys.length);
  const searchVectors = Array.from({ length: searchSize }, (_, i) => {
    const vector = {} as PoseVector;
    let index = i;
    for (const key of keys) {
      const value = (index % range) - options.spread;
      let k = key;
      if (key === "scale-track_1") {
        k = deps.chainIdsByTrack[deps.clip.trackId][0];
      } else if (key === "scale-track_2") {
        k = deps.chainIdsByTrack[deps.clip.trackId][1];
      } else if (key === "scale-track_3") {
        k = deps.chainIdsByTrack[deps.clip.trackId][2];
      }
      vector[k] = value;
      if (value === 0) delete vector[k];
      index = Math.floor(index / range);
    }
    return vector;
  });
  return searchVectors;
};

// Select the query item by index
export const getStreamQueryByIndex = (
  queries: StreamQuery[],
  options: StreamQueryOptions
) => {
  let index = 0;
  if (options.select === "top5") {
    index = Math.floor(5 * Math.random());
  } else if (options.select === "top10") {
    index = Math.floor(10 * Math.random());
  } else if (options.select === "top25") {
    index = Math.floor(25 * Math.random());
  } else if (options.select === "random") {
    index = Math.floor(queries.length * Math.random());
  } else if (isNumber(options.select)) {
    index = options.select;
  }
  index = Math.min(index, queries.length - 1);
  return queries[index] ?? defaultStreamQuery;
};

// Return the streams sorted by their score, then key count
export const compareStreamQueries = (a: StreamQuery, b: StreamQuery) => {
  const distance = a.distance - b.distance;
  const complexity = a.complexity - b.complexity;
  const magnitude = a.magnitude - b.magnitude;
  return distance || complexity || magnitude;
}; // ---------------------------------------------------------
// Midi Stream Stats
// ---------------------------------------------------------

export const getMidiStreamScaleError = (
  stream: PatternMidiStream,
  other: PatternMidiStream
) => {
  const scale1 = getMidiStreamScale(stream);
  const scale2 = getMidiStreamScale(other);
  return scale1.reduce(
    (a, b, i) => (a ?? 0) + Math.abs((b ?? 0) - (scale2[i] ?? 0)),
    0
  );
};

export const getMidiStreamMeanError = (
  stream: PatternMidiStream,
  other: PatternMidiStream
) => {
  const length = Math.min(stream.length, other.length);
  if (length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < length; i++) {
    const streamBlock = stream[i];
    const otherBlock = other[i];
    if (isPatternRest(streamBlock) || isPatternRest(otherBlock)) continue;
    const streamNotes = getPatternMidiChordNotes(streamBlock);
    const otherNotes = getPatternMidiChordNotes(otherBlock);
    const diff = streamNotes.reduce((acc, note, index) => {
      const midi = getMidiValue(note);
      const otherMidi = getMidiValue(otherNotes[index]);
      return acc + (otherMidi - midi);
    }, 0);
    sum += diff;
  }
  return sum;
};
