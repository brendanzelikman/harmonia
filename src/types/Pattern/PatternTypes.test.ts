import { test, expect, assert } from "vitest";
import * as PatternTypes from "./PatternTypes";

test("initializePattern", () => {
  const pattern = PatternTypes.initializePattern(PatternTypes.mockPattern);
  expect(pattern).toEqual({ ...PatternTypes.mockPattern, id: pattern.id });
});

test("isPattern", () => {
  const validPattern: PatternTypes.Pattern = PatternTypes.initializePattern();
  assert(PatternTypes.isPattern(validPattern));

  const invalidPattern = { stream: [], name: "Invalid" };
  assert(!PatternTypes.isPattern(invalidPattern));
});

test("isPatternMap", () => {
  const validPatternMap: PatternTypes.PatternMap = {
    "valid-pattern": PatternTypes.initializePattern(),
  };
  assert(PatternTypes.isPatternMap(validPatternMap));

  const invalidPatternMap = { "invalid-pattern": { stream: [] } };
  assert(!PatternTypes.isPatternMap(invalidPatternMap));
});

test("isPatternNote", () => {
  const validNote: PatternTypes.PatternNote = {
    MIDI: 60,
    duration: 96,
    velocity: 127,
  };
  assert(PatternTypes.isPatternNote(validNote));

  const invalidNote = { MIDI: 60, duration: 96 };
  assert(!PatternTypes.isPatternNote(invalidNote));
});

test("isPatternChord", () => {
  const validChord: PatternTypes.PatternChord = [
    { MIDI: 60, duration: 96, velocity: 127 },
  ];
  assert(PatternTypes.isPatternChord(validChord));

  const invalidChord = [{ MIDI: 60, duration: 96 }];
  assert(!PatternTypes.isPatternChord(invalidChord));
});

test("isPatternStream", () => {
  const validStream: PatternTypes.PatternStream = [
    [{ MIDI: 60, duration: 96, velocity: 127 }],
  ];
  assert(PatternTypes.isPatternStream(validStream));

  const invalidStream = [[{ MIDI: 60, duration: 96 }]];
  assert(!PatternTypes.isPatternStream(invalidStream));
});
