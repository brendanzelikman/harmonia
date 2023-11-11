import { expect, test } from "vitest";
import { defaultClip, initializeClip, mockClip } from "./ClipTypes";
import * as _ from "./ClipFunctions";
import {
  createPatternChordFromScaleNote,
  createPatternStreamFromMidiValues,
  defaultPattern,
  getPatternStreamDuration,
  initializePattern,
  resolvePatternStreamToMidi,
  getMidiStreamValues,
} from "types/Pattern";
import { initializeScale, mockScale } from "types/Scale";
import { createMap } from "utils/objects";
import { initializePose } from "types/Pose";
import { initializePatternTrack } from "types/PatternTrack";
import { TrackHierarchy } from "types/TrackHierarchy";
import { initializeScaleTrack } from "types/ScaleTrack";

const degrees = [0, 2, 4, 6].map((degree) => ({
  degree,
  offset: { octave: 1, chromatic: -2 },
}));
const originalStream = [12, ...degrees].map((d) =>
  createPatternChordFromScaleNote(d)
);

test("getClipDuration should return the correct duration for a clip with it specified", () => {
  const ticks = _.getClipDuration(mockClip, defaultPattern);
  expect(ticks).toEqual(mockClip.duration);
});

test("getClipDuration should return the correct duration for a clip without it specified", () => {
  const ticks = _.getClipDuration(defaultClip, defaultPattern);
  expect(ticks).toBe(getPatternStreamDuration(defaultPattern.stream));
});

