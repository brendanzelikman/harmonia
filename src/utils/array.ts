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

/** Convert an item or array into a definite array */
export const toArray = <T>(item: T | T[]): T[] =>
  Array.isArray(item) ? item : [item];
