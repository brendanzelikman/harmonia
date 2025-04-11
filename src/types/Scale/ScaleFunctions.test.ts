import { expect, test } from "vitest";
import * as _ from "./ScaleFunctions";
import * as midi from "utils/midi";
import * as ScaleTransformers from "./ScaleTransformers";
import * as ScaleMidiFunctions from "./ScaleResolvers";
import { Scale, ScaleNote, ScaleObject } from "./ScaleTypes";
import { sumVectors } from "utils/vector";

test("getTransposedMidiNote should correctly add all offsets to the note", () => {
  const note = { MIDI: 5 };
  const offset1 = 5;
  const offset2 = -4;
  expect(ScaleTransformers.getTransposedMidiNote(note)).toEqual({ MIDI: 5 });
  expect(ScaleTransformers.getTransposedMidiNote(note, offset1)).toEqual({
    MIDI: 10,
  });
  expect(ScaleTransformers.getTransposedMidiNote(note, offset2)).toEqual({
    MIDI: 1,
  });
  expect(
    ScaleTransformers.getTransposedMidiNote(note, offset1, offset2)
  ).toEqual({ MIDI: 6 });
});

test("sumVectors should return the correct sum of the offsets", () => {
  const offset1 = { id: 1 };
  const offset2 = { id: 2 };
  const offset3 = { id: -3 };
  expect(sumVectors()).toEqual({});
  expect(sumVectors(offset1)).toEqual({ id: 1 });
  expect(sumVectors(offset1, offset2)).toEqual({ id: 3 });
  expect(sumVectors(offset1, offset2, offset3)).toEqual({
    id: 0,
  });
});

test("getMidiNoteAsValue should correctly extract the MidiValue from a MidiNote", () => {
  const note1 = { MIDI: 5 };
  const note2 = 12;
  const note3 = { MIDI: 10 };
  expect(midi.getMidiValue(note1)).toBe(5);
  expect(midi.getMidiValue(note2)).toBe(12);
  expect(midi.getMidiValue(note3)).toBe(10);
});

test("getScaleNoteAsMidiValue should correctly convert a ScaleNote to a MidiValue", () => {
  const note1 = { degree: 0 };
  const note2 = { degree: 1, offset: { octave: 1 } };
  const note3 = { degree: 1, offset: { octave: 2, chromatic: -11 } };
  expect(_.getScaleNoteMidiValue(note1)).toEqual(60);
  expect(_.getScaleNoteMidiValue(note2)).toEqual(73);
  expect(_.getScaleNoteMidiValue(note3)).toEqual(74);
});

test("getScaleNoteDegree should return the correct degree of a ScaleNote", () => {
  const note1 = { degree: 0 };
  const note2 = { degree: 1, offset: { octave: 1 } };
  const note3 = 65;
  const note4 = { MIDI: 1 };
  expect(_.getScaleNoteDegree(note1)).toEqual(0);
  expect(_.getScaleNoteDegree(note2)).toEqual(1);
  expect(_.getScaleNoteDegree(note3)).toEqual(5);
  expect(_.getScaleNoteDegree(note4)).toEqual(1);
});

test("getScaleNoteOctaveOffset should return the correct octave offset of a ScaleNote", () => {
  const note1 = { degree: 0 };
  const note2 = { degree: 1, offset: { octave: 1 } };
  const note3 = 65;
  const note4 = { MIDI: 59 };
  expect(_.getScaleNoteOctave(note1)).toEqual(0);
  expect(_.getScaleNoteOctave(note2)).toEqual(1);
  expect(_.getScaleNoteOctave(note3)).toEqual(0);
  expect(_.getScaleNoteOctave(note4)).toEqual(-1);
});

