import { expect, test } from "vitest";
import * as _ from "./ScaleTypes";
import * as ScaleUtils from "./ScaleUtils";

test("initializeScale should create a scale with a unique ID", () => {
  const oldScale = _.initializeScale();
  const scale = _.initializeScale(oldScale);
  expect(scale.id).toBeDefined();
  expect(scale.id).not.toEqual(oldScale.id);
});

test("isMidiValue should only return true for valid MIDI values", () => {
  expect(_.isMidiValue(0)).toBe(true);
  expect(_.isMidiValue(127)).toBe(true);

  expect(_.isMidiValue(undefined)).toBe(false);
  expect(_.isMidiValue({ MIDI: 60 })).toBe(false);
  expect(_.isMidiValue(-1)).toBe(false);
  expect(_.isMidiValue(128)).toBe(false);
});

test("isMidiObject should only return true for valid MIDI objects", () => {
  expect(_.isMidiObject({ MIDI: 0 })).toBe(true);
  expect(_.isMidiObject({ MIDI: 127 })).toBe(true);

  expect(_.isMidiObject(undefined)).toBe(false);
  expect(_.isMidiObject({ MIDI: "1" })).toBe(false);
  expect(_.isMidiObject({ MIDI: -1 })).toBe(false);
  expect(_.isMidiObject({ MIDI: 128 })).toBe(false);
  expect(_.isMidiObject(60)).toBe(false);
});

test("isMidiNote should only return true for valid values and objects", () => {
  expect(_.isMidiNote(0)).toBe(true);
  expect(_.isMidiNote(127)).toBe(true);
  expect(_.isMidiNote({ MIDI: 0 })).toBe(true);
  expect(_.isMidiNote({ MIDI: 127 })).toBe(true);

  expect(_.isMidiNote(undefined)).toBe(false);
  expect(_.isMidiNote(-1)).toBe(false);
  expect(_.isMidiNote(128)).toBe(false);
  expect(_.isMidiNote({ MIDI: -1 })).toBe(false);
  expect(_.isMidiNote({ MIDI: 128 })).toBe(false);
});

test("isNestedNote should only return true for valid nested notes", () => {
  expect(_.isNestedNote({ degree: 1 })).toBe(true);
  expect(_.isNestedNote({ degree: 1, scaleId: "s1" })).toBe(true);
  expect(_.isNestedNote({ degree: 1, scaleId: "s1", offset: {} })).toBe(true);
  expect(_.isNestedNote({ degree: 1, offset: { id: 1 } })).toBe(true);

  expect(_.isNestedNote(undefined)).toBe(false);
  expect(_.isNestedNote({})).toBe(false);
  expect(_.isNestedNote({ degree: 1, scaleId: 1 })).toBe(false);
  expect(_.isNestedNote({ degree: 1, scaleId: "s1", offset: 1 })).toBe(false);
  expect(_.isNestedNote({ degree: 1, offset: { octave: "1" } })).toBe(false);
});

test("isScaleNote should return only true for valid scale notes", () => {
  expect(_.isScaleNote(60)).toBe(true);
  expect(_.isScaleNote({ MIDI: 60 })).toBe(true);
  expect(_.isScaleNote({ degree: 1 })).toBe(true);
  expect(_.isScaleNote({ degree: 1, offset: { s: 1 } })).toBe(true);

  expect(_.isScaleNote(undefined)).toBe(false);
  expect(_.isScaleNote({})).toBe(false);
  expect(_.isScaleNote(-1)).toBe(false);
  expect(_.isScaleNote(128)).toBe(false);
  expect(_.isScaleNote({ MIDI: -1 })).toBe(false);
  expect(_.isScaleNote({ MIDI: 128 })).toBe(false);
  expect(_.isScaleNote({ degree: 1, offset: { s: "1" } })).toBe(false);
});

