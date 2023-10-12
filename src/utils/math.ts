import { clamp } from "lodash";

// Sanitize a number value
export const sanitizeNumber = (value: number) => (isNaN(value) ? 0 : value);

// Modulo that works with negative numbers
export const mod = (n: number, m: number) => ((n % m) + m) % m;

// Normalize a number in a range (0 - 1)
export const normalize = (x: number, m: number, n: number) => (x - m) / (n - m);

// Get the percentage of a number in a range (0% - 100%)
export const percentOfRange = (x = 0, m = 0, n = 0) =>
  clamp(Math.round((100 * (x - m)) / (n - m)), 0, 100);

// Closest number in array
export const closest = (goal: number, arr: number[]) =>
  arr.reduce((prev, curr) => {
    return Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev;
  });