test("getScaleNoteAsPitchClass should return the correct pitch class of a ScaleNote", () => {
  const note1 = { degree: 0 };
  const note2 = { degree: 1, offset: { octave: 1 } };
  const note3 = 65;
  const note4 = { MIDI: 59 };
  expect(_.getScaleNotePitchClass(note1)).toEqual("C");
  expect(_.getScaleNotePitchClass(note2)).toEqual("C#");
  expect(_.getScaleNotePitchClass(note3)).toEqual("F");
  expect(_.getScaleNotePitchClass(note4)).toEqual("B");
});

test("getScaleAsArray should return the correct array of notes from a Scale", () => {
  const scale1 = [60, 62, 64];
  const scale2: ScaleObject = { id: "scale_3", notes: scale1 };
  expect(_.getScaleNotes(scale1)).toEqual(scale1);
  expect(_.getScaleNotes(scale2)).toEqual(scale1);
});

test("getScaleAsKey should return the correct pitch classes for a Scale", () => {
  const scale1 = [60, 62, 64];
  const scale2: ScaleObject = {
    id: "scale_3",
    notes: [{ degree: 0, offset: { chromatic: 1 } }],
  };
  expect(_.getScalePitchClasses(scale1)).toEqual(["C", "D", "E"]);
  expect(_.getScalePitchClasses(scale2)).toEqual(["C#"]);
});

test("chainNoteThroughScale should correctly apply the scale's offset", () => {
  const scale: ScaleObject = { id: "scale_3", notes: [60, 62, 64] };
  const note1 = 60;
  const note2 = { MIDI: 65 };
  const note3 = { degree: 1, offset: { scale_3: 1 } };
  const note4 = { degree: 1, offset: {} };
  expect(ScaleTransformers.transposeNoteThroughScale(note1, scale)).toBe(note1);
  expect(ScaleTransformers.transposeNoteThroughScale(note2, scale)).toBe(note2);
  expect(ScaleTransformers.transposeNoteThroughScale(note3, scale)).toBe(64);
  expect(ScaleTransformers.transposeNoteThroughScale(note4, scale)).toBe(62);
});

test("chainNoteThroughScales should correctly apply all relevant offsets", () => {
  const scale1: ScaleObject = { id: "scale_1", notes: [60, 61, 62, 63, 64] };
  const scale2: ScaleObject = {
    id: "scale_2",
    notes: [{ degree: 0 }, { degree: 4 }],
  };
  const note1 = 60;
  const note2 = 61;
  const note3 = { degree: 0, offset: { scale_1: 1 } };
  const note4 = { degree: 0, offset: { scale_2: 1 } };
  const note5 = { degree: 0, offset: { scale_1: 1, scale_2: 1 } };
  expect(
    ScaleTransformers.transposeNoteThroughScales(note1, [scale1, scale2])
  ).toBe(60);
  expect(
    ScaleTransformers.transposeNoteThroughScales(note2, [scale1, scale2])
  ).toBe(61);
  expect(
    ScaleTransformers.transposeNoteThroughScales(note3, [scale1, scale2])
  ).toBe(61);
  expect(
    ScaleTransformers.transposeNoteThroughScales(note4, [scale1, scale2])
  ).toBe(64);
  expect(
    ScaleTransformers.transposeNoteThroughScales(note5, [scale1, scale2])
  ).toBe(72);
});

