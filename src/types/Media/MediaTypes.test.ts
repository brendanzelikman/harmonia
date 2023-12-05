import { expect, test } from "vitest";
import * as _ from "./MediaTypes";
import { defaultPatternTrack } from "types/Track";
import { defaultPatternClip, defaultPoseClip } from "types/Clip";
import { defaultPattern } from "types/Pattern";

test("isMedia should only return true for valid media", () => {
  expect(_.isMedia(defaultPatternClip)).toBe(true);
  expect(_.isMedia(defaultPoseClip)).toBe(true);
  expect(_.isMedia(undefined)).toBe(false);
  expect(_.isMedia({})).toBe(false);
  expect(_.isMedia(defaultPattern)).toBe(false);
  expect(_.isMedia(defaultPatternTrack)).toBe(false);
});

test("isMediaSelection should only return true for selections", () => {
  expect(_.isMediaSelection(_.DEFAULT_MEDIA_SELECTION)).toBe(true);
  expect(_.isMediaSelection(_.DEFAULT_MEDIA_CLIPBOARD)).toBe(false);
  expect(_.isMediaSelection(_.DEFAULT_MEDIA_DRAFT)).toBe(false);
  expect(_.isMediaSelection(_.DEFAULT_MEDIA_DRAG_STATE)).toBe(false);
});

test("isMediaClipboard should only return true for clipboards", () => {
  expect(_.isMediaClipboard(_.DEFAULT_MEDIA_SELECTION)).toBe(false);
  expect(_.isMediaClipboard(_.DEFAULT_MEDIA_CLIPBOARD)).toBe(true);
  expect(_.isMediaClipboard(_.DEFAULT_MEDIA_DRAFT)).toBe(false);
  expect(_.isMediaClipboard(_.DEFAULT_MEDIA_DRAG_STATE)).toBe(false);
});

test("isMediaDraft should only return true for drafts", () => {
  expect(_.isMediaDraft(_.DEFAULT_MEDIA_SELECTION)).toBe(false);
  expect(_.isMediaDraft(_.DEFAULT_MEDIA_CLIPBOARD)).toBe(false);
  expect(_.isMediaDraft(_.DEFAULT_MEDIA_DRAFT)).toBe(true);
  expect(_.isMediaDraft(_.DEFAULT_MEDIA_DRAG_STATE)).toBe(false);
});

test("isMediaDragState should only return true for drag states", () => {
  expect(_.isMediaDragState(_.DEFAULT_MEDIA_SELECTION)).toBe(false);
  expect(_.isMediaDragState(_.DEFAULT_MEDIA_CLIPBOARD)).toBe(false);
  expect(_.isMediaDragState(_.DEFAULT_MEDIA_DRAFT)).toBe(false);
  expect(_.isMediaDragState(_.DEFAULT_MEDIA_DRAG_STATE)).toBe(true);
});
