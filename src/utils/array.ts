import { mod } from "./math";

/** Get the previous item in an array. */
export const prev = <T extends Readonly<any[]>>(
  array: T,
  index: number,
  steps = 1
) => array[mod(index - steps, array.length)];

/** Get the next item in an array. */
export const next = <T extends Readonly<any[]>>(
  array: T,
  index: number,
  steps = 1
) => array[mod(index + steps, array.length)];

/** Get the previous index based on the array. */
export const prevIndex = (array: Readonly<any[]>, index: number, steps = 1) =>
  mod(index - steps, array.length);

/** Get the next index based on the array. */
export const nextIndex = (array: Readonly<any[]>, index: number, steps = 1) =>
  mod(index + steps, array.length);
