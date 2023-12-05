import { expect, test } from "vitest";
import {
  defaultPatternClip,
  initializePatternClip,
  initializePoseClip,
} from "./ClipTypes";
import * as _ from "./ClipFunctions";
import * as ArrangementFunctions from "types/Arrangement/ArrangementFunctions";
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
import { initializeScaleTrack, initializePatternTrack } from "types/Track";

const degrees = [0, 2, 4, 6].map((degree) => ({
  degree,
  offset: { octave: 1, chromatic: -2 },
}));
const originalStream = [12, ...degrees].map((d) =>
  createPatternChordFromScaleNote(d)
);

test("getClipDuration should return the correct duration for a clip with it specified", () => {
  const clip = initializePatternClip({ duration: 5 });
  const ticks = _.getClipDuration(clip, defaultPattern.stream);
  expect(ticks).toEqual(clip.duration);
});

test("getClipDuration should return the correct duration for a clip without it specified", () => {
  const ticks = _.getClipDuration(defaultPatternClip, defaultPattern.stream);
  expect(ticks).toBe(getPatternStreamDuration(defaultPattern.stream));
});

test("getClipStream should work with just a pattern of MIDI notes", () => {
  const originalStream = createPatternStreamFromMidiValues([60, 61, 62, 63]);
  const pattern = initializePattern({ stream: originalStream });
  const clip = initializePatternClip({ patternId: pattern.id });

  const clipStream = ArrangementFunctions.getPatternClipStream(clip, {
    pattern,
  });
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
  const clip = initializePatternClip({ patternId: pattern.id });
  const clipStream = ArrangementFunctions.getPatternClipStream(clip, {
    pattern,
  });
  const midiStream = resolvePatternStreamToMidi(clipStream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([70, 72, 74, 76]);
});

test("getClipStream should work with just a pattern of mixed notes", () => {
  const notes = [60, { degree: 0, offset: { chromatic: -2, octave: 1 } }];
  const originalStream = notes.map((n) => createPatternChordFromScaleNote(n));
  const pattern = initializePattern({ stream: originalStream });
  const clip = initializePatternClip({ patternId: pattern.id });

  const clipStream = ArrangementFunctions.getPatternClipStream(clip, {
    pattern,
  });
  const midiStream = resolvePatternStreamToMidi(clipStream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([60, 70]);
});

test("getClipStream should work with a pattern of mixed notes and a MIDI scale", () => {
  const pattern = initializePattern({ stream: originalStream });
  const clip = initializePatternClip({ patternId: pattern.id });

  const scale = initializeScale({ notes: [60, 62, 64, 65, 67, 69, 71] });
  const scales = createMap([scale]);

  const clipStream = ArrangementFunctions.getPatternClipStream(clip, {
    pattern,
    scales,
  });
  const midiStream = resolvePatternStreamToMidi(clipStream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([12, 70, 72, 74, 76]);
});

test("getClipStream should work with a pattern of mixed notes and a nested scale", () => {
  const pattern = initializePattern({ stream: originalStream });
  const clip = initializePatternClip({ patternId: pattern.id });

  const scale = mockScale;
  const scales = createMap([scale]);

  const clipStream = ArrangementFunctions.getPatternClipStream(clip, {
    pattern,
    scales,
  });
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
  const clip = initializePatternClip({ patternId: pattern.id });

  const pose = initializePose({
    stream: [{ vector: { chromatic: 1 }, duration: Infinity }],
  });
  const poses = createMap([pose]);

  const clipStream = ArrangementFunctions.getPatternClipStream(clip, {
    pattern,
    poses: poses,
  });
  const midiStream = resolvePatternStreamToMidi(clipStream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([12, 70, 72, 74, 76]);
});

test("getClipStream should not transpose a pattern of notes without any clips", () => {
  const degrees = [0, 2, 4, 6].map((degree) => ({
    degree,
    offset: { octave: 1, chromatic: -2 },
  }));
  const originalStream = [12, ...degrees].map((d) =>
    createPatternChordFromScaleNote(d)
  );
  let patternTrack = initializePatternTrack({});

  // Create the pattern clip
  const pattern = initializePattern({ stream: originalStream });
  const patternClip = initializePatternClip({
    patternId: pattern.id,
    trackId: patternTrack.id,
  });

  // Create the pose clip
  const pose = initializePose({
    stream: [{ vector: { chromatic: 1 }, duration: Infinity }],
  });
  const poseClip = initializePoseClip({
    poseId: pose.id,
    trackId: patternTrack.id,
  });

  // Create the track and pose maps
  const tracks = createMap([patternTrack]);
  const poses = createMap([pose]);

  const stream = ArrangementFunctions.getPatternClipStream(patternClip, {
    pattern,
    poses,
    tracks,
  });
  const midiStream = resolvePatternStreamToMidi(stream, []);
  const values = getMidiStreamValues(midiStream);

  expect(values).toEqual([12, 70, 72, 74, 76]);
});

test("getClipStream should correctly transpose and rotate a pattern when tracks and clips are provided", () => {
  const pattern = initializePattern({ stream: originalStream });
  const pose = initializePose({
    stream: [{ vector: { chromatic: 1, chordal: 1 }, duration: Infinity }],
  });
  let patternTrack = initializePatternTrack({});

  // Create the pattern clip
  const patternClip = initializePatternClip({
    trackId: patternTrack.id,
    patternId: pattern.id,
  });

  // Create the pose clip
  const poseClip = initializePoseClip({
    trackId: patternTrack.id,
    poseId: pose.id,
  });

  // Create the track map
  const tracks = createMap([patternTrack]);
  const clips = createMap([patternClip, poseClip]);
  const poses = createMap([pose]);

  // Get the stream
  const clipStream = ArrangementFunctions.getPatternClipStream(patternClip, {
    pattern,
    poses,
    tracks,
    clips,
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

  // Create the first track
  const t1 = initializeScaleTrack({ scaleId: majorScale.id });

  // Create the second track
  const t2 = initializeScaleTrack({ parentId: t1.id, scaleId: major7Scale.id });

  // Create the third track
  const t3 = initializePatternTrack({ parentId: t2.id });

  // Create the first pose and clip
  const t1Pose = initializePose({
    stream: [{ vector: { chromatic: 2 } }],
  });
  const t1PoseClip = initializePoseClip({ poseId: t1Pose.id, trackId: t1.id });

  // Create the second pose and clip
  const t2Pose = initializePose({
    stream: [{ vector: { [t1.id]: 1 } }],
  });
  const t2PoseClip = initializePoseClip({ poseId: t2Pose.id, trackId: t2.id });

  // Create the third pose and clip
  const t3Pose = initializePose({
    stream: [{ vector: { [t1.id]: 1, [t2.id]: 1 } }],
  });
  const t3PoseClip = initializePoseClip({ poseId: t3Pose.id, trackId: t3.id });

  // Create the pattern
  const nestedNotes = [
    { degree: 0, offset: { chromatic: -1 }, scaleId: majorScale.id },
    { degree: 0, offset: { [majorScale.id]: 1 }, scaleId: majorScale.id },
    { degree: 0, offset: { chromatic: -1 }, scaleId: major7Scale.id },
    { degree: 0, offset: { [majorScale.id]: 1 }, scaleId: major7Scale.id },
    { degree: 0, offset: { [major7Scale.id]: 1 }, scaleId: major7Scale.id },
  ];
  const stream = nestedNotes.map((n) => createPatternChordFromScaleNote(n));
  const pattern = initializePattern({ stream });

  // Create the pattern clip
  const patternClip = initializePatternClip({
    patternId: pattern.id,
    trackId: t3.id,
  });

  // Create the maps
  const scales = createMap([majorScale, major7Scale]);
  const tracks = createMap([t1, t2, t3]);
  const clips = createMap([patternClip, t1PoseClip, t2PoseClip, t3PoseClip]);
  const poses = createMap([t1Pose, t2Pose, t3Pose]);

  // Get the stream
  const clipStream = ArrangementFunctions.getPatternClipStream(patternClip, {
    pattern,
    tracks,
    clips,
    poses,
    scales,
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
