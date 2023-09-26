import { test, expect } from "vitest";
import { Clip, defaultClip, getClipStream } from "./clip";
import { Pattern, defaultPattern } from "./pattern";
import { Transposition } from "./transposition";

import { createSessionMap } from "./session";
import { MIDI } from "types";
import { PatternTrack, defaultPatternTrack } from "./patternTrack";
import { ScaleTrack, defaultScaleTrack } from "./scaleTrack";

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

  const parentScaleTrack: ScaleTrack = {
    ...defaultScaleTrack,
    id: "parent-scale-track",
    scaleNotes: [
      { degree: 0, offset: 0 },
      { degree: 2, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 5, offset: 0 },
      { degree: 7, offset: 0 },
      { degree: 9, offset: 0 },
      { degree: 11, offset: 0 },
    ],
  };
  const childScaleTrack: ScaleTrack = {
    ...defaultScaleTrack,
    id: "child-scale-track",
    parentId: parentScaleTrack.id,
    scaleNotes: [
      { degree: 0, offset: 0 },
      { degree: 2, offset: 0 },
      { degree: 4, offset: 0 },
      { degree: 6, offset: 0 },
    ],
  };
  const babyScaleTrack: ScaleTrack = {
    ...defaultScaleTrack,
    id: "baby-scale-track",
    parentId: childScaleTrack.id,
    scaleNotes: [
      { degree: 0, offset: 0 },
      { degree: 1, offset: 0 },
      { degree: 2, offset: 0 },
    ],
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

  const sessionMap = createSessionMap({
    tracks: [parentScaleTrack, childScaleTrack, babyScaleTrack, patternTrack],
    clips: [clip],
    transpositions: [
      parentScaleTransposition,
      childScaleTransposition,
      babyScaleTransposition,
      clipTransposition,
    ],
  });

  const patterns = { [pattern.id]: pattern };
  const scaleTracks = {
    [parentScaleTrack.id]: parentScaleTrack,
    [childScaleTrack.id]: childScaleTrack,
    [babyScaleTrack.id]: babyScaleTrack,
  };
  const patternTracks = { [patternTrack.id]: patternTrack };
  const transpositions = {
    [parentScaleTransposition.id]: parentScaleTransposition,
    [childScaleTransposition.id]: childScaleTransposition,
    [babyScaleTransposition.id]: babyScaleTransposition,
    [clipTransposition.id]: clipTransposition,
  };
  const dependencies = {
    patterns,
    scaleTracks,
    patternTracks,
    transpositions,
    sessionMap,
  };

  const stream = getClipStream(clip, dependencies);
  const streamNotes = stream.filter((n) => n?.[0]);
  expect(streamNotes[0][0].MIDI).toSatisfy((n) => n === 71 || n === 78);
  expect(streamNotes[1][0].MIDI).toSatisfy((n) => n === 78 || n === 81);
  expect(streamNotes[2][0].MIDI).toSatisfy((n) => n === 81);
});
