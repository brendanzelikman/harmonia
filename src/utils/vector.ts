import { union } from "lodash";
import { Dict, getValueByKey } from "./objects";

export type VectorKey<T extends Vector> = keyof T;
export type Scalar = number;

export type Vector<T extends PropertyKey = PropertyKey> = {
  [key in T]?: Scalar;
};

/** Returns true if a vector has no keys. */
export const isVectorEmpty = (vector?: Vector) => {
  return vector === undefined || !getVectorKeys(vector).length;
};

/** Get the keys of a vector. */
export const getVectorKeys = <T extends Vector>(vector?: T): VectorKey<T>[] => {
  return vector ? Object.keys(vector) : [];
};

/** Get the keys of a vector merged with the keys of a dictionary. */
export const mergeVectorKeys = <
  V extends Vector = Vector,
  D extends Dict = Dict
>(
  vector: V,
  dict: D
) => {
  return union<keyof V>(getVectorKeys(vector), Object.keys(dict));
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
      const oldValue = result[key] ?? 0;
      const newValue = vector[key] ?? 0;
      result[key] = (oldValue + newValue) as T[Extract<keyof T, string>];
    }
  }
  return result;
};
