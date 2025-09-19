import { WHOLE_NOTE_TICKS } from "./duration";

// Generate a Euclidean rhythm pattern
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

// Cache of rhythmic patterns
const euclidCache = new Map<string, number[]>();
for (let steps = 1; steps <= 16; steps++) {
  for (let pulses = 0; pulses <= steps; pulses++) {
    for (let rot = 0; rot < steps; rot++) {
      const hits = euclidean(pulses, steps, rot)
        .map((v, i) => (v ? i : -1))
        .filter((i) => i >= 0);
      euclidCache.set(`${pulses},${steps},${rot}`, hits);
    }
  }
}

// Try to get a cached Euclidean pattern
export const getEuclideanRhythm = (
  pulses: number,
  steps = 8,
  rot = 0
): number[] => {
  const key = `${pulses},${steps},${rot}`;
  const cached = euclidCache.get(key);
  if (cached !== undefined) return cached;
  const pattern = euclidean(pulses, steps, rot);
  euclidCache.set(key, pattern);
  return pattern;
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
    hits = getEuclideanRhythm(pulses, steps, rot);
  } else {
    hits = patternPart
      .split(/\s+/)
      .map((n) => parseInt(n, 10))
      .map((i) => (i + rot) % steps);
  }

  return hits.includes(stepPos);
};
