import { ERROR_TAG, Tick } from "types/units";
import {
  Transposition,
  TranspositionOffsetRecord,
  isTransposition,
  OffsetId,
  TranspositionMap,
} from "./TranspositionTypes";
import { TrackId } from "types/Track";

/**
 * Get the unique tag of a given Transposition.
 * @param transposition The Transposition object.
 * @returns Unique tag string.
 * @throws {Error} if the Transposition is invalid.
 */
export const getTranspositionTag = (transposition: Partial<Transposition>) => {
  if (!isTransposition(transposition)) return ERROR_TAG;
  const { id, tick, trackId } = transposition;
  const offsets = JSON.stringify(transposition.offsets);
  return `${id}@${tick}@${trackId}@${offsets}`;
};

/**
 * Creates a TranspositionMap from an array of Transpositions.
 * @param transpositions The array of Transpositions.
 * @returns A TranspositionMap.
 */
export const createTranspositionMap = (
  transpositions: Transposition[]
): TranspositionMap => {
  return transpositions.reduce((acc, transposition) => {
    acc[transposition.id] = transposition;
    return acc;
  }, {} as TranspositionMap);
};

/**
 * Get the scalar offsets from the transposition record.
 * @param offsets The `TranspositionOffsetRecord`.
 * @param ids The `OffsetId`s to use as keys.
 * @returns The scalar offsets or an empty array if the offsets or ids are missing.
 */
export const getScalarOffsets = (
  offsets?: TranspositionOffsetRecord,
  ids?: OffsetId[]
) => {
  if (!offsets || !ids) return [];
  return ids.map((id) => offsets[id] || 0);
};

/**
 * Get the scalar offset from the transposition record.
 * @param offsets The `TranspositionOffsetRecord`.
 * @param ids The `OffsetId`s to use.
 * @returns The scalar offset or 0 if the offsets or id are missing.
 */
export const getScalarOffset = (
  offsets?: TranspositionOffsetRecord,
  id?: OffsetId
) => {
  if (!offsets || !id) return 0;
  return offsets[id] || 0;
};

/**
 * Get the chromatic offset from the transposition record.
 * @param offsets The `TranspositionOffsetRecord`.
 * @returns The chromatic offset or 0 if the key is missing.
 */
export const getChromaticOffset = (offsets?: TranspositionOffsetRecord) => {
  if (!offsets) return 0;
  return offsets._chromatic || 0;
};

/**
 * Get the chordal offset from the transposition record.
 * @param offsets The `TranspositionOffsetRecord`.
 * @returns The chordal offset or 0 if the key is missing.
 */
export const getChordalOffset = (offsets?: TranspositionOffsetRecord) => {
  if (!offsets) return 0;
  return offsets._self || 0;
};

/**
 * Formats the offsets into a printable string.
 * @param offsets The `TranspositionOffsetRecord` to format.
 * @returns The formatted string.
 */
export const formatOffsets = (
  offsets: TranspositionOffsetRecord,
  orderedTrackIds?: TrackId[]
) => {
  if (!offsets) return "";
  const offsetKeys = Object.keys(offsets);
  const nonScalarKeys = offsetKeys.filter(
    (k) => k !== "_chromatic" && k !== "_self"
  );
  const scalars = nonScalarKeys.sort((a, b) => {
    const aIndex = orderedTrackIds?.indexOf(a) || 0;
    const bIndex = orderedTrackIds?.indexOf(b) || 0;
    return aIndex - bIndex;
  });
  const N = offsets._chromatic || 0;
  const Ts = scalars.map((k) => offsets[k] || 0);
  const t = offsets._self || 0;
  if (!Ts.length) return `N${N} • t${t}`;
  return `N${N} • T(${Ts.join(", ")}) • t${t}`;
};

/**
 * Get the offseted transposition by adding the given offsets to the given transposition.
 * @param transposition The `Transposition` to offset.
 * @param offsets The `TranspositionOffsetRecord` to apply.
 * @returns The offseted `Transposition`.
 */
export const getOffsettedTransposition = (
  transposition: Transposition,
  offsets: TranspositionOffsetRecord
): Transposition => {
  const offsetKeys = Object.keys({ ...transposition.offsets, ...offsets });

  // Offset each transposition
  const newOffsets = offsetKeys.reduce((acc, cur) => {
    if (!cur?.length) return acc;
    const curOffset = transposition.offsets[cur] || 0;
    const newOffset = offsets[cur] || 0;
    const newCurOffset = curOffset + newOffset;
    return { ...acc, [cur]: newCurOffset };
  }, {} as TranspositionOffsetRecord);

  // Return the transposition with the new offsets
  return { ...transposition, offsets: newOffsets };
};

/**
 * Get the last transposition occurring at or before the given tick.
 * @param transpositions The `Transposition`s to search.
 * @param tick The tick to search for.
 * @param sort Optional. Whether to sort the transpositions by tick. Default True.
 * @returns The matching transposition or undefined if none exist.
 */
export const getLastTransposition = (
  transpositions: Transposition[],
  tick: Tick = 0,
  sort = true
) => {
  if (!transpositions) return undefined;

  // Get the matching transpositions
  const matchingTranspositions = transpositions.filter(
    (t) =>
      t && t.tick <= tick && (!!t.duration ? t.tick + t.duration > tick : true)
  );

  // If no matching transpositions, return undefined
  if (!matchingTranspositions.length) return undefined;

  // If sort is false, return the first matching transposition
  if (!sort) return matchingTranspositions[0];

  // Otherwise, sort the matching transpositions by tick and return the first one
  return matchingTranspositions.sort((a, b) => b.tick - a.tick)[0];
};
