import { size } from "lodash";
import { getValueByKey } from "./object";

export type VectorKey<T extends Vector> = keyof T;
export type Scalar = number;

export type Vector<T extends PropertyKey = PropertyKey> = {
  [key in T]?: Scalar;
};

export const CHORDAL_KEY = "r";
export const CHROMATIC_KEY = "t";
export const OCTAVE_KEY = "y";
export const PITCH_KEY = "*";
export const VECTOR_SEPARATOR = " + ";
export const VECTOR_BASE = "Root";

/** Returns true if a vector has no keys. */
export const isVectorEmpty = (vector?: Vector) => {
  return (
    vector === undefined ||
    !size(vector) ||
    getVectorKeys(vector).every((key) => !vector[key])
  );
};

/** Get the keys of a vector. */
export const getVectorKeys = <T extends Vector>(vector?: T): VectorKey<T>[] => {
  return vector ? Object.keys(vector) : [];
};

/** Get the nonzero keys of a vector. */
export const getNonzeroVectorKeys = <T extends Vector>(
  vector?: T
): VectorKey<T>[] => {
  return getVectorKeys(vector).filter((key) => !!vector?.[key]);
};

/** Replace the keys of a vector. */
export const replaceVectorKeys = <T extends Vector>(
  vector: T,
  idMap: Record<string, string>
): T => {
  return Object.keys(vector).reduce((acc, key) => {
    const newKey = idMap[key] ?? key;
    return { ...acc, [newKey]: vector[key] };
  }, {} as T);
};

/** Read the numerical value of a vector key. */
export const getVectorValue = <T extends Vector>(
  vector?: T,
  key?: keyof T
): Scalar => getValueByKey(vector, key) ?? 0;

/** Get the chromatic offset from the vector. */
export const getVector_T = (vector?: Vector) => {
  return getVectorValue(vector, "chromatic");
};

/** Get the chordal offset from the vector. */
export const getVector_t = (vector?: Vector) => {
  return getVectorValue(vector, "chordal");
};

/** Get the octave offset from the vector. */
export const getVector_O = (vector?: Vector) => {
  return getVectorValue(vector, "octave");
};

/** Get the concrete MIDI offset from the chromatic and octave components. */
export const getVectorMidi = (vector?: Vector) => {
  return getVector_T(vector) + getVector_O(vector) * 12;
};

/** Map over a vector and reduce its keys into a new vector. */
export const mapVector = <T extends Vector>(
  vector: T,
  fn: (key: keyof T, value: Scalar) => Scalar
) => {
  const keys = getVectorKeys(vector);
  return keys.reduce((acc, cur) => {
    return { ...acc, [cur]: fn(cur, vector[cur] ?? 0) };
  }, {} as T);
};

/** Multiply each value of the vector with the given multiplier. */
export const multiplyVector = <T extends Vector>(vector: T, multiplier = 1) => {
  return mapVector(vector, (_, value) => value * multiplier);
};

/** Sum the numerical values in an array of records. */
export const sumVectors = <T extends Vector>(
  ...vectors: (T | undefined)[]
): T => {
  const result = {} as T;
  for (const vector of vectors) {
    if (vector === undefined) continue;
    for (const key in vector) {
      result[key] = ((result[key] ?? 0) + (vector[key] ?? 0)) as T[typeof key];
    }
  }
  return result;
};

/** Sanitize a vector by deleting all zeroed values. */
export const sanitizeVector = <T extends Vector>(vector: T = {} as T) => {
  const keys = getVectorKeys(vector);
  return keys.reduce((acc, cur) => {
    return vector[cur] ? { ...acc, [cur]: vector[cur] } : acc;
  }, {} as T);
};

/** Get the complexity of a vector by counting its nonzero values. */
export const getVectorComplexity = (vector?: Vector) => {
  return Object.values(vector ?? {}).filter((value) => !!value).length;
};

/** Get the magnitude of a vector. */
export const getVectorMagnitude = (vector?: Vector) => {
  return Math.sqrt(
    Object.values(vector ?? {}).reduce(
      (acc: number, cur) => (acc ?? 0) + (cur ?? 0) * (cur ?? 0),
      0
    )
  );
};
