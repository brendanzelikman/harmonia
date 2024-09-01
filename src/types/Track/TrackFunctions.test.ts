import { test, expect } from "vitest";
import * as _ from "./TrackFunctions";
import { initializePatternTrack } from "./PatternTrack/PatternTrackTypes";
import { initializeScaleTrack } from "./ScaleTrack/ScaleTrackTypes";
import { keyBy } from "lodash";

test("getScaleTrackChainIds should return the correct chain of tracks", () => {
  const t1 = initializeScaleTrack();
  const t2 = initializeScaleTrack({ parentId: t1.id });
  const t3 = initializePatternTrack({ parentId: t2.id });
  const trackMap = keyBy([t1, t2, t3], "id");

  const t1TrackChain = _.getScaleTrackChainIds(t1.id, trackMap);
  const t2TrackChain = _.getScaleTrackChainIds(t2.id, trackMap);
  const t3TrackChain = _.getScaleTrackChainIds(t3.id, trackMap);

  expect(t1TrackChain).toEqual([t1.id]);
  expect(t2TrackChain).toEqual([t1.id, t2.id]);
  expect(t3TrackChain).toEqual([t1.id, t2.id]);
});

test("getTrackParentIds should return the correct list of IDs", () => {
  const t1 = initializeScaleTrack();
  const t2 = initializeScaleTrack({ parentId: t1.id });
  const t3 = initializePatternTrack({ parentId: t2.id });
  const trackMap = keyBy([t1, t2, t3], "id");

  const t1ParentIds = _.getTrackAncestorIds(t1.id, trackMap);
  const t2ParentIds = _.getTrackAncestorIds(t2.id, trackMap);
  const t3ParentIds = _.getTrackAncestorIds(t3.id, trackMap);

  expect(t1ParentIds).toEqual([]);
  expect(t2ParentIds).toEqual([t1.id]);
  expect(t3ParentIds).toEqual([t1.id, t2.id]);
});
