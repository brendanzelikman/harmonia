import { expect, test } from "vitest";
import * as _ from "./ScaleTypes";
import * as ScaleUtils from "./ScaleUtils";

test("initializeScale should create a scale with a unique ID", () => {
  const oldScale = _.initializeScale();
  const scale = _.initializeScale(oldScale);
  expect(scale.id).toBeDefined();
  expect(scale.id).not.toEqual(oldScale.id);
});

test("isMidiObject should only return true for valid MIDI objects", () => {
  expect(_.isMidiObject({ MIDI: 0 })).toBe(true);
  expect(_.isMidiObject({ MIDI: 127 })).toBe(true);
  expect(_.isMidiObject(60)).toBe(false);
});

// test("isMidiNote should only return true for valid values and objects", () => {
//   expect(_.isMidiNote(0)).toBe(true);
//   expect(_.isMidiNote(127)).toBe(true);
//   expect(_.isMidiNote({ MIDI: 0 })).toBe(true);
//   expect(_.isMidiNote({ MIDI: 127 })).toBe(true);

//   expect(_.isMidiNote(undefined)).toBe(false);
//   expect(_.isMidiNote(-1)).toBe(false);
//   expect(_.isMidiNote(128)).toBe(false);
//   expect(_.isMidiNote({ MIDI: -1 })).toBe(false);
//   expect(_.isMidiNote({ MIDI: 128 })).toBe(false);
// });

test("isNestedNote should only return true for valid nested notes", () => {
  expect(_.isNestedNote({ degree: 1 })).toBe(true);
  expect(_.isNestedNote({ degree: 1, scaleId: _.initializeScale().id })).toBe(
    true
  );
  expect(
    _.isNestedNote({ degree: 1, scaleId: _.initializeScale().id, offset: {} })
  ).toBe(true);
  expect(_.isNestedNote({ degree: 1, offset: { id: 1 } })).toBe(true);

  expect(_.isNestedNote(undefined)).toBe(false);
  expect(_.isNestedNote({})).toBe(false);
  expect(_.isNestedNote({ degree: 1, scaleId: 1 })).toBe(true);
});

test("isScaleNoteObject should return only true for valid note objects", () => {
  expect(_.isScaleNoteObject({ MIDI: 60 })).toBe(true);
  expect(_.isScaleNoteObject({ degree: 1 })).toBe(true);
  expect(
    _.isScaleNoteObject({ degree: 1, offset: { [_.initializeScale().id]: 1 } })
  ).toBe(true);
});

test("areScalesEqual should return true for identical scales", () => {
  const scale1 = [60, 62, 64];
  const scale2 = [72, 74, 76];
  const scale3 = [{ MIDI: 60 }, { MIDI: 62 }, { MIDI: 64 }];
  const scale4 = [{ degree: 0 }, { degree: 2 }, { degree: 4 }];

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
