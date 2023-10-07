import { test, expect } from "vitest";
import * as ScaleTrackFunctions from "./ScaleTrackFunctions";
import { initializeScaleTrack, mockScaleTrack } from "./ScaleTrackTypes";

test("getScaleTrackTag", () => {
  const tag = ScaleTrackFunctions.getScaleTrackTag(mockScaleTrack);
  expect(tag).toContain(mockScaleTrack.id);
  expect(tag).toContain(mockScaleTrack.name);
  expect(tag).toContain(mockScaleTrack.type);
});

test("mapScaleTrackNote", () => {
  const n1 = ScaleTrackFunctions.mapScaleTrackNote(60);
  expect(n1).toEqual({ degree: 0, offset: 0 });

  const n2 = ScaleTrackFunctions.mapScaleTrackNote(61);
  expect(n2).toEqual({ degree: 1, offset: 0 });

  const n3 = ScaleTrackFunctions.mapScaleTrackNote(59);
  expect(n3).toEqual({ degree: 11, offset: -12 });
});

test("getScaleTrackScale", () => {
  // Create a parent scale track with a C major scale
  const parentScaleTrack = initializeScaleTrack({
    ...mockScaleTrack,
    trackScale: [
      { degree: 0, offset: 0 },
      { degree: 2, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 5, offset: 0 },
      { degree: 7, offset: 0 },
      { degree: 9, offset: 0 },
      { degree: 11, offset: 0 },
    ],
  });
  // Create a child scale track with a C major 7 scale
  const childScaleTrack = initializeScaleTrack({
    ...mockScaleTrack,
    parentId: parentScaleTrack.id,
    trackScale: [
      { degree: 0, offset: 0 },
      { degree: 2, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 6, offset: 0 },
    ],
  });
  const scaleTrackMap = {
    [childScaleTrack.id]: childScaleTrack,
    [parentScaleTrack.id]: parentScaleTrack,
  };
  const scale = ScaleTrackFunctions.getScaleTrackScale(
    childScaleTrack,
    scaleTrackMap
  );
  expect(scale).toEqual([60, 64, 67, 71]);
});

test("getChromaticallyTransposedTrackScale", () => {
  // Create a scale track with a C major 7 scale
  const scaleTrack = initializeScaleTrack({
    ...mockScaleTrack,
    trackScale: [
      { degree: 0, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 7, offset: 0 },
      { degree: 11, offset: 0 },
    ],
  });
  // Transpose the scale track by a chromatic interval of 1
  const transposedScaleTrack =
    ScaleTrackFunctions.getChromaticallyTransposedTrackScale(
      scaleTrack.trackScale,
      1
    );
  // Expect the transposed scale track to be a C# major 7 scale
  expect(transposedScaleTrack).toEqual([
    { degree: 0, offset: 1 },
    { degree: 4, offset: 1 },
    { degree: 7, offset: 1 },
    { degree: 11, offset: 1 },
  ]);
});

test("getChordallyTransposedTrackScale", () => {
  // Create a scale track with a C major 7 scale
  const scaleTrack = initializeScaleTrack({
    ...mockScaleTrack,
    trackScale: [
      { degree: 0, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 7, offset: 0 },
      { degree: 11, offset: 0 },
    ],
  });
  // Transpose the scale track by a chordal interval of 1
  const transposedScaleTrack =
    ScaleTrackFunctions.getChordallyTransposedTrackScale(
      scaleTrack.trackScale,
      1
    );
  // Expect the transposed scale track to be a C major 7 scale in first inversion
  expect(transposedScaleTrack).toEqual([
    { degree: 4, offset: 0 },
    { degree: 7, offset: 0 },
    { degree: 11, offset: 0 },
    { degree: 0, offset: 12 },
  ]);
});

test("getScalarlyTransposedTrackScale", () => {
  // Create a parent scale track with a C major scale
  const parentScaleTrack = initializeScaleTrack({
    ...mockScaleTrack,
    trackScale: [
      { degree: 0, offset: 0 },
      { degree: 2, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 5, offset: 0 },
      { degree: 7, offset: 0 },
      { degree: 9, offset: 0 },
      { degree: 11, offset: 0 },
    ],
  });
  // Create a child scale track with a C major 7 scale
  const childScaleTrack = initializeScaleTrack({
    ...mockScaleTrack,
    parentId: parentScaleTrack.id,
    trackScale: [
      { degree: 0, offset: 0 },
      { degree: 2, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 6, offset: 0 },
    ],
  });
  // Transpose the child scale track by a scalar interval of 1
  const transposedScaleTrack =
    ScaleTrackFunctions.getScalarlyTransposedTrackScale(
      childScaleTrack.trackScale,
      1,
      parentScaleTrack.trackScale
    );
  // Expect the transposed scale track to be a D minor 7 chord
  expect(transposedScaleTrack).toEqual([
    { degree: 1, offset: 0 },
    { degree: 3, offset: 0 },
    { degree: 5, offset: 0 },
    { degree: 0, offset: 12 },
  ]);
});
