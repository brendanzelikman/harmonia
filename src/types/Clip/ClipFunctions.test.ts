import { expect, test } from "vitest";
import { Clip, defaultClip, mockClip } from "./ClipTypes";
import * as ClipFunctions from "./ClipFunctions";
import {
  Pattern,
  PatternMap,
  defaultPattern,
  getPatternStreamTicks,
  initializePattern,
  mockPattern,
} from "types/Pattern";
import { MIDI } from "types/midi";
import { PatternTrack, defaultPatternTrack } from "types/PatternTrack";
import { ScaleTrack, ScaleTrackMap, defaultScaleTrack } from "types/ScaleTrack";
import { createSession } from "types/Session";
import { Transposition, TranspositionMap } from "types/Transposition";
import {
  NestedScale,
  NestedScaleMap,
  initializeNestedScale,
} from "types/Scale";
import { createMap } from "types/util";

test("getClipTag", () => {
  const tag = ClipFunctions.getClipTag(mockClip);
  expect(tag).toContain(mockClip.id);
  expect(tag).toContain(mockClip.patternId);
  expect(tag).toContain(mockClip.trackId);
  expect(tag).toContain(mockClip.tick);
  expect(tag).toContain(mockClip.offset);
});

test("getClipTicks", () => {
  const presetTicks = ClipFunctions.getClipDuration(mockClip, mockPattern);
  expect(presetTicks).toEqual(mockClip.duration);

  const clipWithoutTicks = { ...mockClip, duration: undefined };
  const mockTicks = ClipFunctions.getClipDuration(
    clipWithoutTicks,
    mockPattern
  );
  const expectedDuration =
    getPatternStreamTicks(mockPattern.stream) - mockClip.offset;

  expect(mockTicks).toEqual(expectedDuration);
});

test("getClipNotes", () => {
  const pattern = initializePattern({
    stream: [
      [{ MIDI: 60, duration: 1, velocity: 127 }],
      [{ MIDI: 61, duration: 1, velocity: 127 }],
      [{ MIDI: 62, duration: 1, velocity: 127 }],
      [{ MIDI: 63, duration: 1, velocity: 127 }],
    ],
  });
  const clip = { ...mockClip, patternId: pattern.id, offset: 1, duration: 2 };
  const notes = ClipFunctions.getClipNotes(clip, pattern.stream);
  expect(notes).toEqual([
    [{ MIDI: 61, duration: 1, velocity: 127 }],
    [{ MIDI: 62, duration: 1, velocity: 127 }],
  ]);
});

test("getClipStream", () => {
  const pattern: Pattern = {
    ...defaultPattern,
    id: "pattern",
    stream: [
      [MIDI.createQuarterNote(60)],
      [MIDI.createQuarterNote(64)],
      [MIDI.createQuarterNote(67)],
    ],
  };

  // Create the parent in a C major scale
  const parentScale: NestedScale = initializeNestedScale({
    notes: [
      { degree: 0, offset: 0 },
      { degree: 2, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 5, offset: 0 },
      { degree: 7, offset: 0 },
      { degree: 9, offset: 0 },
      { degree: 11, offset: 0 },
    ],
  });

  const parentScaleTrack: ScaleTrack = {
    ...defaultScaleTrack,
    id: "parent-scale-track",
    scaleId: parentScale.id,
  };

  // Create the child in a four step scale
  const childScale = initializeNestedScale({
    notes: [
      { degree: 0, offset: 0 },
      { degree: 2, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 6, offset: 0 },
    ],
  });
  const childScaleTrack: ScaleTrack = {
    ...defaultScaleTrack,
    id: "child-scale-track",
    parentId: parentScaleTrack.id,
    scaleId: childScale.id,
  };

  // Create the baby in a three step scale
  const babyScale = initializeNestedScale({
    notes: [
      { degree: 0, offset: 0 },
      { degree: 1, offset: 0 },
      { degree: 2, offset: 0 },
    ],
  });
  const babyScaleTrack: ScaleTrack = {
    ...defaultScaleTrack,
    id: "baby-scale-track",
    parentId: childScaleTrack.id,
    scaleId: babyScale.id,
  };
  const patternTrack: PatternTrack = {
    ...defaultPatternTrack,
    parentId: babyScaleTrack.id,
  };
  const clip: Clip = {
    ...defaultClip,
    id: "clip",
    patternId: pattern.id,
    trackId: patternTrack.id,
    tick: 1,
  };
  const parentScaleTransposition: Transposition = {
    id: "parent-scale-transposition",
    trackId: parentScaleTrack.id,
    offsets: { _chromatic: 1, _self: 1 },
    tick: 0,
  };
  const childScaleTransposition: Transposition = {
    id: "child-scale-transposition",
    trackId: childScaleTrack.id,
    offsets: { [parentScaleTrack.id]: 1, _chromatic: 2, _self: 1 },
    tick: 0,
  };
  const babyScaleTransposition: Transposition = {
    id: "baby-scale-transposition",
    trackId: babyScaleTrack.id,
    offsets: {
      [parentScaleTrack.id]: 1,
      [childScaleTrack.id]: 1,
      _chromatic: 3,
      _self: 1,
    },
    tick: 0,
  };
  const clipTransposition: Transposition = {
    id: "clip-transposition",
    trackId: patternTrack.id,
    offsets: {
      [parentScaleTrack.id]: 1,
      [childScaleTrack.id]: 1,
      [babyScaleTrack.id]: 1,
      _chromatic: 1,
      _self: 1,
    },
    tick: 0,
  };

  const session = createSession({
    tracks: [parentScaleTrack, childScaleTrack, babyScaleTrack, patternTrack],
    clips: [clip],
    transpositions: [
      parentScaleTransposition,
      childScaleTransposition,
      babyScaleTransposition,
      clipTransposition,
    ],
  });
  const sessionMap = session.byId;

  const patternMap = createMap<PatternMap>([pattern]);
  const patternTrackMap = { [patternTrack.id]: patternTrack };

  const scaleMap = createMap<NestedScaleMap>([
    parentScale,
    childScale,
    babyScale,
  ]);
  const scaleTrackMap = createMap<ScaleTrackMap>([
    parentScaleTrack,
    childScaleTrack,
    babyScaleTrack,
  ]);
  const transpositionMap = createMap<TranspositionMap>([
    parentScaleTransposition,
    childScaleTransposition,
    babyScaleTransposition,
    clipTransposition,
  ]);
  const stream = ClipFunctions.getClipStream(
    clip,
    patternMap,
    patternTrackMap,
    scaleMap,
    scaleTrackMap,
    transpositionMap,
    sessionMap
  );
  const streamNotes = stream.filter((n) => n?.[0]);
  expect(streamNotes[0][0].MIDI).toSatisfy((n) => n === 71 || n === 78);
  expect(streamNotes[1][0].MIDI).toSatisfy((n) => n === 78 || n === 81);
  expect(streamNotes[2][0].MIDI).toSatisfy((n) => n === 81);
});