test("resolveScaleNoteToMIDI should correctly resolve a ScaleNote to a MIDI value", () => {
  const scale1: Scale = {
    id: "scale_1",
    notes: [
      { degree: 0, offset: { chromatic: 1 } },
      { degree: 2 },
      { degree: 4, offset: { chromatic: -1 } },
      { degree: 6 },
    ],
  };
  const scale2: Scale = {
    id: "scale_2",
    notes: [
      { degree: 0, offset: { octave: 1 } },
      { degree: 2, offset: { chromatic: 1 } },
      { degree: 3 },
    ],
  };
  expect(
    ScaleMidiFunctions.resolveScaleNoteToMidi({ degree: 0 }, [scale1])
  ).toBe(61);
  expect(
    ScaleMidiFunctions.resolveScaleNoteToMidi({ degree: 1 }, [scale1])
  ).toBe(62);
  expect(
    ScaleMidiFunctions.resolveScaleNoteToMidi({ degree: 2 }, [scale1])
  ).toBe(63);
  expect(
    ScaleMidiFunctions.resolveScaleNoteToMidi({ degree: 3 }, [scale1])
  ).toBe(66);
  expect(
    ScaleMidiFunctions.resolveScaleNoteToMidi({ degree: 4 }, [scale1])
  ).toBe(73);
  expect(
    ScaleMidiFunctions.resolveScaleNoteToMidi({ degree: 5 }, [scale1])
  ).toBe(74);
  expect(
    ScaleMidiFunctions.resolveScaleNoteToMidi({ degree: 0 }, [scale1, scale2])
  ).toBe(73);
  expect(
    ScaleMidiFunctions.resolveScaleNoteToMidi({ degree: 1 }, [scale1, scale2])
  ).toBe(64);
  expect(
    ScaleMidiFunctions.resolveScaleNoteToMidi({ degree: 2 }, [scale1, scale2])
  ).toBe(66);
});

test("resolveScaleNoteToMIDI should work with a complex chain of scales", () => {
  const scale1: ScaleObject = {
    id: "scale_1",
    notes: [{ degree: 0, offset: { chromatic: 1 } }, { degree: 1 }],
  };
  const scale2: ScaleObject = {
    id: "scale_2",
    notes: [{ degree: 0 }, { degree: 1, offset: { chromatic: 1 } }],
  };
  const scale3: ScaleObject = {
    id: "scale_3",
    notes: [{ degree: 0, offset: { chromatic: 1 } }, { degree: 1 }],
  };
  const scale4: ScaleObject = {
    id: "scale_4",
    notes: [{ degree: 0 }, { degree: 1, offset: { chromatic: 1 } }],
  };
  const scale5: ScaleObject = {
    id: "scale_5",
    notes: [{ degree: 0, offset: { chromatic: 1 } }, { degree: 1 }],
  };
  const note: ScaleNote = {
    degree: 0,
    offset: { scale_1: 1, scale_2: 1, scale_3: 1, scale_4: 1 },
  };
  const scales = [scale1, scale2, scale3, scale4, scale5];

  // Start with degree = 0
  // s5[0] = {degree: 0, offset: {chromatic: 1}}
  // s4[0+1] = {degree: 1, offset: {chromatic: 1+1}}
  // s3[1+1] = {degree: 0, offset: {chromatic: 1+1+1, octave: 1}}
  // s2[0+1] = {degree: 1, offset: {chromatic: 1+1+1+1, octave: 1}}
  // s1[1+1] = {degree: 0, offset: {chromatic: 1+1+1+1+1, octave: 1+1}}
  // chromatic[0] + 5 + 2*12 = 89
  const expectedAnswer = 89;

  expect(ScaleMidiFunctions.resolveScaleNoteToMidi(note, scales)).toBe(
    expectedAnswer
  );
});

test("getTransposedScale should return the original scale if the offset is 0", () => {
  // Scale 1 = C major scale
  const scale1: Scale = {
    id: "scale_1",
    notes: [60, 62, 64, 65, 67, 69, 71],
  };
  // Scale 2 = A minor arpeggio
  const scale2: Scale = {
    id: "scale_2",
    notes: [
      { degree: 0 },
      { degree: 2 },
      { degree: 5, offset: { scale_1: 1 } },
      { degree: 5 },
    ],
  };
  // Test the base case for scale1
  expect(ScaleTransformers.getTransposedScale(scale1, 0)).toEqual(scale1);
  expect(ScaleMidiFunctions.resolveScaleToMidi(scale1)).toEqual([
    60, 62, 64, 65, 67, 69, 71,
  ]);

  // Test the base case for scale2
  expect(ScaleTransformers.getTransposedScale(scale2, 0)).toEqual(scale2);
  expect(ScaleMidiFunctions.resolveScaleChainToMidi([scale1, scale2])).toEqual([
    60, 64, 71, 69,
  ]);
});

