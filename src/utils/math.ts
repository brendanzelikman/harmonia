import { clamp } from "lodash";

/** Modulo that works with negative numbers. */
export const mod = (n: number, m: number) => ((n % m) + m) % m;

/** Normalize a number in a range (i.e. 0 - 1). */
export const normalize = (x: number, m: number, n: number) => (x - m) / (n - m);

/** Get the percentage of a number in a range (i.e. 0 - 100). */
export const percent = (x = 0, m = 0, n = 0) =>
  clamp(Math.round(100 * normalize(x, m, n)), 0, 100);

/** Get the closest number in an array. */
export const closest = (x: number, arr: number[]) =>
  arr.reduce((pre, cur) => (Math.abs(cur - x) < Math.abs(pre - x) ? cur : pre));

/** Convert a number into a lowercase letter (e.g. 1 = a, 2 = b). */
export const numberToLower = (number: number) =>
  String.fromCharCode(number.toString().charCodeAt(0) + 49);

/** Convert a number into an uppercase letter (e.g. 1 = A, 2 = B). */
export const numberToUpper = (number: number) =>
  String.fromCharCode(number.toString().charCodeAt(0) + 17);