test("isScaleNoteObject should return only true for valid note objects", () => {
  expect(_.isScaleNoteObject({ MIDI: 60 })).toBe(true);
  expect(_.isScaleNoteObject({ degree: 1 })).toBe(true);
  expect(_.isScaleNoteObject({ degree: 1, offset: { s: 1 } })).toBe(true);

  expect(_.isScaleNoteObject(undefined)).toBe(false);
  expect(_.isScaleNoteObject({})).toBe(false);
  expect(_.isScaleNoteObject(-1)).toBe(false);
  expect(_.isScaleNoteObject(128)).toBe(false);
  expect(_.isScaleNoteObject({ MIDI: -1 })).toBe(false);
  expect(_.isScaleNoteObject({ MIDI: 128 })).toBe(false);
  expect(_.isScaleNoteObject({ degree: 1, offset: { s: "1" } })).toBe(false);
});

test("isScaleArray should only return true for valid scale arrays", () => {
  expect(_.isScaleArray([])).toBe(true);
  expect(_.isScaleArray([60])).toBe(true);
  expect(_.isScaleArray([60, 62, 64])).toBe(true);
  expect(_.isScaleArray([60, { MIDI: 62 }, { degree: 3 }])).toBe(true);

  expect(_.isScaleArray(undefined)).toBe(false);
  expect(_.isScaleArray(0)).toBe(false);
  expect(_.isScaleArray({})).toBe(false);
  expect(_.isScaleArray([[]])).toBe(false);
  expect(_.isScaleArray([60, [62], 64, 65])).toBe(false);
  expect(_.isScaleArray({ notes: [60, 62, 64] })).toBe(false);
});

test("isScaleObject should only return true for valid scale objects", () => {
  expect(_.isScaleObject({ id: "id", notes: [] })).toBe(true);
  expect(_.isScaleObject({ id: "id", notes: [60] })).toBe(true);
  expect(_.isScaleObject({ id: "id", notes: [{ MIDI: 60 }] })).toBe(true);
  expect(_.isScaleObject({ id: "id", notes: [{ degree: 1 }] })).toBe(true);

  expect(_.isScaleObject(undefined)).toBe(false);
  expect(_.isScaleObject(0)).toBe(false);
  expect(_.isScaleObject({})).toBe(false);
  expect(_.isScaleObject([60, 62, 64])).toBe(false);
});

test("isScale should only return true for valid scales", () => {
  expect(_.isScale([])).toBe(true);
  expect(_.isScale([60])).toBe(true);
  expect(_.isScale([60, 62, 64])).toBe(true);
  expect(_.isScale([60, { MIDI: 62 }, { degree: 3 }])).toBe(true);
  expect(_.isScale({ id: "id", notes: [] })).toBe(true);
  expect(_.isScale({ id: "id", notes: [60] })).toBe(true);
  expect(_.isScale({ id: "id", notes: [{ MIDI: 60 }] })).toBe(true);
  expect(_.isScale({ id: "id", notes: [{ degree: 1 }] })).toBe(true);

  expect(_.isScale(undefined)).toBe(false);
  expect(_.isScale(0)).toBe(false);
  expect(_.isScale({})).toBe(false);
  expect(_.isScale({ notes: [[]] })).toBe(false);
  expect(_.isScale({ notes: [60, [62], 64, 65] })).toBe(false);
});

test("areScalesEqual should return true for identical scales", () => {
  const scale1 = [60, 62, 64];
  const scale2 = [72, 74, 76];
  const scale3 = [{ MIDI: 60 }, { MIDI: 62 }, { MIDI: 64 }];
  const scale4 = [{ degree: 0 }, { degree: 2 }, { degree: 4 }];
  const scale5 = { id: "id", notes: scale1 };
  const scale6 = { id: "id", notes: scale2 };
  const scale7 = { id: "id", notes: scale3 };
  const scale8 = { id: "id", notes: scale4 };
  expect(ScaleUtils.areScalesEqual(scale1, scale2)).toBe(true);
  expect(ScaleUtils.areScalesEqual(scale1, scale3)).toBe(true);
  expect(ScaleUtils.areScalesEqual(scale1, scale4)).toBe(true);
});

