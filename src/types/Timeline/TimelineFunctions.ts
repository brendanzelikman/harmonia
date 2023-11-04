import { isTrack } from "types/Track";
import { Timeline } from "./TimelineTypes";
import { Tracked } from "types/Track/TrackTypes";
import {
  DEFAULT_MEDIA_DRAG_STATE,
  Media,
  MediaClip,
  MediaClipboard,
} from "types/Media";

/** Checks if the user is adding clips. */
export const isTimelineAddingClips = (timeline: Timeline) => {
  return timeline.state === "addingClips";
};

/** Checks if the user is adding transpositions. */
export const isTimelineAddingTranspositions = (timeline: Timeline) => {
  return timeline.state === "addingTranspositions";
};

/** Checks if the user is slicing media. */
export const isTimelineSlicingMedia = (timeline: Timeline) => {
  return timeline.state === "slicingMedia";
};

/** Checks if the user is slicing media. */
export const isTimelinePortalingMedia = (timeline: Timeline) => {
  return timeline.state === "portalingMedia";
};

/** Checks if the user is merging media. */
export const isTimelineMergingMedia = (timeline: Timeline) => {
  return timeline.state === "mergingMedia";
};

/** Checks if the user is idle. */
export const isTimelineIdle = (timeline: Timeline) => {
  return timeline.state === "idle";
};

/** Checks if the user is live. */
export const isTimelineLive = (timeline: Timeline) => {
  const hasPoses = !!timeline.mediaSelection.poseIds.length;
  const isActive = timeline.liveTranspositionSettings.enabled;
  return hasPoses && isActive;
};

/** Get the track ID of a `TimelineObject` */
export const getTimelineObjectTrackId = <T>(object?: Tracked<T>) => {
  return isTrack(object) ? object.id : object?.trackId;
};

/** Get the media from the `MediaClipboard` */
export const getClipboardMedia = (clipboard: MediaClipboard): Media => {
  return [...clipboard.clips, ...clipboard.poses, ...clipboard.portals];
};

/** Get the timeline with the user idled. */
export const getIdleTimeline = (timeline: Timeline): Timeline => {
  return {
    ...timeline,
    state: "idle",
    mediaDragState: DEFAULT_MEDIA_DRAG_STATE,
  };
};
