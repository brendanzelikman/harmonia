import { expect, test } from "vitest";
import * as ScaleFunctions from "./ScaleFunctions";
import { chromaticNotes, chromaticScale, mockScale } from "./ScaleTypes";

test("getScaleNotes", () => {
  const notes = chromaticNotes;
  expect(ScaleFunctions.getScaleNotes(chromaticScale)).toEqual(notes);
  expect(ScaleFunctions.getScaleNotes(chromaticNotes)).toEqual(notes);
});

test("mapNestedNote", () => {
  const n1 = ScaleFunctions.mapNestedNote(60);
  expect(n1).toEqual({ degree: 0, offset: 0 });

  const n2 = ScaleFunctions.mapNestedNote(61);
  expect(n2).toEqual({ degree: 1, offset: 0 });

  const n3 = ScaleFunctions.mapNestedNote(59);
  expect(n3).toEqual({ degree: 11, offset: -12 });
});

// test("getChromaticallyTransposedTrackScale", () => {
//   // Create a scale track with a C major 7 scale
//   const scaleTrack = initializeScaleTrack({
//     ...mockScaleTrack,
//     trackScale: [
//       { degree: 0, offset: 0 },
//       { degree: 4, offset: 0 },
//       { degree: 7, offset: 0 },
//       { degree: 11, offset: 0 },
//     ],
//   });
//   // Transpose the scale track by a chromatic interval of 1
//   const transposedScaleTrack =
//     ScaleFunctions.getChromaticallyTransposedNestedScale(
//       scaleTrack.trackScale,
//       1
//     );
//   // Expect the transposed scale track to be a C# major 7 scale
//   expect(transposedScaleTrack).toEqual([
//     { degree: 0, offset: 1 },
//     { degree: 4, offset: 1 },
//     { degree: 7, offset: 1 },
//     { degree: 11, offset: 1 },
//   ]);
// });

// test("getChordallyTransposedTrackScale", () => {
//   // Create a scale track with a C major 7 scale
//   const scaleTrack = initializeScaleTrack({
//     ...mockScaleTrack,
//     trackScale: [
//       { degree: 0, offset: 0 },
//       { degree: 4, offset: 0 },
//       { degree: 7, offset: 0 },
//       { degree: 11, offset: 0 },
//     ],
//   });
//   // Transpose the scale track by a chordal interval of 1
//   const transposedScaleTrack = ScaleFunctions.getChordallyTransposedTrackScale(
//     scaleTrack.trackScale,
//     1
//   );
//   // Expect the transposed scale track to be a C major 7 scale in first inversion
//   expect(transposedScaleTrack).toEqual([
//     { degree: 4, offset: 0 },
//     { degree: 7, offset: 0 },
//     { degree: 11, offset: 0 },
//     { degree: 0, offset: 12 },
//   ]);
// });

// test("getScalarlyTransposedTrackScale", () => {
//   // Create a parent scale track with a C major scale
//   const parentScaleTrack = initializeScaleTrack({
//     ...mockScaleTrack,
//     trackScale: [
//       { degree: 0, offset: 0 },
//       { degree: 2, offset: 0 },
//       { degree: 4, offset: 0 },
//       { degree: 5, offset: 0 },
//       { degree: 7, offset: 0 },
//       { degree: 9, offset: 0 },
//       { degree: 11, offset: 0 },
//     ],
//   });
//   // Create a child scale track with a C major 7 scale
//   const childScaleTrack = initializeScaleTrack({
//     ...mockScaleTrack,
//     parentId: parentScaleTrack.id,
//     trackScale: [
//       { degree: 0, offset: 0 },
//       { degree: 2, offset: 0 },
//       { degree: 4, offset: 0 },
//       { degree: 6, offset: 0 },
//     ],
//   });
//   // Transpose the child scale track by a scalar interval of 1
//   const transposedScaleTrack = ScaleFunctions.getScalarlyTransposedTrackScale(
//     childScaleTrack.trackScale,
//     1,
//     parentScaleTrack.trackScale
//   );
//   // Expect the transposed scale track to be a D minor 7 chord
//   expect(transposedScaleTrack).toEqual([
//     { degree: 1, offset: 0 },
//     { degree: 3, offset: 0 },
//     { degree: 5, offset: 0 },
//     { degree: 0, offset: 12 },
//   ]);
// });

test("areScalesEqual", () => {
  const scale = mockScale;

  // Test an equal scale
  const equalScale = ScaleFunctions.getTransposedScale(scale, 12);
  expect(ScaleFunctions.areScalesEqual(scale, equalScale)).toBeTruthy();

  // Test an unequal scale
  const unequalScale = ScaleFunctions.getTransposedScale(scale, 2);
  expect(ScaleFunctions.areScalesEqual(scale, unequalScale)).toBeFalsy();
});

test("areScalesRelated", () => {
  const scale = mockScale;

  // Test a related scale
  const relatedScale = ScaleFunctions.getTransposedScale(scale, 1);
  expect(ScaleFunctions.areScalesRelated(scale, relatedScale)).toBeTruthy();

  // Test an unrelated scale
  const unrelatedScale = ScaleFunctions.getRotatedScale(scale, 1);
  expect(ScaleFunctions.areScalesRelated(scale, unrelatedScale)).toBeFalsy();
});

test("areScalesModes", () => {
  const scale = mockScale;

  // Test a mode
  const relatedScale = ScaleFunctions.getRotatedScale(scale, 1);
  expect(ScaleFunctions.areScalesModes(scale, relatedScale)).toBeTruthy();

  // Test an unrelated scale
  const unrelatedScale = ScaleFunctions.getScaleNotes(scale).slice(1);
  expect(ScaleFunctions.areScalesModes(scale, unrelatedScale)).toBeFalsy();
});
