import { test, expect } from "vitest";
import { getTrackScaleChain } from "./ArrangementFunctions";
import { initializePoseClip, PoseClip } from "types/Clip/ClipTypes";
import { initializePose } from "types/Pose/PoseTypes";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import { initializeScale } from "types/Scale/ScaleTypes";
import { initializeScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { getScaleName } from "utils/scale";
import { keyBy } from "lodash";
import { ChainIdsByTrack } from "./ArrangementTypes";

// ------------------------------------------------------------
// Test Definitions
// ------------------------------------------------------------

// Create the scales
const scale1 = initializeScale({
  name: "",
  notes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((n) => ({
    degree: n,
  })),
});
const scale2 = initializeScale({
  name: "",
  notes: [0, 2, 4, 5, 7, 9, 11].map((n) => ({
    degree: n,
  })),
});
const scale3 = initializeScale({
  name: "",
  notes: [0, 1, 2, 3, 4, 5, 6].map((n) => ({
    degree: n,
  })),
});
const scale4 = initializeScale({
  name: "",
  notes: [0, 2, 4, 6].map((n) => ({
    degree: n,
  })),
});

// Create the scale tracks
const st1 = initializeScaleTrack({ scaleId: scale1.id });
const st2 = initializeScaleTrack({ scaleId: scale2.id });
const st3 = initializeScaleTrack({ scaleId: scale3.id });
const st4 = initializeScaleTrack({ scaleId: scale4.id });

// Update the track dependencies
st1.trackIds = [st2.id];
st2.trackIds = [st3.id];
st3.trackIds = [st4.id];
st2.parentId = st1.id;
st3.parentId = st2.id;
st4.parentId = st3.id;

// Create the pose stream
const v1 = { chromatic: 1 };
const v2 = { chromatic: -1 };
const v3 = { chordal: 1 };
const v4 = { chordal: -1 };
const v5 = { [st1.id]: 1 };
const v6 = { [st2.id]: 1 };
const v7 = { [st3.id]: 1 };
const v8 = { [st4.id]: 1 };
const stream = [v1, v2, v3, v4, v5, v6, v7, v8].map((v) => ({
  duration: 1,
  vector: v,
}));

// Create the poses
const p1 = initializePose({ stream });
const p2 = initializePose({ stream });
const p3 = initializePose({ stream });
const p4 = initializePose({ stream });

// Create the pose clips
const pc1 = initializePoseClip({ poseId: p1.id, trackId: st1.id });
const pc2 = initializePoseClip({ poseId: p2.id, trackId: st2.id });
const pc3 = initializePoseClip({ poseId: p3.id, trackId: st3.id });
const pc4 = initializePoseClip({ poseId: p4.id, trackId: st4.id });

// Create the dependencies
const scales = keyBy([scale1, scale2, scale3, scale4], "id");
const poses = keyBy([p1, p2, p3, p4], "id");

// Get the chain using the given pose clip and tick
const getChainAtTick = (clip: PoseClip, tick: number) => {
  return getTrackScaleChain(st4.id, {
    tracks: { [st1.id]: st1, [st2.id]: st2, [st3.id]: st3, [st4.id]: st4 },
    scales: {
      ids: [scale1.id, scale2.id, scale3.id, scale4.id],
      entities: scales,
    },
    poses: { ids: [p1.id, p2.id, p3.id, p4.id], entities: poses },
    patterns: { ids: [], entities: {} },
    poseClips: { [clip.id]: clip },
    patternClips: {},
    tick,
    trackPoseClips: { [clip.trackId]: [clip] },
    chainIdsByTrack: {
      [st1.id]: [st1.id],
      [st2.id]: [st1.id, st2.id],
      [st3.id]: [st1.id, st2.id, st3.id],
      [st4.id]: [st1.id, st2.id, st3.id, st4.id],
    } as ChainIdsByTrack,
  });
};

// Get the list of scale names
const getScaleNames = (clip: PoseClip, tick: number) => {
  const scales = getChainAtTick(clip, tick);
  const midiScales = scales.map((_, i) =>
    resolveScaleChainToMidi(scales.slice(0, i + 1))
  );
  return midiScales.map(getScaleName);
};

// ------------------------------------------------------------
// Test Cases
// ------------------------------------------------------------

test("getTrackScaleChain should return the correct scales with a pose applied to track 1", () => {
  expect(getScaleNames(pc1, 0)).toEqual([
    "Db Chromatic Scale",
    "Db Major Scale",
    "Db Major Scale",
    "Db Major 7th Chord",
  ]);
  expect(getScaleNames(pc1, 1)).toEqual([
    "B Chromatic Scale",
    "B Major Scale",
    "B Major Scale",
    "B Major 7th Chord",
  ]);
  expect(getScaleNames(pc1, 2)).toEqual([
    "Db Chromatic Scale",
    "Db Major Scale",
    "Db Major Scale",
    "Db Major 7th Chord",
  ]);
  expect(getScaleNames(pc1, 3)).toEqual([
    "B Chromatic Scale",
    "B Major Scale",
    "B Major Scale",
    "B Major 7th Chord",
  ]);
  expect(getScaleNames(pc1, 4)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "C Major 7th Chord",
  ]);
  expect(getScaleNames(pc1, 5)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "C Major 7th Chord",
  ]);
  expect(getScaleNames(pc1, 6)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "C Major 7th Chord",
  ]);
  expect(getScaleNames(pc1, 7)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "C Major 7th Chord",
  ]);
});

