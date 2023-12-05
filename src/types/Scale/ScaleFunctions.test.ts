import { expect, test } from "vitest";
import * as _ from "./ScaleFunctions";
import { Scale, ScaleNote } from "./ScaleTypes";

test("getTransposedMidiNote should correctly add all offsets to the note", () => {
  const note = { MIDI: 5 };
  const offset1 = 5;
  const offset2 = -4;
  expect(_.getTransposedMidiNote(note)).toEqual({ MIDI: 5 });
  expect(_.getTransposedMidiNote(note, offset1)).toEqual({ MIDI: 10 });
  expect(_.getTransposedMidiNote(note, offset2)).toEqual({ MIDI: 1 });
  expect(_.getTransposedMidiNote(note, offset1, offset2)).toEqual({ MIDI: 6 });
});

test("sumScaleOffsets should return the correct sum of the offsets", () => {
  const offset1 = { id: 1 };
  const offset2 = { id: 2 };
  const offset3 = { id: -3 };
  expect(_.sumScaleVectors([])).toEqual({});
  expect(_.sumScaleVectors([offset1])).toEqual({ id: 1 });
  expect(_.sumScaleVectors([offset1, offset2])).toEqual({ id: 3 });
  expect(_.sumScaleVectors([offset1, offset2, offset3])).toEqual({ id: 0 });
});

test("getMidiNoteAsValue should correctly extract the MidiValue from a MidiNote", () => {
  const note1 = { MIDI: 5 };
  const note2 = 12;
  const note3 = { MIDI: 10 };
  expect(_.getMidiNoteAsValue(note1)).toBe(5);
  expect(_.getMidiNoteAsValue(note2)).toBe(12);
  expect(_.getMidiNoteAsValue(note3)).toBe(10);
});

test("getMidiNoteAsScaleNote should correctly convert a MidiNote to a ScaleNote", () => {
  const note1 = 60;
  const note2 = { MIDI: 73 };
  expect(_.getMidiNoteAsScaleNote(note1)).toEqual({ degree: 0 });
  expect(_.getMidiNoteAsScaleNote(note2)).toEqual({
    degree: 1,
    offset: { octave: 1 },
  });
});

test("getScaleNoteAsMidiValue should correctly convert a ScaleNote to a MidiValue", () => {
  const note1 = { degree: 0 };
  const note2 = { degree: 1, offset: { octave: 1 } };
  const note3 = { degree: 1, offset: { octave: 2, chromatic: -11 } };
  expect(_.getScaleNoteAsMidiValue(note1)).toEqual(60);
  expect(_.getScaleNoteAsMidiValue(note2)).toEqual(73);
  expect(_.getScaleNoteAsMidiValue(note3)).toEqual(74);
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
  expect(_.getScaleNoteOctaveOffset(note1)).toEqual(0);
  expect(_.getScaleNoteOctaveOffset(note2)).toEqual(1);
  expect(_.getScaleNoteOctaveOffset(note3)).toEqual(0);
  expect(_.getScaleNoteOctaveOffset(note4)).toEqual(-1);
});

test("getScaleNoteAsPitchClass should return the correct pitch class of a ScaleNote", () => {
  const note1 = { degree: 0 };
  const note2 = { degree: 1, offset: { octave: 1 } };
  const note3 = 65;
  const note4 = { MIDI: 59 };
  expect(_.getScaleNoteAsPitchClass(note1)).toEqual("C");
  expect(_.getScaleNoteAsPitchClass(note2)).toEqual("C#");
  expect(_.getScaleNoteAsPitchClass(note3)).toEqual("F");
  expect(_.getScaleNoteAsPitchClass(note4)).toEqual("B");
});

test("getScaleAsArray should return the correct array of notes from a Scale", () => {
  const scale1 = [60, 62, 64];
  const scale2 = { id: "id", notes: scale1 };
  expect(_.getScaleAsArray(scale1)).toEqual(scale1);
  expect(_.getScaleAsArray(scale2)).toEqual(scale1);
});

test("getScaleAsKey should return the correct pitch classes for a Scale", () => {
  const scale1 = [60, 62, 64];
  const scale2 = { id: "id", notes: [{ degree: 0, offset: { chromatic: 1 } }] };
  expect(_.getScaleAsKey(scale1)).toEqual(["C", "D", "E"]);
  expect(_.getScaleAsKey(scale2)).toEqual(["C#"]);
});

