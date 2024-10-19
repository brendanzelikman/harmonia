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
export const phase = <T extends any>(array: T[], steps: number): T[] => {
  const length = array.length;
  const newArray: T[] = [];
  for (let i = 0; i < length; i++) {
    const index = mod(i + steps, length);
    newArray.push(array[index]);
  }
  return newArray;
};
