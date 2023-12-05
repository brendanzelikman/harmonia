import { isTrack } from "types/Track";
import { Timeline } from "./TimelineTypes";
import { Tracked } from "types/Track/TrackTypes";
import { DEFAULT_MEDIA_DRAG_STATE, Media, MediaClipboard } from "types/Media";

/** Checks if the user is adding pattern clips. */
export const isTimelineAddingPatternClips = (timeline: Timeline) => {
  return timeline.state === "addingPatternClips";
};

/** Checks if the user is adding poses. */
export const isTimelineAddingPoseClips = (timeline: Timeline) => {
  return timeline.state === "addingPoseClips";
};

/** Checks if the user is slicing media. */
export const isTimelineSlicingClips = (timeline: Timeline) => {
  return timeline.state === "slicingClips";
};

/** Checks if the user is slicing media. */
export const isTimelinePortalingClips = (timeline: Timeline) => {
  return timeline.state === "portalingClips";
};

/** Checks if the user is merging media. */
export const isTimelineMergingClips = (timeline: Timeline) => {
  return timeline.state === "mergingClips";
};

/** Checks if the user is idle. */
export const isTimelineIdle = (timeline: Timeline) => {
  return timeline.state === "idle";
};

/** Checks if the user is live. */
export const isTimelineLive = (timeline: Timeline) => {
  const hasPoses = !!timeline.mediaSelection.poseClipIds.length;
  const isActive = timeline.livePlay.enabled;
  return hasPoses && isActive;
};

/** Get the track ID of a `TimelineObject` */
export const getTimelineObjectTrackId = <T>(object?: Tracked<T>) => {
  return isTrack(object) ? object.id : object?.trackId;
};

/** Get the media from the `MediaClipboard` */
export const getClipboardMedia = (clipboard: MediaClipboard): Media => {
  return [...clipboard.clips, ...clipboard.portals];
};

/** Get the timeline with the user idled. */
export const getIdleTimeline = (timeline: Timeline): Timeline => {
  return {
    ...timeline,
    state: "idle",
    mediaDragState: DEFAULT_MEDIA_DRAG_STATE,
  };
};
