import { expect, test } from "vitest";
import * as _ from "./MediaTypes";
import { defaultPatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { defaultPattern } from "types/Pattern/PatternTypes";
import { defaultPoseClip } from "types/Clip/PoseClip/PoseClipTypes";
import { defaultPatternClip } from "types/Clip/PatternClip/PatternClipTypes";

test("isMedia should only return true for valid media", () => {
  expect(_.isMedia(defaultPatternClip)).toBe(true);
  expect(_.isMedia(defaultPoseClip)).toBe(true);
  expect(_.isMedia(undefined)).toBe(false);
  expect(_.isMedia({})).toBe(false);
  expect(_.isMedia(defaultPattern)).toBe(false);
  expect(_.isMedia(defaultPatternTrack)).toBe(false);
});