test("getTrackScaleChain should return the correct scales with a pose applied to track 1a", () => {
  expect(getScaleNames(pc2, 0)).toEqual([
    "Chromatic Scale",
    "Db Major Scale",
    "Db Major Scale",
    "Db Major 7th Chord",
  ]);
  expect(getScaleNames(pc2, 1)).toEqual([
    "Chromatic Scale",
    "B Major Scale",
    "B Major Scale",
    "B Major 7th Chord",
  ]);
  expect(getScaleNames(pc2, 2)).toEqual([
    "Chromatic Scale",
    "D Dorian",
    "D Dorian",
    "D Minor 7th Chord",
  ]);
  expect(getScaleNames(pc2, 3)).toEqual([
    "Chromatic Scale",
    "B Locrian",
    "B Locrian",
    "B Half Diminished Chord",
  ]);
  expect(getScaleNames(pc2, 4)).toEqual([
    "Chromatic Scale",
    "Db Major Scale",
    "Db Major Scale",
    "Db Major 7th Chord",
  ]);
  expect(getScaleNames(pc2, 5)).toEqual([
    "Chromatic Scale",
    "D Dorian",
    "C Major Scale",
    "C Major 7th Chord",
  ]);
  expect(getScaleNames(pc2, 6)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "C Major 7th Chord",
  ]);
  expect(getScaleNames(pc2, 7)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "C Major 7th Chord",
  ]);
});

test("getTrackScaleChain should return the correct scales with a pose applied to track 1aa", () => {
  expect(getScaleNames(pc3, 0)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "Db Major Scale",
    "Db Major 7th Chord",
  ]);
  expect(getScaleNames(pc3, 1)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "B Major Scale",
    "B Major 7th Chord",
  ]);
  expect(getScaleNames(pc3, 2)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "D Dorian",
    "D Minor 7th Chord",
  ]);
  expect(getScaleNames(pc3, 3)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "B Locrian",
    "B Half Diminished Chord",
  ]);
  expect(getScaleNames(pc3, 4)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "Db Major Scale",
    "Db Major 7th Chord",
  ]);
  expect(getScaleNames(pc3, 5)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "D Dorian",
    "D Minor 7th Chord",
  ]);
  expect(getScaleNames(pc3, 6)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "D Dorian",
    "C Major 7th Chord",
  ]);
  expect(getScaleNames(pc3, 7)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "C Major 7th Chord",
  ]);
});

test("getTrackScaleChain should return the correct scales with a pose applied to track 1aaa", () => {
  expect(getScaleNames(pc4, 0)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "Db Major 7th Chord",
  ]);
  expect(getScaleNames(pc4, 1)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "B Major 7th Chord",
  ]);
  expect(getScaleNames(pc4, 2)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "C Major 7th Chord (r1)",
  ]);
  expect(getScaleNames(pc4, 3)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "C Major 7th Chord (r3)",
  ]);
  expect(getScaleNames(pc4, 4)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "Db Major 7th Chord",
  ]);
  expect(getScaleNames(pc4, 5)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "D Minor 7th Chord",
  ]);
  expect(getScaleNames(pc4, 6)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "D Minor 7th Chord",
  ]);
  expect(getScaleNames(pc4, 7)).toEqual([
    "Chromatic Scale",
    "C Major Scale",
    "C Major Scale",
    "C Major 7th Chord (r1)",
  ]);
});
