import {
  isPatternMidiNote,
  PatternMidiBlock,
} from "types/Pattern/PatternTypes";
import { getMidiFromPitch } from "utils/midi";
import {
  DURATION_TYPES,
  EIGHTH_NOTE_TICKS,
  getDurationTicks,
} from "utils/duration";
import { DEFAULT_VELOCITY } from "utils/constants";

// ---------------------------------------------------------
// Pattern Regex
// ---------------------------------------------------------

const noteRegex = `[^,{}]+?`;
const durationTypes = [...DURATION_TYPES].toReversed().join("|");
const velocity = `\\d{1,3}`;
const count = `(?:\\s*\\*\\s*(\\d+))?`;
const noteWithParams = new RegExp(
  `\\{\\s*` +
    `(${noteRegex})?` +
    `(?:\\s*,\\s*(${durationTypes}))?` +
    `(?:\\s*,\\s*(${velocity}))?` +
    `\\s*\\}` +
    count
);
const singleNote = new RegExp(noteRegex);
const restOnly = new RegExp(`(${durationTypes})`);

const convertStreamToBlocks = (str: string): string[] => {
  const result: string[] = [];
  let current = "";
  let depth = 0;
  let count = 1;
  let counting = false;
  let countString = "";

  for (let char of str) {
    if (char === "*") {
      if (!counting) {
        count = 1;
        counting = true;
      } else {
        count *= parseInt(countString);
        countString = "";
      }
      continue;
    }
    if (counting && char.match(/\d/)) {
      countString += char;
      continue;
    }
    if (char === "," && depth === 0) {
      counting = false;
      if (countString !== "") {
        count *= parseInt(countString);
        countString = "";
      }
      for (let i = 0; i < count; i++) {
        result.push(current.trim());
      }
      current = "";
    } else {
      if (char === "[" || char === "{") depth++;
      if (char === "]" || char === "}") depth--;
      current += char;
    }
  }
  if (current) {
    if (countString !== "") {
      count *= parseInt(countString);
      countString = "";
    }

    const token = current.trim();
    if (!token) {
      return Array.from(
        { length: result.length * count },
        (_, i) => result[i % result.length]
      );
    }

    for (let i = 0; i < count; i++) {
      result.push(token);
    }
  }
  return result;
};

const convertStringToBlocks = (
  token: string
): PatternMidiBlock & { query?: string } => {
  if (token.startsWith("[")) {
    const inner = token.slice(1, -1);
    return convertStreamToBlocks(inner)
      .map(convertStringToBlocks)
      .filter(isPatternMidiNote);
  }

  const noteMatch = token.match(noteWithParams);
  if (noteMatch) {
    const query = noteMatch[1] || "C4";
    const durationString = noteMatch[2] || "eighth";
    const velocityString = noteMatch[3] || "100";
    const MIDI = getMidiFromPitch(query);
    const duration = getDurationTicks(durationString);
    const velocity = parseInt(velocityString);
    if (isNaN(MIDI)) {
      return { MIDI, duration, velocity, query };
    } else {
      return { MIDI, duration, velocity };
    }
  }

  if (token.match(singleNote)) {
    const MIDI = getMidiFromPitch(token);
    const duration = EIGHTH_NOTE_TICKS;
    const velocity = DEFAULT_VELOCITY;
    if (isNaN(MIDI)) {
      return { MIDI, duration, velocity, query: token };
    } else {
      return { MIDI, duration, velocity };
    }
  }

  const restMatch = token.match(restOnly);
  if (restMatch) {
    const duration = getDurationTicks(restMatch[1]);
    return { duration };
  }

  return { duration: EIGHTH_NOTE_TICKS };
};

export const readPatternStreamFromString = (str: string) => {
  const blocks = convertStreamToBlocks(str);
  const patternStream = blocks.map(convertStringToBlocks);
  return patternStream;
};
