import { isTrack } from "types/Track";
import { TimelineClipboard, TimelineObject } from "./TimelineTypes";
import { Media } from "types/Media";

/**
 * Get the track ID of a `TimelineObject`.
 * @param object The `TimelineObject`.
 * @returns The track ID.
 */
export const getTimelineObjectTrackId = (object?: TimelineObject) => {
  return isTrack(object) ? object.id : object?.trackId;
};

/**
 * Get the media from the `TimelineClipboard`.
 * @param clipboard The clipboard.
 * @returns An array media.
 */
export const getClipboardMedia = (clipboard: TimelineClipboard) => {
  return [...clipboard.clips, ...clipboard.transpositions] as Media[];
};