test("chainNoteThroughScale should correctly apply the scale's offset", () => {
  const scale = { id: "id", notes: [60, 62, 64] };
  const note1 = 60;
  const note2 = { MIDI: 65 };
  const note3 = { degree: 1, offset: { id: 1 } };
  const note4 = { degree: 1, offset: {} };
  expect(_.cycleNoteThroughScale(note1, scale)).toBe(note1);
  expect(_.cycleNoteThroughScale(note2, scale)).toBe(note2);
  expect(_.cycleNoteThroughScale(note3, scale)).toBe(64);
  expect(_.cycleNoteThroughScale(note4, scale)).toBe(62);
});

test("chainNoteThroughScales should correctly apply all relevant offsets", () => {
  const scale1 = { id: "s1", notes: [60, 61, 62, 63, 64] };
  const scale2 = { id: "s2", notes: [{ degree: 0 }, { degree: 4 }] };
  const note1 = 60;
  const note2 = 61;
  const note3 = { degree: 0, offset: { s1: 1 } };
  const note4 = { degree: 0, offset: { s2: 1 } };
  const note5 = { degree: 0, offset: { s1: 1, s2: 1 } };
  expect(_.cycleNoteThroughScales(note1, [scale1, scale2])).toBe(60);
  expect(_.cycleNoteThroughScales(note2, [scale1, scale2])).toBe(61);
  expect(_.cycleNoteThroughScales(note3, [scale1, scale2])).toBe(61);
  expect(_.cycleNoteThroughScales(note4, [scale1, scale2])).toBe(64);
  expect(_.cycleNoteThroughScales(note5, [scale1, scale2])).toBe(72);
});

test("resolveScaleNoteToMIDI should correctly resolve a ScaleNote to a MIDI value", () => {
  const scale1: Scale = {
    id: "s1",
    notes: [
      { degree: 0, offset: { chromatic: 1 } },
      { degree: 2 },
      { degree: 4, offset: { chromatic: -1 } },
      { degree: 6 },
    ],
  };
  const scale2: Scale = {
    id: "s2",
    notes: [
      { degree: 0, offset: { octave: 1 } },
      { degree: 2, offset: { chromatic: 1 } },
      { degree: 3 },
    ],
  };
  expect(_.resolveScaleNoteToMidi({ degree: 0 }, [scale1])).toBe(61);
  expect(_.resolveScaleNoteToMidi({ degree: 1 }, [scale1])).toBe(62);
  expect(_.resolveScaleNoteToMidi({ degree: 2 }, [scale1])).toBe(63);
  expect(_.resolveScaleNoteToMidi({ degree: 3 }, [scale1])).toBe(66);
  expect(_.resolveScaleNoteToMidi({ degree: 4 }, [scale1])).toBe(73);
  expect(_.resolveScaleNoteToMidi({ degree: 5 }, [scale1])).toBe(74);
  expect(_.resolveScaleNoteToMidi({ degree: 0 }, [scale1, scale2])).toBe(73);
  expect(_.resolveScaleNoteToMidi({ degree: 1 }, [scale1, scale2])).toBe(64);
  expect(_.resolveScaleNoteToMidi({ degree: 2 }, [scale1, scale2])).toBe(66);
});

