import { test, expect } from "vitest";
import * as _ from "./PortalFunctions";
import { initializePatternClip } from "types/Clip";
import { initializePortal, initializePortalFromFragments } from "./PortalTypes";
import { getPatternClipsFromMedia } from "types/Media";

test("createPortalChunk should correctly append a tag to the media's ID", () => {
  const clip = initializePatternClip({ trackId: "track1" });
  const clipDuration = 10;
  const clipChunks = _.applyPortalsToClip(clip, [], clipDuration);
  expect(clipChunks.every((clip) => clip.id.includes("-chunk-"))).toBe(true);
});

test("parsePortalChunkId should correctly process a portaled media ID", () => {
  const mediaId = "patternClip-1-chunk-1";
  const originalMediaId = _.getOriginalIdFromPortaledClip(mediaId);
  expect(originalMediaId).toBe("patternClip-1");
});

test("applyPortalsToMedia should return a single chunk with no portals", () => {
  const clip = initializePatternClip({ trackId: "track1" });
  const clipDuration = 10;
  const clipChunks = _.applyPortalsToClip(clip, [], clipDuration);
  expect(clipChunks.length).toBe(1);
  expect(clipChunks[0]).toEqual({
    ...clip,
    id: `${clip.id}-chunk-1`,
    duration: 10,
  });
});

test("applyPortalsToMedia should return a single chunk with an irrelevant portal", () => {
  const clip = initializePatternClip({ trackId: "track1" });
  const clipDuration = 10;
  const portal = initializePortal({});
  const clipChunks = _.applyPortalsToClip(clip, [portal], clipDuration);
  expect(clipChunks.length).toBe(1);
  expect(clipChunks[0]).toEqual({
    ...clip,
    id: `${clip.id}-chunk-1`,
    duration: 10,
  });
});

test("applyPortalsToMedia should return a single chunk for a reversed portal ", () => {
  const clip = initializePatternClip({ trackId: "track1" });
  const clipDuration = 10;
  const portal = initializePortal({
    tick: 5,
    trackId: "track2",
    portaledTick: 10,
    portaledTrackId: "track1",
  });

  const chunks = _.applyPortalsToClip(clip, [portal], clipDuration);
  const clips = getPatternClipsFromMedia(chunks);
  expect(chunks.length).toBe(1);
  expect(clips.length).toBe(1);

  // Check the first clip
  expect(clips[0].trackId).toBe("track1");
  expect(clips[0].tick).toBe(0);
  expect(clips[0].duration).toBe(10);
  expect(clips[0].offset).toBe(0);
});

test("applyPortalsToMedia should correctly return two chunks for a clip going through a portal", () => {
  const clip = initializePatternClip({ trackId: "track1" });
  const clipDuration = 10;
  const portal = initializePortal({
    tick: 5,
    trackId: "track1",
    portaledTick: 10,
    portaledTrackId: "track2",
  });

  const chunks = _.applyPortalsToClip(clip, [portal], clipDuration);
  const clips = getPatternClipsFromMedia(chunks);
  expect(chunks.length).toBe(2);
  expect(clips.length).toBe(2);

  // Check the first clip
  expect(clips[0].trackId).toBe("track1");
  expect(clips[0].tick).toBe(0);
  expect(clips[0].duration).toBe(5);
  expect(clips[0].offset).toBe(0);

  // Check the second clip
  expect(clips[1].trackId).toBe("track2");
  expect(clips[1].tick).toBe(10);
  expect(clips[1].duration).toBe(5);
  expect(clips[1].offset).toBe(5);
});

test("applyPortalsToMedia should correctly return three chunks for a clip going through two portals", () => {
  const clip = initializePatternClip({ trackId: "track1" });
  const clipDuration = 12;
  const portal1 = initializePortalFromFragments(
    { trackId: "track1", tick: 5 },
    { trackId: "track2", tick: 10 }
  );
  const portal2 = initializePortalFromFragments(
    { trackId: "track2", tick: 12 },
    { trackId: "track3", tick: 2 }
  );

  // Get the portaled chunks
  const chunks = _.applyPortalsToClip(clip, [portal1, portal2], clipDuration);
  const clips = getPatternClipsFromMedia(chunks);
  expect(chunks.length).toBe(3);
  expect(clips.length).toBe(3);

  // Check the first clip
  expect(clips[0].trackId).toBe("track1");
  expect(clips[0].tick).toBe(0);
  expect(clips[0].duration).toBe(5);
  expect(clips[0].offset).toBe(0);

  // Check the second clip
  expect(clips[1].trackId).toBe("track2");
  expect(clips[1].tick).toBe(10);
  expect(clips[1].duration).toBe(2);
  expect(clips[1].offset).toBe(5);

  // Check the third clip
  expect(clips[2].trackId).toBe("track3");
  expect(clips[2].tick).toBe(2);
  expect(clips[2].duration).toBe(5);
  expect(clips[2].offset).toBe(7);
});

test("applyPortalsToMedia should work with a tight feedback loop", () => {
  const clip = initializePatternClip({ tick: 1, trackId: "track1" });
  const clipDuration = 20;
  const portal1 = initializePortalFromFragments(
    { trackId: "track1", tick: 2 },
    { trackId: "track2", tick: 2 }
  );
  const portal2 = initializePortalFromFragments(
    { trackId: "track2", tick: 3 },
    { trackId: "track1", tick: 1 }
  );

  // Get the portaled chunks
  const chunks = _.applyPortalsToClip(clip, [portal1, portal2], clipDuration);
  const clips = getPatternClipsFromMedia(chunks);
  expect(chunks.length).toBe(20);
  expect(clips.length).toBe(20);

  // Check each chunk
  for (let i = 0; i < 20; i++) {
    const clip = clips[i];
    expect(clip.offset).toBe(i);
    expect(clip.duration).toBe(1);
    if (i % 4 === 0) {
      expect(clip.trackId).toBe("track1");
      expect(clip.tick).toBe(1);
    }
    if (i % 4 === 1) {
      expect(clip.trackId).toBe("track2");
      expect(clip.tick).toBe(2);
    }
  }
});

test("applyPortalsToMedia should not be able to infinitely loop", () => {
  const clip = initializePatternClip({ trackId: "track1" });
  const clipDuration = 10;
  const portal1 = initializePortalFromFragments(
    { trackId: "track1", tick: 5 },
    { trackId: "track2", tick: 5 }
  );
  const portal2 = initializePortalFromFragments(
    { trackId: "track2", tick: 5 },
    { trackId: "track1", tick: 5 }
  );

  // Get the portaled chunks
  const chunks = _.applyPortalsToClip(clip, [portal1, portal2], clipDuration);
  const clips = getPatternClipsFromMedia(chunks);
  expect(chunks.length).toBe(2);
  expect(clips.length).toBe(2);

  // Check the first clip
  expect(clips[0].trackId).toBe("track1");
  expect(clips[0].tick).toBe(0);
  expect(clips[0].duration).toBe(5);
  expect(clips[0].offset).toBe(0);

  // Check the second clip
  expect(clips[1].trackId).toBe("track2");
  expect(clips[1].tick).toBe(5);
  expect(clips[1].duration).toBe(5);
  expect(clips[1].offset).toBe(5);
});
