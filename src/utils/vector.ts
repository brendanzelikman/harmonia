// -------------------------------------------------------------
// Vector Types
// -------------------------------------------------------------

/** A vector is a record of keys to numbers */
export type Vector<T extends PropertyKey = PropertyKey> = {
  [key in T]?: number;
};

/** Get the keys of a vector. */
export const getVectorKeys = <T extends Vector>(vector?: T): (keyof T)[] => {
  return vector ? Object.keys(vector) : [];
};

/** Get the nonzero keys of a vector. */
export const getVectorNonzeroKeys = <T extends Vector>(vector?: T) => {
  return getVectorKeys(vector).filter((key) => !!key && !!vector?.[key]);
};

/** Get the complexity of a vector by counting its nonzero values. */
export const getVectorComplexity = (vector?: Vector) => {
  return getVectorNonzeroKeys(vector).length;
};

/** Get the magnitude of a vector. */
export const getVectorMagnitude = (vector?: Vector) => {
  const values = Object.values(vector ?? {});
  return Math.sqrt(
    values.reduce((acc: number, cur) => (acc ?? 0) + (cur ?? 0) * (cur ?? 0), 0)
  );
};

/** Get the concrete MIDI offset from the chromatic and octave components. */
export const getVectorMidiOffset = (vector?: Vector) => {
  return (vector?.chromatic ?? 0) + (vector?.octave ?? 0) * 12;
};

// --------------------------------------------------------------
// Vector Utilities
// --------------------------------------------------------------

/** Sanitize a vector by deleting all empty values. */
export const sanitizeVector = <T extends Vector>(vector: T = {} as T) => {
  const keys = getVectorNonzeroKeys(vector);
  return keys.reduce((acc, key) => ({ ...acc, [key]: vector[key] }), {} as T);
};

/** Replace the keys of a vector. */
export const remapVector = <T extends Vector>(
  vector: T,
  idMap: Record<string, string>
): T => {
  return Object.keys(vector).reduce(
    (acc, key) => ({ ...acc, [idMap[key] ?? key]: vector[key] }),
    {} as T
  );
};

/** Sum the numerical values in an array of records. */
export const sumVectors = <T extends Vector>(
  ...vectors: (T | undefined)[]
): T => {
  return vectors.reduce((acc: T, vector) => {
    if (vector === undefined) return acc;
    for (const key in vector) {
      acc[key] = ((acc[key] ?? 0) + (vector[key] ?? 0)) as T[typeof key];
    }
    return acc;
  }, {} as T);
};
