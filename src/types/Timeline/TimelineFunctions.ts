import { MediaClipboard, Media, MediaElement } from "types/Media/MediaTypes";
import { Timeline } from "./TimelineTypes";
import { union } from "lodash";
import { isPoseClipId } from "types/Clip/ClipTypes";

/** Checks if the user is adding pattern clips. */
export const isTimelineAddingPatternClips = (timeline: Timeline) => {
  return timeline.state === "adding-pattern-clips";
};

/** Checks if the user is adding pose clips. */
export const isTimelineAddingPoseClips = (timeline: Timeline) => {
  return timeline.state === "adding-pose-clips";
};

/** Checks if the user is adding scale clips. */
export const isTimelineAddingScaleClips = (timeline: Timeline) => {
  return timeline.state === "adding-scale-clips";
};

/** Checks if the user is adding the selected kind of clips. */
export const isTimelineAddingSelectedClips = (timeline: Timeline) => {
  const type = timeline.selectedClipType;
  if (!type) return false;
  return timeline.state === `adding-${type}-clips`;
};

/** Checks if the user is slicing media. */
export const isTimelineSlicingClips = (timeline: Timeline) => {
  return timeline.state === "slicing-clips";
};

/** Checks if the user is portaling media. */
export const isTimelinePortalingClips = (timeline: Timeline) => {
  return timeline.state === "portaling-clips";
};

/** Checks if the user is merging media. */
export const isTimelineMergingClips = (timeline: Timeline) => {
  return timeline.state === "merging-clips";
};

/** Checks if the user is idle. */
export const isTimelineIdle = (timeline: Timeline) => {
  return timeline.state === "idle" || timeline.state === undefined;
};

/** Checks if the user is live. */
export const isTimelineLive = (timeline: Timeline) => {
  const onTrack = !!timeline.selectedTrackId;
  const onPoseClip = !!timeline.mediaSelection?.clipIds?.some(isPoseClipId);
  return onTrack && onPoseClip;
};

/** Get the media from the `MediaClipboard` */
export const getClipboardMedia = (clipboard: MediaClipboard): Media => {
  return union<MediaElement>(clipboard.clips, clipboard.portals);
};
