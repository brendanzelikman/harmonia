import { test, expect } from "vitest";
import * as _ from "./MediaFunctions";
import { initializeClip, mockClip } from "types/Clip";
import { initializePose, mockPose } from "types/Transposition";
import { initializePatternTrack } from "types/PatternTrack";
import { createMap } from "utils/objects";
import { initializeScaleTrack } from "types/ScaleTrack";

test("getMediaClips should only include clips", () => {
  expect(_.getMediaClips([mockClip, mockPose])).toEqual([mockClip]);
  expect(_.getMediaClips([mockClip])).toEqual([mockClip]);
  expect(_.getMediaClips([mockPose])).toEqual([]);
});

test("getMediaTranspositions should only include transpositions", () => {
  expect(_.getMediaTranspositions([mockClip, mockPose])).toEqual([mockPose]);
  expect(_.getMediaTranspositions([mockClip])).toEqual([]);
  expect(_.getMediaTranspositions([mockPose])).toEqual([mockPose]);
});

test("sortMedia should correctly sort the media by tick", () => {
  const clip = initializeClip({ tick: 5 });
  const pose = initializePose({ tick: 3 });
  expect(_.sortMedia([clip, pose])).toEqual([pose, clip]);
});

test("getValidMedia should filter out media with no tracks", () => {
  const patternTrack = initializePatternTrack();
  const trackMap = createMap([patternTrack]);
  const clip = initializeClip({ trackId: patternTrack.id });
  const pose = initializePose({ trackId: "unknown-track-id" });
  expect(_.getValidMedia([clip, pose], trackMap)).toEqual([clip]);
});

test("getValidMedia should filter out media with invalid ticks", () => {
  const patternTrack = initializePatternTrack();
  const trackMap = createMap([patternTrack]);
  const clip = initializeClip({ trackId: patternTrack.id, tick: -1 });
  const pose = initializePose({ trackId: patternTrack.id, tick: 0 });
  expect(_.getValidMedia([clip, pose], trackMap)).toEqual([pose]);
});

test("getValidMedia should filter out clips inside scale tracks", () => {
  const scaleTrack = initializeScaleTrack();
  const trackMap = createMap([scaleTrack]);
  const clip = initializeClip({ trackId: scaleTrack.id });
  const pose = initializePose({ trackId: scaleTrack.id });
  expect(_.getValidMedia([clip, pose], trackMap)).toEqual([pose]);
});

test("getMediaInRange should return the correct media in range", () => {
  const clip = initializeClip({ tick: 0 });
  const pose = initializePose({ tick: 0 });
  expect(_.getMediaInRange([clip, pose], [3, 1], [2, 4])).toEqual([clip]);
});

test("getMediaTrackIds should return the correct list of track IDs", () => {
  const clip = initializeClip({ trackId: "t1" });
  const pose = initializePose({ trackId: "t2" });
  const trackIds = ["t1", "t2", "t3", "t4", "t5"];
  const mediaTrackIds = _.getMediaTrackIds([clip, pose], trackIds, "t4");
  expect(mediaTrackIds).toEqual(["t1", "t2", "t3", "t4"]);
});

test("getMediaStartTick should return the correct start tick", () => {
  const clip = initializeClip({ tick: 1 });
  const pose = initializePose({ tick: 2 });
  expect(_.getMediaStartTick([clip, pose])).toEqual(1);
});

test("getMediaEndTick should return the correct end tick without durations", () => {
  const clip = initializeClip({ tick: 1 });
  const pose = initializePose({ tick: 2 });
  expect(_.getMediaEndTick([clip, pose])).toEqual(3);
});

test("getMediaEndTick should return the correct end tick with durations", () => {
  const clip = initializeClip({ tick: 1 });
  const pose = initializePose({ tick: 2 });
  expect(_.getMediaEndTick([clip, pose], [2, 3])).toEqual(5);
});

test("getMediaDuration should return the correct duration without durations", () => {
  const clip = initializeClip({ tick: 1 });
  const pose = initializePose({ tick: 2 });
  expect(_.getMediaDuration([clip, pose])).toEqual(2);
});

test("getMediaDuration should return the correct duration with durations", () => {
  const clip = initializeClip({ tick: 1 });
  const pose = initializePose({ tick: 5 });
  expect(_.getMediaDuration([clip, pose], [3, 4])).toEqual(8);
});

test("getMediaStartIndex should return the correct start index if found", () => {
  const clip = initializeClip({ trackId: "t2" });
  const pose = initializePose({ trackId: "t3" });
  const trackIds = ["t1", "t2", "t3", "t4", "t5"];
  expect(_.getMediaStartIndex([clip, pose], trackIds)).toEqual(1);
});

