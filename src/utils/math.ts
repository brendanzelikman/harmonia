import { clamp, sum } from "lodash";
import { isNumber, isString } from "types/utils";

/** Modulo that works with negative numbers. */
export const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Format a number to a certain number of decimal places. */
export const format = (x: number, d = 2) => parseFloat(x.toFixed(d));

/** Sanitize a number */
export const sanitize = (x?: number) => (x ? (isNaN(x) ? 0 : x) : 0);

/** Normalize a number in a range (i.e. 0 - 1). */
export const normalize = (x: number, m: number, n: number) => (x - m) / (n - m);

/** Get the percentage of a number x in a range (m, n) (i.e. 0 - 100). */
export const percentize = (x = 0, m = 0, n = 0) =>
  clamp(Math.round(100 * normalize(x, m, n)), 0, 100);

/** Parse a string or number */
export const parseValue = (value: string | number | null) =>
  isString(value) ? sanitize(parseFloat(value)) : value ?? 0;

/** Convert a number into a lowercase letter (e.g. 0 = a, 1 = b). */
export const numberToLower = (number: number) =>
  String.fromCharCode(97 + number);

/** Convert a number into an uppercase letter (e.g. 0 = A, 1 = B). */
export const numberToUpper = (number: number) =>
  String.fromCharCode(65 + number);

/** Returns true if an object is a finite number */
export const isFinite = (n: unknown): n is number => Number.isFinite(n);

/** Returns true if an object is a finite number within the given bounds */
export const isBounded = (
  n: unknown,
  min = -Infinity,
  max = Infinity
): n is number => isNumber(n) && n >= min && n <= max;

/** Sample a key from an object using a record of weights */
export const weightedSample = <T extends Record<string, number>>(
  weights: T
): keyof T => {
  const totalWeight = sum(Object.values(weights));
  let random = Math.random() * totalWeight;
  for (const key in weights) {
    random -= weights[key];
    if (random <= 0) return key;
  }
  return Object.keys(weights)[0];
};
