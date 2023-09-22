import { test, expect } from "vitest";
import { Clip, defaultClip, getClipStream } from "./clip";
import { Pattern, defaultPattern } from "./pattern";
import { MIDI } from "./midi";
import { Transposition, defaultTransposition } from "./transposition";
import {
  PatternTrack,
  ScaleTrack,
  defaultPatternTrack,
  defaultScaleTrack,
} from "./tracks";

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
  const scaleTrack: ScaleTrack = {
    ...defaultScaleTrack,
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
  const patternTrack: PatternTrack = {
    ...defaultPatternTrack,
    parentId: scaleTrack.id,
  };
  const clip: Clip = {
    ...defaultClip,
    id: "clip",
    patternId: pattern.id,
    trackId: patternTrack.id,
    tick: 0,
  };
  const transposition: Transposition = {
    ...defaultTransposition,
    id: "transposition",
    trackId: patternTrack.id,
    offsets: { _chromatic: 1, [scaleTrack.id]: 1, _self: 1 },
    tick: 0,
  };
  const stream = getClipStream(clip, {
    patterns: { [pattern.id]: pattern },
    patternTracks: { [patternTrack.id]: patternTrack },
    scaleTracks: { [scaleTrack.id]: scaleTrack },
    transpositions: { [transposition.id]: transposition },
    sessionMap: {
      byId: {
        [scaleTrack.id]: {
          id: scaleTrack.id,
          type: "scaleTrack",
          depth: 0,
          trackIds: [patternTrack.id],
          clipIds: [],
          transpositionIds: [],
        },
        [patternTrack.id]: {
          id: patternTrack.id,
          type: "patternTrack",
          depth: 1,
          trackIds: [],
          clipIds: [clip.id],
          transpositionIds: [transposition.id],
        },
      },
      allIds: [scaleTrack.id, patternTrack.id],
      topLevelIds: [scaleTrack.id],
    },
  });
  const quarter = MIDI.QuarterNoteTicks;
  expect(stream[0][0].MIDI).toEqual(66);
  expect(stream[1 * quarter][0].MIDI).toEqual(70);
  expect(stream[2 * quarter][0].MIDI).toEqual(75);
  expect(stream[0][0].duration).toEqual(quarter);
  expect(stream[1 * quarter][0].duration).toEqual(quarter);
  expect(stream[2 * quarter][0].duration).toEqual(quarter);
  expect(stream.length).toEqual(quarter * pattern.stream.length);
});