test("getMediaStartIndex should return -1 if not found", () => {
  const clip = initializeClip({ trackId: "t6" });
  const pose = initializePose({ trackId: "t6" });
  const trackIds = ["t1", "t2", "t3", "t4", "t5"];
  expect(_.getMediaStartIndex([clip, pose], trackIds)).toEqual(-1);
});

test("getMediaTickOffset should return the correct tick offset", () => {
  const clip = initializeClip({ tick: 1 });
  const pose = initializePose({ tick: 2 });
  expect(_.getMediaTickOffset([clip, pose], 5)).toEqual(4);
});

test("getMediaIndexOffset should return the correct index offset if found", () => {
  const clip = initializeClip({ trackId: "t2" });
  const pose = initializePose({ trackId: "t3" });
  const trackIds = ["t1", "t2", "t3", "t4", "t5"];
  expect(_.getMediaIndexOffset([clip, pose], "t4", trackIds)).toEqual(2);
});

test("getMediaIndexOffset should return 0 if not found", () => {
  const clip = initializeClip({ trackId: "t2" });
  const pose = initializePose({ trackId: "t3" });
  const trackIds = ["t1", "t2", "t3", "t4", "t5"];
  expect(_.getMediaIndexOffset([clip, pose], "t6", trackIds)).toEqual(0);
});

test("getOffsettedMedia should change media to start from the given tick", () => {
  const clip = initializeClip({ tick: 1 });
  const pose = initializePose({ tick: 2 });
  const media = [clip, pose];
  const newMedia = _.getOffsettedMedia(media, 4);
  expect(_.getMediaStartTick(newMedia)).toEqual(_.getMediaStartTick(media) + 3);
  expect(_.getMediaEndTick(newMedia)).toEqual(_.getMediaEndTick(media) + 3);
  expect(_.getMediaDuration(newMedia)).toEqual(_.getMediaDuration(media));
});

test("getOffsettedMedia should not change tracks without the IDs as well", () => {
  const clip = initializeClip({ tick: 1, trackId: "t1" });
  const pose = initializePose({ tick: 2, trackId: "t2" });
  const media = [clip, pose];
  const newMedia = _.getOffsettedMedia(media, 3, "t2");
  expect(media[0].trackId).toEqual(newMedia[0].trackId);
  expect(media[1].trackId).toEqual(newMedia[1].trackId);
});

test("getOffsettedMedia should change tracks when the IDs are provided", () => {
  const clip = initializeClip({ tick: 1, trackId: "t1" });
  const pose = initializePose({ tick: 2, trackId: "t2" });
  const media = [clip, pose];
  const newMedia = _.getOffsettedMedia(media, 3, "t2", ["t1", "t2", "t3"]);
  expect(media[0].trackId).toEqual("t1");
  expect(newMedia[0].trackId).toEqual("t2");
  expect(media[1].trackId).toEqual("t2");
  expect(newMedia[1].trackId).toEqual("t3");
});

test("getOffsettedMedia should not change tracks that become out of bound", () => {
  const clip = initializeClip({ tick: 1, trackId: "t2" });
  const pose = initializePose({ tick: 2, trackId: "t3" });
  const media = [clip, pose];
  const newMedia = _.getOffsettedMedia(media, 3, "t3", ["t1", "t2", "t3"]);
  expect(media[0].trackId).toEqual("t2");
  expect(newMedia[0].trackId).toEqual("t3");
  expect(media[1].trackId).toEqual("t3");
  expect(newMedia[1].trackId).toEqual("t3");
});

test("getDuplicatedMedia should correctly duplicate each item after its duration", () => {
  const clip = initializeClip({ tick: 1 });
  const pose = initializePose({ tick: 2 });
  const media = [clip, pose];
  const newMedia = _.getDuplicatedMedia(media, [2, 4]);
  expect(media[0].tick).toEqual(1);
  expect(newMedia[0].tick).toEqual(6);
  expect(media[1].tick).toEqual(2);
  expect(newMedia[1].tick).toEqual(7);
  expect(_.getMediaDuration(media)).toEqual(_.getMediaDuration(newMedia));
});

test("doesMediaOverlap should only return true when the media overlaps the range", () => {
  const clip = initializeClip({ tick: 1 });
  const pose = initializePose({ tick: 2 });
  expect(_.doesMediaOverlapRange(clip, 5, [4, 5])).toBe(true);
  expect(_.doesMediaOverlapRange(pose, 1, [4, 5])).toBe(false);
});
