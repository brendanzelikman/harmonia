import { expect, test } from "vitest";
import * as _ from "./MediaTypes";
import { mockPatternTrack } from "types/PatternTrack";
import { defaultPose } from "types/Pose";
import { defaultClip } from "types/Clip";

test("isMedia should only return true for valid media", () => {
  expect(_.isMediaClip(defaultClip)).toBe(true);
  expect(_.isMediaClip(defaultPose)).toBe(true);
  expect(_.isMediaClip(undefined)).toBe(false);
  expect(_.isMediaClip({})).toBe(false);
  expect(_.isMediaClip(mockPatternTrack)).toBe(false);
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