test("getClipStream should work with just a pattern of MIDI notes", () => {
  const originalStream = createPatternStreamFromMidiValues([60, 61, 62, 63]);
  const pattern = initializePattern({ stream: originalStream });
  const clip = initializeClip({ patternId: pattern.id });

  const clipStream = _.getClipStream(clip, { pattern });
  const midiStream = resolvePatternStreamToMidi(clipStream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([60, 61, 62, 63]);
});

test("getClipStream should work with just a pattern of nested notes", () => {
  const degrees = [0, 2, 4, 6].map((degree) => ({
    degree,
    offset: { octave: 1, chromatic: -2 },
  }));
  const originalStream = degrees.map((d) => createPatternChordFromScaleNote(d));
  const pattern = initializePattern({ stream: originalStream });
  const clip = initializeClip({ patternId: pattern.id });
  const clipStream = _.getClipStream(clip, { pattern });
  const midiStream = resolvePatternStreamToMidi(clipStream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([70, 72, 74, 76]);
});

test("getClipStream should work with just a pattern of mixed notes", () => {
  const notes = [60, { degree: 0, offset: { chromatic: -2, octave: 1 } }];
  const originalStream = notes.map((n) => createPatternChordFromScaleNote(n));
  const pattern = initializePattern({ stream: originalStream });
  const clip = initializeClip({ patternId: pattern.id });

  const clipStream = _.getClipStream(clip, { pattern });
  const midiStream = resolvePatternStreamToMidi(clipStream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([60, 70]);
});

test("getClipStream should work with a pattern of mixed notes and a MIDI scale", () => {
  const pattern = initializePattern({ stream: originalStream });
  const clip = initializeClip({ patternId: pattern.id });

  const scale = initializeScale({ notes: [60, 62, 64, 65, 67, 69, 71] });
  const scales = createMap([scale]);

  const clipStream = _.getClipStream(clip, { pattern, scales });
  const midiStream = resolvePatternStreamToMidi(clipStream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([12, 70, 72, 74, 76]);
});

test("getClipStream should work with a pattern of mixed notes and a nested scale", () => {
  const pattern = initializePattern({ stream: originalStream });
  const clip = initializeClip({ patternId: pattern.id });

  const scale = mockScale;
  const scales = createMap([scale]);

  const clipStream = _.getClipStream(clip, { pattern, scales });
  const midiStream = resolvePatternStreamToMidi(clipStream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([12, 70, 72, 74, 76]);
});

test("getClipStream should not transpose a pattern of notes wihout any tracks", () => {
  const degrees = [0, 2, 4, 6].map((degree) => ({
    degree,
    offset: { octave: 1, chromatic: -2 },
  }));
  const originalStream = [12, ...degrees].map((d) =>
    createPatternChordFromScaleNote(d)
  );
  const pattern = initializePattern({ stream: originalStream });
  const clip = initializeClip({ patternId: pattern.id });

  const pose = initializePose({ vector: { chromatic: 1 } });
  const poses = createMap([pose]);

  const clipStream = _.getClipStream(clip, { pattern, poses: poses });
  const midiStream = resolvePatternStreamToMidi(clipStream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([12, 70, 72, 74, 76]);
});

test("getClipStream should not transpose a pattern of notes without the hierarchy", () => {
  const degrees = [0, 2, 4, 6].map((degree) => ({
    degree,
    offset: { octave: 1, chromatic: -2 },
  }));
  const originalStream = [12, ...degrees].map((d) =>
    createPatternChordFromScaleNote(d)
  );
  const pattern = initializePattern({ stream: originalStream });

  const patternTrack = initializePatternTrack({});
  const patternTracks = createMap([patternTrack]);

  const clip = initializeClip({
    trackId: patternTrack.id,
    patternId: pattern.id,
  });

  const pose = initializePose({
    trackId: patternTrack.id,
    vector: { chromatic: 1 },
  });
  const poses = createMap([pose]);

  const clipStream = _.getClipStream(clip, {
    pattern,
    poses: poses,
    patternTracks,
  });
  const midiStream = resolvePatternStreamToMidi(clipStream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([12, 70, 72, 74, 76]);
});

test("getClipStream should correctly transpose and rotate a pattern when a track and hierarchy is provided", () => {
  const patternTrack = initializePatternTrack({});
  const patternTracks = createMap([patternTrack]);

  const pattern = initializePattern({ stream: originalStream });
  const clip = initializeClip({
    trackId: patternTrack.id,
    patternId: pattern.id,
  });

  const pose = initializePose({
    trackId: patternTrack.id,
    vector: { chromatic: 1, chordal: 1 },
  });
  const poses = createMap([pose]);

  const hierarchy: TrackHierarchy = {
    byId: {
      [patternTrack.id]: {
        id: patternTrack.id,
        type: "patternTrack",
        depth: 0,
        trackIds: [],
        clipIds: [],
        poseIds: [pose.id],
      },
    },
    allIds: [patternTrack.id],
    topLevelIds: [patternTrack.id],
  };

  const clipStream = _.getClipStream(clip, {
    pattern,
    poses: poses,
    patternTracks,
    tracks: hierarchy.byId,
  });
  const midiStream = resolvePatternStreamToMidi(clipStream);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([15, 73, 75, 77, 83]);
  expect(true).toBe(true);
});

test("getClipStream should work with fully loaded dependencies", () => {
  const majorNotes = [0, 2, 4, 5, 7, 9, 11].map((degree) => ({ degree }));
  const majorScale = initializeScale({ notes: majorNotes });

  const major7Notes = [0, 2, 4, 6].map((degree) => ({ degree }));
  const major7Scale = initializeScale({ notes: major7Notes });

  const t1 = initializeScaleTrack({ scaleId: majorScale.id });
  const t2 = initializeScaleTrack({ scaleId: major7Scale.id, parentId: t1.id });
  const t3 = initializePatternTrack({ parentId: t2.id });

  const t1Pose = initializePose({
    trackId: t1.id,
    vector: { chromatic: 2 },
  });
  const t2Pose = initializePose({
    trackId: t2.id,
    vector: { [t1.id]: 1 },
  });
  const t3Pose = initializePose({
    trackId: t3.id,
    vector: { [t1.id]: 1, [t2.id]: 1 },
  });

  const scales = createMap([majorScale, major7Scale]);
  const scaleTracks = createMap([t1, t2]);
  const patternTracks = createMap([t3]);
  const poses = createMap([t1Pose, t2Pose, t3Pose]);

  const nestedNotes = [
    { degree: 0, offset: { chromatic: -1 }, scaleId: majorScale.id },
    { degree: 0, offset: { [majorScale.id]: 1 }, scaleId: majorScale.id },
    { degree: 0, offset: { chromatic: -1 }, scaleId: major7Scale.id },
    { degree: 0, offset: { [majorScale.id]: 1 }, scaleId: major7Scale.id },
    { degree: 0, offset: { [major7Scale.id]: 1 }, scaleId: major7Scale.id },
  ];
  const stream = nestedNotes.map((n) => createPatternChordFromScaleNote(n));
  const pattern = initializePattern({ stream });

  const clip = initializeClip({
    trackId: t3.id,
    patternId: pattern.id,
  });

  const hierarchy: TrackHierarchy = {
    byId: {
      [t1.id]: {
        id: t1.id,
        type: "scaleTrack",
        depth: 1,
        trackIds: [t2.id],
        clipIds: [],
        poseIds: [t1Pose.id],
      },
      [t2.id]: {
        id: t2.id,
        type: "scaleTrack",
        depth: 2,
        trackIds: [t3.id],
        clipIds: [],
        poseIds: [t2Pose.id],
      },
      [t3.id]: {
        id: t3.id,
        type: "patternTrack",
        depth: 3,
        trackIds: [],
        clipIds: [clip.id],
        poseIds: [t3Pose.id],
      },
    },
    allIds: [t1.id, t2.id, t3.id],
    topLevelIds: [t1.id],
  };

  const clipStream = _.getClipStream(clip, {
    pattern,
    poses: poses,
    patternTracks,
    scaleTracks,
    scales,
    tracks: hierarchy.byId,
  });
  const midiStream = resolvePatternStreamToMidi(clipStream);
  const values = getMidiStreamValues(midiStream);

  // Note #1 should be major[0] + T1(1) + N(2-1) = 60 + 2 + 1 = 63
  const n1 = 63;

  // Note #2 should be major[0] + T1(2) + N(2) = 60 + 4 + 2 = 66
  const n2 = 66;

  // Note #3 should be major7[0] + T2(1) + T1(2) + N(2-1) = 60 + 4 + 3 + 1 = 68
  const n3 = 68;

  // Note #4 should be major7[0] + T2(1) + T1(3) + N(2) = 60 + 4 + 5 + 2 = 71
  const n4 = 71;

  // Note #5 should be major7[0] + T2(2) + T1(2) + N(2) = 60 + 7 + 4 + 2 = 73
  const n5 = 73;

  expect(values).toEqual([n1, n2, n3, n4, n5]);
  expect(true).toBe(true);
});