test("getTransposedScale should correctly transpose a scale without a parent", () => {
  // Scale 1 = C major scale
  const scale1: Scale = {
    id: "scale_1",
    notes: [60, 62, 64, 65, 67, 69, 71],
  };
  // Scale 2 = A minor arpeggio
  const scale2: Scale = {
    id: "scale_2",
    notes: [
      { degree: 0 },
      { degree: 2 },
      { degree: 5, offset: { scale_1: 1 } },
      { degree: 5 },
    ],
  };

  // Test scale1 transposed by 1 with no parent
  const np1 = ScaleTransformers.getTransposedScale(scale1, 1);
  expect(np1).toEqual({
    id: "scale_1",
    notes: [61, 63, 65, 66, 68, 70, 72],
  });
  expect(ScaleMidiFunctions.resolveScaleToMidi(np1)).toEqual([
    61, 63, 65, 66, 68, 70, 72,
  ]);

  // Test scale2 transposed by 1 with no parent
  const np2 = ScaleTransformers.getTransposedScale(scale2, 1);
  expect(np2).toEqual({
    id: "scale_2",
    notes: [
      { degree: 0, offset: { chromatic: 1 } },
      { degree: 2, offset: { chromatic: 1 } },
      { degree: 5, offset: { scale_1: 1, chromatic: 1 } },
      { degree: 5, offset: { chromatic: 1 } },
    ],
  });
  expect(ScaleMidiFunctions.resolveScaleChainToMidi([scale1, np2])).toEqual([
    61, 65, 72, 70,
  ]);
});

test("getTransposedScale should correctly transpose a scale using a parent", () => {
  // Scale 1 = C major scale
  const scale1: Scale = {
    id: "scale_1",
    notes: [60, 62, 64, 65, 67, 69, 71],
  };
  // Scale 2 = A minor arpeggio
  const scale2: Scale = {
    id: "scale_2",
    notes: [
      { degree: 0 },
      { degree: 2 },
      { degree: 5, offset: { scale_1: 1 } },
      { degree: 5 },
    ],
  };

  // Test scale2 transposed by 1 within scale1
  const p1 = ScaleTransformers.getTransposedScale(scale2, 1, "scale_1");
  expect(ScaleMidiFunctions.resolveScaleChainToMidi([scale1, p1])).toEqual([
    62, 65, 72, 71,
  ]);

  // Test scale2  transposed along scale2
  const p2 = ScaleTransformers.getTransposedScale(scale2, 1, "scale_2");
  expect(ScaleMidiFunctions.resolveScaleChainToMidi([scale1, p2])).toEqual([
    64, 71, 69, 72,
  ]);
});

test("getRotatedScale should correctly rotate a scale", () => {
  // Scale 1 = C major scale
  const scale1: Scale = {
    id: "scale_1",
    notes: [60, 62, 64, 65, 67, 69, 71],
  };
  // Scale 2 = A minor arpeggio
  const scale2: Scale = {
    id: "scale_2",
    notes: [
      { degree: 0 },
      { degree: 2 },
      { degree: 5, offset: { scale_1: 1 } },
      { degree: 5 },
    ],
  };

  // Test scale1 rotated by 1
  const p1 = ScaleTransformers.getRotatedScale(scale1, 1);
  expect(ScaleMidiFunctions.resolveScaleChainToMidi([p1])).toEqual([
    62, 64, 65, 67, 69, 71, 72,
  ]);

  // Test scale2 rotated by 1
  const p2 = ScaleTransformers.getRotatedScale(scale2, 1);
  expect(ScaleMidiFunctions.resolveScaleChainToMidi([scale1, p2])).toEqual([
    64, 71, 69, 72,
  ]);
});
