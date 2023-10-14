import { isTrack } from "types/Track";
import { Timeline, TimelineObject } from "./TimelineTypes";
import { Media, MediaClipboard } from "types/Media";

/**
 * Checks if the user is adding clips.
 */
export const isAddingClips = (timeline: Timeline) => {
  return timeline.state === "addingClips";
};

/**
 * Checks if the user is adding transpositions.
 */
export const isAddingTranspositions = (timeline: Timeline) => {
  return timeline.state === "addingTranspositions";
};

/**
 * Checks if the user is slicing media.
 */
export const isSlicingMedia = (timeline: Timeline) => {
  return timeline.state === "slicingMedia";
};

/**
 * Checks if the user is merging media.
 */
export const isMergingMedia = (timeline: Timeline) => {
  return timeline.state === "mergingMedia";
};

/**
 * Checks if the user is idle.
 */
export const isIdle = (timeline: Timeline) => {
  return timeline.state === "idle";
};

/**
 * Get the track ID of a `TimelineObject`.
 * @param object The `TimelineObject`.
 * @returns The track ID.
 */
export const getTimelineObjectTrackId = (object?: TimelineObject) => {
  return isTrack(object) ? object.id : object?.trackId;
};

/**
 * Get the media from the `MediaClipboard`.
 * @param clipboard The clipboard.
 * @returns An array media.
 */
export const getClipboardMedia = (clipboard: MediaClipboard) => {
  return [...clipboard.clips, ...clipboard.transpositions] as Media[];
};
