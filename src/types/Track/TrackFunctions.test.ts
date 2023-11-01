import { test, expect } from "vitest";
import * as _ from "./TrackFunctions";
import { initializePatternTrack } from "types/PatternTrack/PatternTrackTypes";
import { initializeScaleTrack } from "types/ScaleTrack/ScaleTrackTypes";
import { createMap } from "utils/objects";

test("getScaleTrackIdChain should return the correct chain of IDs", () => {
  const t1 = initializeScaleTrack();
  const t2 = initializeScaleTrack({ parentId: t1.id });
  const t3 = initializePatternTrack({ parentId: t2.id });
  const trackMap = createMap([t1, t2, t3]);

  const t1IdChain = _.getScaleTrackIdChain(t1.id, trackMap);
  const t2IdChain = _.getScaleTrackIdChain(t2.id, trackMap);
  const t3IdChain = _.getScaleTrackIdChain(t3.id, trackMap);

  expect(t1IdChain).toEqual([t1.id]);
  expect(t2IdChain).toEqual([t1.id, t2.id]);
  expect(t3IdChain).toEqual([t1.id, t2.id]);
});

test("getScaleTrackChain should return the correct chain of tracks", () => {
  const t1 = initializeScaleTrack();
  const t2 = initializeScaleTrack({ parentId: t1.id });
  const t3 = initializePatternTrack({ parentId: t2.id });
  const trackMap = createMap([t1, t2, t3]);

  const t1TrackChain = _.getScaleTrackChain(t1.id, trackMap);
  const t2TrackChain = _.getScaleTrackChain(t2.id, trackMap);
  const t3TrackChain = _.getScaleTrackChain(t3.id, trackMap);

  expect(t1TrackChain).toEqual([t1]);
  expect(t2TrackChain).toEqual([t1, t2]);
  expect(t3TrackChain).toEqual([t1, t2]);
});

test("getTrackParentIds should return the correct list of IDs", () => {
  const t1 = initializeScaleTrack();
  const t2 = initializeScaleTrack({ parentId: t1.id });
  const t3 = initializePatternTrack({ parentId: t2.id });
  const trackMap = createMap([t1, t2, t3]);

  const t1ParentIds = _.getTrackParentIds(t1.id, trackMap);
  const t2ParentIds = _.getTrackParentIds(t2.id, trackMap);
  const t3ParentIds = _.getTrackParentIds(t3.id, trackMap);

  expect(t1ParentIds).toEqual([]);
  expect(t2ParentIds).toEqual([t1.id]);
  expect(t3ParentIds).toEqual([t1.id, t2.id]);
});

test("getTrackParents should return the correct list of parents", () => {
  const t1 = initializeScaleTrack();
  const t2 = initializeScaleTrack({ parentId: t1.id });
  const t3 = initializePatternTrack({ parentId: t2.id });
  const trackMap = createMap([t1, t2, t3]);

  const t1Parents = _.getTrackParents(t1.id, trackMap);
  const t2Parents = _.getTrackParents(t2.id, trackMap);
  const t3Parents = _.getTrackParents(t3.id, trackMap);

  expect(t1Parents).toEqual([]);
  expect(t2Parents).toEqual([t1]);
  expect(t3Parents).toEqual([t1, t2]);
});
