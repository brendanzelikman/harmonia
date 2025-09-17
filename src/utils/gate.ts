import { WHOLE_NOTE_TICKS } from "./duration";

export const euclidean = (pulses: number, steps = 8, rot = 0): number[] => {
  const pattern = Array(steps).fill(0);
  let bucket = 0;
  for (let i = 0; i < steps; i++) {
    bucket += pulses;
    if (bucket >= steps) {
      bucket -= steps;
      pattern[i] = 1;
    }
  }
  return pattern.map((_, i) => pattern[(i - rot + steps) % steps]);
};

/** Return true if a tick is active within a gate */
export const rhythmGate = (gate: string, tick: number): boolean => {
  const [patternPart, stepsStr, rotStr] = gate.split(",").map((s) => s.trim());
  const denom = parseInt(stepsStr ?? "16", 10);
  const rot = parseInt(rotStr ?? "0", 10);

  const steps = denom;
  const ticksPerStep = WHOLE_NOTE_TICKS / denom;
  const barPos = tick % WHOLE_NOTE_TICKS;
  const stepPos = Math.floor(barPos / ticksPerStep);

  let hits: number[] = [];

  if (patternPart.startsWith("<") && patternPart.endsWith(">")) {
    const nums = patternPart
      .slice(1, -1)
      .split(/\s+/)
      .map((n) => parseInt(n, 10));
    const which = Math.floor(tick / WHOLE_NOTE_TICKS) % nums.length;
    const pulses = nums[which];
    hits = euclidean(pulses, steps, rot)
      .map((v, i) => (v ? i : -1))
      .filter((i) => i >= 0);
  } else {
    hits = patternPart
      .split(/\s+/)
      .map((n) => parseInt(n, 10))
      .map((i) => (i + rot) % steps);
  }

  return hits.includes(stepPos);
};