test("resolveScaleNoteToMIDI should work with a complex chain of scales", () => {
  const scale1: Scale = {
    id: "s1",
    notes: [{ degree: 0, offset: { chromatic: 1 } }, { degree: 1 }],
  };
  const scale2: Scale = {
    id: "s2",
    notes: [{ degree: 0 }, { degree: 1, offset: { chromatic: 1 } }],
  };
  const scale3: Scale = {
    id: "s3",
    notes: [{ degree: 0, offset: { chromatic: 1 } }, { degree: 1 }],
  };
  const scale4: Scale = {
    id: "s4",
    notes: [{ degree: 0 }, { degree: 1, offset: { chromatic: 1 } }],
  };
  const scale5: Scale = {
    id: "s5",
    notes: [{ degree: 0, offset: { chromatic: 1 } }, { degree: 1 }],
  };
  const note: ScaleNote = {
    degree: 0,
    offset: { s1: 1, s2: 1, s3: 1, s4: 1 },
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

  expect(_.resolveScaleNoteToMidi(note, scales)).toBe(expectedAnswer);
});

test("getTransposedScale should return the original scale if the offset is 0", () => {
  // Scale 1 = C major scale
  const scale1: Scale = {
    id: "s1",
    notes: [60, 62, 64, 65, 67, 69, 71],
  };
  // Scale 2 = A minor arpeggio
  const scale2: Scale = {
    id: "s2",
    notes: [
      { degree: 0 },
      { degree: 2 },
      { degree: 5, offset: { s1: 1 } },
      { degree: 5 },
    ],
  };
  // Test the base case for scale1
  expect(_.getTransposedScale(scale1, 0)).toEqual(scale1);
  expect(_.resolveScaleToMidi(scale1)).toEqual([60, 62, 64, 65, 67, 69, 71]);

  // Test the base case for scale2
  expect(_.getTransposedScale(scale2, 0)).toEqual(scale2);
  expect(_.resolveScaleChainToMidi([scale1, scale2])).toEqual([60, 64, 71, 69]);
});

test("getTransposedScale should correctly transpose a scale without a parent", () => {
  // Scale 1 = C major scale
  const scale1: Scale = {
    id: "s1",
    notes: [60, 62, 64, 65, 67, 69, 71],
  };
  // Scale 2 = A minor arpeggio
  const scale2: Scale = {
    id: "s2",
    notes: [
      { degree: 0 },
      { degree: 2 },
      { degree: 5, offset: { s1: 1 } },
      { degree: 5 },
    ],
  };

  // Test scale1 transposed by 1 with no parent
  const np1 = _.getTransposedScale(scale1, 1);
  expect(np1).toEqual({
    id: "s1",
    notes: [61, 63, 65, 66, 68, 70, 72],
  });
  expect(_.resolveScaleToMidi(np1)).toEqual([61, 63, 65, 66, 68, 70, 72]);

  // Test scale2 transposed by 1 with no parent
  const np2 = _.getTransposedScale(scale2, 1);
  expect(np2).toEqual({
    id: "s2",
    notes: [
      { degree: 0, offset: { chromatic: 1 } },
      { degree: 2, offset: { chromatic: 1 } },
      { degree: 5, offset: { s1: 1, chromatic: 1 } },
      { degree: 5, offset: { chromatic: 1 } },
    ],
  });
  expect(_.resolveScaleChainToMidi([scale1, np2])).toEqual([61, 65, 72, 70]);
});

test("getTransposedScale should correctly transpose a scale using a parent", () => {
  // Scale 1 = C major scale
  const scale1: Scale = {
    id: "s1",
    notes: [60, 62, 64, 65, 67, 69, 71],
  };
  // Scale 2 = A minor arpeggio
  const scale2: Scale = {
    id: "s2",
    notes: [
      { degree: 0 },
      { degree: 2 },
      { degree: 5, offset: { s1: 1 } },
      { degree: 5 },
    ],
  };

  // Test scale2 transposed by 1 within scale1
  const p1 = _.getTransposedScale(scale2, 1, "s1");
  expect(_.resolveScaleChainToMidi([scale1, p1])).toEqual([62, 65, 72, 71]);

  // Test scale2 not transposed along scale2
  const p2 = _.getTransposedScale(scale2, 1, "s2");
  expect(_.resolveScaleChainToMidi([scale1, p2])).toEqual([60, 64, 71, 69]);
});

test("getRotatedScale should correctly rotate a scale", () => {
  // Scale 1 = C major scale
  const scale1: Scale = {
    id: "s1",
    notes: [60, 62, 64, 65, 67, 69, 71],
  };
  // Scale 2 = A minor arpeggio
  const scale2: Scale = {
    id: "s2",
    notes: [
      { degree: 0 },
      { degree: 2 },
      { degree: 5, offset: { s1: 1 } },
      { degree: 5 },
    ],
  };

  // Test scale1 rotated by 1
  const p1 = _.getRotatedScale(scale1, 1);
  expect(_.resolveScaleChainToMidi([p1])).toEqual([62, 64, 65, 67, 69, 71, 72]);

  // Test scale2 rotated by 1
  const p2 = _.getRotatedScale(scale2, 1);
  expect(_.resolveScaleChainToMidi([scale1, p2])).toEqual([64, 71, 69, 72]);
});
