import { inRange, isArray } from "lodash";
import { mod } from "./math";

/** Get the previous item in an array. */
export const prev = <T extends Readonly<any[]>>(
  array: T,
  index: number,
  steps = 1
): T[number] => array[mod(index - steps, array.length)];

/** Get the next item in an array. */
export const next = <T extends Readonly<any[]>>(
  array: T,
  index: number,
  steps = 1
): T[number] => array[mod(index + steps, array.length)];

/** Phase an array by a certain amount. */
export const phase = <T>(array: T[], steps: number): T[] => {
  const length = array.length;
  const newArray = [] as T[];
  for (let i = 0; i < length; i++) {
    const index = mod(i + steps, length);
    newArray.push(array[index]);
  }
  return newArray;
};

/** Insert an item by pushing or splicing at a given index */
export const insert = <T>(
  array: T[],
  value: T | T[],
  index: number | undefined
) => {
  const copy = [...array];
  if (index !== undefined && inRange(index, 0, copy.length)) {
    if (isArray(value)) {
      copy.splice(index, 0, ...value);
    } else {
      copy.splice(index, 0, value);
    }
  } else {
    if (isArray(value)) {
      copy.push(...value);
    } else {
      copy.push(value);
    }
  }
  return copy;
};

/** Move an item from one index to another. */
export const move = <T>(array: T[], from: number, to?: number) => {
  const copy = [...array];
  const value = copy.splice(from, 1)[0];
  return insert(copy, value, to);
};

/** Get the error between two arrays of numbers. */
export const dist = (a: number[], b: number[]): number => {
  let error = 0;
  for (let i = 0; i < a.length; i++) {
    error += Math.abs(a[i] - b[i]);
  }
  return error;
};