test("areScalesEqual should return false for invalid or different scales", () => {
  const scale1 = [60, 62, 64];
  const scale2 = [61, 63, 65];
  const scale3 = [{ MIDI: 60 }, { MIDI: 62 }];
  const scale4 = [{ degree: 0 }, { degree: 2 }, { degree: 4 }, { degree: 6 }];
  expect(ScaleUtils.areScalesEqual(scale1, scale2)).toBe(false);
  expect(ScaleUtils.areScalesEqual(scale1, scale3)).toBe(false);
  expect(ScaleUtils.areScalesEqual(scale1, scale4)).toBe(false);
  expect(ScaleUtils.areScalesEqual(scale1, [])).toBe(false);
});

test("areScalesRelated should return true for related scales", () => {
  const scale1 = [60, 62, 64];
  const scale2 = [72, 74, 76];
  const scale3 = [{ MIDI: 61 }, { MIDI: 63 }, { MIDI: 65 }];
  const scale4 = [{ degree: 5 }, { degree: 7 }, { degree: 9 }];
  const scale5 = { id: "id", notes: scale1 };
  const scale6 = { id: "id", notes: scale2 };
  const scale7 = { id: "id", notes: scale3 };
  const scale8 = { id: "id", notes: scale4 };
  expect(ScaleUtils.areScalesRelated(scale1, scale2)).toBe(true);
  expect(ScaleUtils.areScalesRelated(scale1, scale3)).toBe(true);
  expect(ScaleUtils.areScalesRelated(scale1, scale4)).toBe(true);
});

test("areScalesRelated should return false for invalid or unrelated scales", () => {
  const scale1 = [60, 62, 64];
  const scale2 = [61, 62, 64];
  const scale3 = [{ MIDI: 60 }, { MIDI: 62 }];
  const scale4 = [{ degree: 0 }, { degree: 1 }, { degree: 2 }, { degree: 4 }];
  expect(ScaleUtils.areScalesRelated(scale1, scale2)).toBe(false);
  expect(ScaleUtils.areScalesRelated(scale1, scale3)).toBe(false);
  expect(ScaleUtils.areScalesRelated(scale1, scale4)).toBe(false);
  expect(ScaleUtils.areScalesRelated(scale1, [])).toBe(false);
});

test("areScalesModes should return true for modes of the same scale", () => {
  const scale1 = [60, 62, 64];
  const scale2 = [62, 64, 72];
  const scale3 = [{ MIDI: 64 }, { MIDI: 72 }, { MIDI: 74 }];
  const scale4 = [{ degree: 0 }, { degree: 2 }, { degree: 4 }];
  const scale5 = { id: "id", notes: scale1 };
  const scale6 = { id: "id", notes: scale2 };
  const scale7 = { id: "id", notes: scale3 };
  const scale8 = { id: "id", notes: scale4 };
  expect(ScaleUtils.areScalesModes(scale1, scale2)).toBe(true);
  expect(ScaleUtils.areScalesModes(scale1, scale3)).toBe(true);
  expect(ScaleUtils.areScalesModes(scale1, scale4)).toBe(true);
});

test("areScalesModes should return false for invalid or unrelated scales", () => {
  const scale1 = [60, 62, 64];
  const scale2 = [61, 62, 64];
  const scale3 = [{ MIDI: 60 }, { MIDI: 62 }];
  const scale4 = [{ degree: 0 }, { degree: 4 }, { degree: 2 }];
  expect(ScaleUtils.areScalesModes(scale1, scale2)).toBe(false);
  expect(ScaleUtils.areScalesModes(scale1, scale3)).toBe(false);
  expect(ScaleUtils.areScalesModes(scale1, scale4)).toBe(false);
  expect(ScaleUtils.areScalesModes(scale1, undefined)).toBe(false);
  expect(ScaleUtils.areScalesModes(scale1, [])).toBe(false);
});
