import { test, expect } from "vitest";
import * as _ from "./MediaFunctions";
import { createDictionary } from "utils/objects";
import {
  initializePatternClip,
  initializePoseClip,
} from "types/Clip/ClipTypes";
import { TrackId } from "types/Track/TrackTypes";
import { initializePatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { initializeScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";

const patternClip = initializePatternClip({ tick: 5 });
const poseClip = initializePoseClip({ tick: 3 });

test("getMediaClips should only include clips", () => {
  expect(_.getPatternClipsFromMedia([patternClip, poseClip])).toEqual([
    patternClip,
  ]);
  expect(_.getPatternClipsFromMedia([patternClip])).toEqual([patternClip]);
  expect(_.getPatternClipsFromMedia([poseClip])).toEqual([]);
});

test("getMediaPoses should only include poses", () => {
  expect(_.getPoseClipsFromMedia([patternClip, poseClip])).toEqual([poseClip]);
  expect(_.getPoseClipsFromMedia([patternClip])).toEqual([]);
  expect(_.getPoseClipsFromMedia([poseClip])).toEqual([poseClip]);
});

test("sortMedia should correctly sort the media by tick", () => {
  expect(_.sortMediaByTick([patternClip, poseClip])).toEqual([
    poseClip,
    patternClip,
  ]);
});

test("getValidMedia should filter out media with no tracks", () => {
  const patternTrack = initializePatternTrack();
  const trackMap = createDictionary([patternTrack]);
  const patternClip = initializePatternClip({ trackId: patternTrack.id });
  const poseClip = initializePoseClip({ trackId: "pattern-track_3" });
  expect(_.getValidMedia([patternClip, poseClip], trackMap)).toEqual([
    patternClip,
  ]);
});

test("getValidMedia should filter out media with invalid ticks", () => {
  const patternTrack = initializePatternTrack();
  const trackMap = createDictionary([patternTrack]);
  const patternClip = initializePatternClip({
    trackId: patternTrack.id,
    tick: -1,
  });
  const poseClip = initializePoseClip({ trackId: patternTrack.id, tick: 0 });
  expect(_.getValidMedia([patternClip, poseClip], trackMap)).toEqual([
    poseClip,
  ]);
});

test("getValidMedia should filter out clips inside scale tracks", () => {
  const scaleTrack = initializeScaleTrack();
  const trackMap = createDictionary([scaleTrack]);
  const patternClip = initializePatternClip({ trackId: scaleTrack.id });
  const poseClip = initializePoseClip({ trackId: scaleTrack.id });
  expect(_.getValidMedia([patternClip, poseClip], trackMap)).toEqual([
    poseClip,
  ]);
});

test("getMediaInRange should return the correct media in range", () => {
  const patternClip = initializePatternClip({ tick: 0 });
  const poseClip = initializePoseClip({ tick: 0 });
  expect(_.getMediaInRange([patternClip, poseClip], [3, 1], [2, 4])).toEqual([
    patternClip,
  ]);
});

test("getMediaTrackIds should return the correct list of track IDs", () => {
  const patternClip = initializePatternClip({ trackId: "pattern-track_1" });
  const poseClip = initializePoseClip({ trackId: "pattern-track_2" });
  const trackIds: TrackId[] = [
    "pattern-track_1",
    "pattern-track_2",
    "pattern-track_3",
    "pattern-track_4",
    "pattern-track_5",
  ];
  const mediaTrackIds = _.getMediaTrackIds(
    [patternClip, poseClip],
    trackIds,
    "pattern-track_4"
  );
  expect(mediaTrackIds).toEqual([
    "pattern-track_1",
    "pattern-track_2",
    "pattern-track_3",
    "pattern-track_4",
  ]);
});

test("getMediaStartTick should return the correct start tick", () => {
  const patternClip = initializePatternClip({ tick: 1 });
  const poseClip = initializePoseClip({ tick: 2 });
  expect(_.getMediaStartTick([patternClip, poseClip])).toEqual(1);
});

test("getMediaEndTick should return the correct end tick without durations", () => {
  const patternClip = initializePatternClip({ tick: 1 });
  const poseClip = initializePoseClip({ tick: 2 });
  expect(_.getMediaEndTick([patternClip, poseClip])).toEqual(2);
});

test("getMediaEndTick should return the correct end tick with durations", () => {
  const patternClip = initializePatternClip({ tick: 1 });
  const poseClip = initializePoseClip({ tick: 2 });
  expect(_.getMediaEndTick([patternClip, poseClip], [2, 3])).toEqual(5);
});

test("getMediaDuration should return the correct duration without durations", () => {
  const patternClip = initializePatternClip({ tick: 1 });
  const poseClip = initializePoseClip({ tick: 2 });
  expect(_.getMediaDuration([patternClip, poseClip])).toEqual(1);
});

test("getMediaDuration should return the correct duration with durations", () => {
  const patternClip = initializePatternClip({ tick: 1 });
  const poseClip = initializePoseClip({ tick: 5 });
  expect(_.getMediaDuration([patternClip, poseClip], [3, 4])).toEqual(8);
});

test("getMediaStartIndex should return the correct start index if found", () => {
  const patternClip = initializePatternClip({ trackId: "pattern-track_2" });
  const poseClip = initializePoseClip({ trackId: "pattern-track_3" });
  const trackIds: TrackId[] = [
    "pattern-track_1",
    "pattern-track_2",
    "pattern-track_3",
    "pattern-track_4",
    "pattern-track_5",
  ];
  expect(_.getMediaStartIndex([patternClip, poseClip], trackIds)).toEqual(1);
});

test("getMediaStartIndex should return -1 if not found", () => {
  const patternClip = initializePatternClip({ trackId: "pattern-track_6" });
  const poseClip = initializePoseClip({ trackId: "pattern-track_6" });
  const trackIds: TrackId[] = [
    "pattern-track_1",
    "pattern-track_2",
    "pattern-track_3",
    "pattern-track_4",
    "pattern-track_5",
  ];
  expect(_.getMediaStartIndex([patternClip, poseClip], trackIds)).toEqual(-1);
});

test("getMediaTickOffset should return the correct tick offset", () => {
  const patternClip = initializePatternClip({ tick: 1 });
  const poseClip = initializePoseClip({ tick: 2 });
  expect(_.getMediaTickOffset([patternClip, poseClip], 5)).toEqual(4);
});

test("getMediaIndexOffset should return the correct index offset if found", () => {
  const patternClip = initializePatternClip({ trackId: "pattern-track_2" });
  const poseClip = initializePoseClip({ trackId: "pattern-track_3" });
  const trackIds: TrackId[] = [
    "pattern-track_1",
    "pattern-track_2",
    "pattern-track_3",
    "pattern-track_4",
    "pattern-track_5",
  ];
  expect(
    _.getMediaIndexOffset([patternClip, poseClip], "pattern-track_4", trackIds)
  ).toEqual(2);
});

test("getMediaIndexOffset should return 0 if not found", () => {
  const patternClip = initializePatternClip({ trackId: "pattern-track_2" });
  const poseClip = initializePoseClip({ trackId: "pattern-track_3" });
  const trackIds: TrackId[] = [
    "pattern-track_1",
    "pattern-track_2",
    "pattern-track_3",
    "pattern-track_4",
    "pattern-track_5",
  ];
  expect(
    _.getMediaIndexOffset([patternClip, poseClip], "pattern-track_6", trackIds)
  ).toEqual(0);
});

test("getOffsettedMedia should change media to start from the given tick", () => {
  const patternClip = initializePatternClip({ tick: 1 });
  const poseClip = initializePoseClip({ tick: 2 });
  const media = [patternClip, poseClip];
  const newMedia = _.getOffsettedMedia(media, 4);
  expect(_.getMediaStartTick(newMedia)).toEqual(_.getMediaStartTick(media) + 3);
  expect(_.getMediaEndTick(newMedia)).toEqual(_.getMediaEndTick(media) + 3);
  expect(_.getMediaDuration(newMedia)).toEqual(_.getMediaDuration(media));
});

test("getOffsettedMedia should not change tracks without the IDs as well", () => {
  const patternClip = initializePatternClip({
    tick: 1,
    trackId: "pattern-track_1",
  });
  const poseClip = initializePoseClip({ tick: 2, trackId: "pattern-track_2" });
  const media = [patternClip, poseClip];
  const newMedia = _.getOffsettedMedia(media, 3, "pattern-track_2");
  expect(media[0].trackId).toEqual(newMedia[0].trackId);
  expect(media[1].trackId).toEqual(newMedia[1].trackId);
});

test("getOffsettedMedia should change tracks when the IDs are provided", () => {
  const patternClip = initializePatternClip({
    tick: 1,
    trackId: "pattern-track_1",
  });
  const poseClip = initializePoseClip({ tick: 2, trackId: "pattern-track_2" });
  const media = [patternClip, poseClip];
  const newMedia = _.getOffsettedMedia(media, 3, "pattern-track_2", [
    "pattern-track_1",
    "pattern-track_2",
    "pattern-track_3",
  ]);
  expect(media[0].trackId).toEqual("pattern-track_1");
  expect(newMedia[0].trackId).toEqual("pattern-track_2");
  expect(media[1].trackId).toEqual("pattern-track_2");
  expect(newMedia[1].trackId).toEqual("pattern-track_3");
});

test("getOffsettedMedia should not change tracks that become out of bound", () => {
  const patternClip = initializePatternClip({
    tick: 1,
    trackId: "pattern-track_2",
  });
  const poseClip = initializePoseClip({ tick: 2, trackId: "pattern-track_3" });
  const media = [patternClip, poseClip];
  const newMedia = _.getOffsettedMedia(media, 3, "pattern-track_3", [
    "pattern-track_1",
    "pattern-track_2",
    "pattern-track_3",
  ]);
  expect(media[0].trackId).toEqual("pattern-track_2");
  expect(newMedia[0].trackId).toEqual("pattern-track_3");
  expect(media[1].trackId).toEqual("pattern-track_3");
  expect(newMedia[1].trackId).toEqual("pattern-track_3");
});

test("getDuplicatedMedia should correctly duplicate each item after its duration", () => {
  const patternClip = initializePatternClip({ tick: 1 });
  const poseClip = initializePoseClip({ tick: 2 });
  const media = [patternClip, poseClip];
  const newMedia = _.getDuplicatedMedia(media, [2, 4]);
  expect(media[0].tick).toEqual(1);
  expect(newMedia[0].tick).toEqual(6);
  expect(media[1].tick).toEqual(2);
  expect(newMedia[1].tick).toEqual(7);
  expect(_.getMediaDuration(media)).toEqual(_.getMediaDuration(newMedia));
});

test("doesMediaOverlap should only return true when the media overlaps the range", () => {
  const patternClip = initializePatternClip({ tick: 1 });
  const poseClip = initializePoseClip({ tick: 2 });
  expect(_.doesMediaElementOverlapRange(patternClip, 5, [4, 5])).toBe(true);
  expect(_.doesMediaElementOverlapRange(poseClip, 1, [4, 5])).toBe(false);
});
