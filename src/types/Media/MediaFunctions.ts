import { Media, MediaElement } from "./MediaTypes";
import { Tick } from "types/units";
import { inRange, isUndefined } from "lodash";
import {
  Clip,
  isClipInterface,
  isIPatternClip,
  isIPoseClip,
  isIScaleClip,
} from "types/Clip/ClipTypes";
import { applyPortalsToClips } from "types/Portal/PortalFunctions";
import { isPortal } from "types/Portal/PortalTypes";
import { TrackMap, TrackId, isPatternTrack } from "types/Track/TrackTypes";
import { isFiniteNumber } from "types/util";

/** Get the clips from the media. */
export const getClipsFromMedia = (media: Media) => {
  return media.filter((item) => isClipInterface(item)) as Clip[];
};

/** Get the pattern clips from the media. */
export const getPatternClipsFromMedia = (media: Media) => {
  return media.filter(isIPatternClip);
};

/** Get the pose clips from the media. */
export const getPoseClipsFromMedia = (media: Media) => {
  return media.filter(isIPoseClip);
};

/** Get the scale clips from the media. */
export const getScaleClipsFromMedia = (media: Media) => {
  return media.filter(isIScaleClip);
};

/** Get the portals from the media. */
export const getPortalsFromMedia = (media: Media) => {
  return media.filter(isPortal);
};

/** Sort the media clips by tick. */
export const sortMediaByTick = (media: Media) => {
  return media.sort((a, b) => a.tick - b.tick);
};

/** Get the valid media clips based on valid ticks and tracks. */
export const getValidMedia = (media: Media, trackMap: TrackMap): Media => {
  return media.filter((item) => {
    // Make sure the tick is valid
    if (item.tick < 0) return false;

    // Make sure the track is valid
    const track = trackMap[item.trackId];
    if (!track) return false;

    // Make sure the clip is in a pattern track
    if (isIPatternClip(item) && !isPatternTrack(track)) return false;

    // Return true if all checks pass
    return true;
  });
};

/** Get the duration of a media element and try to use the provided value. */
export const getMediaElementDuration = (
  element: MediaElement,
  value?: Tick
) => {
  if (!isUndefined(value)) return value;
  if (isPortal(element)) return 1;
  return element?.duration ?? 1;
};

/** Get the earliest start tick of all media. If there is no media, return Infinity. */
export const getMediaStartTick = (media: Media) => {
  return media.reduce((acc, item) => Math.min(acc, item.tick), Infinity);
};

/** Get the latest end tick of all media. If there is no media, return -Infinity. */
export const getMediaEndTick = (media: Media, mediaDurations?: Tick[]) => {
  // Get the portals and their indices
  const portals = getPortalsFromMedia(media);
  const portalIndices = media
    .map((item, i) => (isPortal(item) ? i : -1))
    .filter((i) => i > -1);

  // Get all clips and their durations
  const clips = getClipsFromMedia(media);
  const durations =
    mediaDurations?.filter((_, i) => !portalIndices.includes(i)) ?? [];

  // Apply the clips through the portals first
  const portaledClips = applyPortalsToClips(clips, portals, durations).flat();
  const processedMedia = media.map(
    (item) => portaledClips.find((clip) => clip.id === item.id) ?? item
  );

  // Get the end tick of the processed media
  return processedMedia.reduce((acc, item, index) => {
    const duration = getMediaElementDuration(item, mediaDurations?.[index]);
    return Math.max(acc, item.tick + (isFiniteNumber(duration) ? duration : 1));
  }, -Infinity);
};

/** Get the duration of all media. If there is no media, return 0. */
export const getMediaDuration = (media: Media, durations?: Tick[]) => {
  return getMediaEndTick(media, durations) - getMediaStartTick(media);
};

/** Get the media that starts in the given tick range. */
export const getMediaInRange = (
  media: Media,
  mediaDuration: Tick[],
  [startTick, endTick]: [number, number]
): Media => {
  return media.filter((item, i) => {
    // Get the duration of the media
    const duration = getMediaElementDuration(item, mediaDuration?.[i]);
    if (!isFiniteNumber(duration)) {
      return inRange(item.tick, startTick, endTick);
    }

    // Make sure the item is in the range
    const itemStartTick = item.tick;
    const itemEndTick = itemStartTick + (duration ?? 1);
    return itemStartTick < endTick && itemEndTick > startTick;
  });
};

/** Return true if the media overlaps with the given tick range. */
export const doesMediaElementOverlapRange = (
  media: MediaElement,
  mediaDuration: Tick,
  [startTick, endTick]: [number, number]
) => {
  // Get the duration of the media
  const duration = getMediaElementDuration(media, mediaDuration);
  if (duration === undefined) return false;

  // Make sure the item is in the range
  const itemStartTick = media.tick;
  const itemEndTick = itemStartTick + duration;
  return itemStartTick <= endTick && itemEndTick >= startTick;
};

/**
 * Get the list of track IDs that fall in between the given media and the given track ID.
 * If the track ID is not provided, return the track IDs that have media.
 */
export const getMediaTrackIds = (
  media: Media,
  trackIds: TrackId[],
  trackId?: TrackId
) => {
  // If the track ID is not provided, return the track IDs that have media
  if (!trackId) {
    return trackIds.filter((id) => media.some((item) => item.trackId === id));
  }

  // Otherwise, slice the track IDs from the first track ID that has media to the given track ID
  const startIndex = trackIds.findIndex((id) =>
    media.some((item) => item.trackId === id)
  );
  const endIndex = trackIds.findIndex((id) => id === trackId);
  if (startIndex === -1 || endIndex === -1) return [];

  if (startIndex > endIndex) {
    return trackIds.slice(endIndex, startIndex + 1);
  } else {
    return trackIds.slice(startIndex, endIndex + 1);
  }
};

/** Get the starting track index of the media using the list of ordered track IDs. */
export const getMediaStartIndex = (media: Media, trackIds: TrackId[]) => {
  return trackIds.findIndex((id) => media.some((item) => item.trackId === id));
};

/** Get the offset of the start tick of all media and the given tick. */
export const getMediaTickOffset = (media: Media, tick: number) => {
  return tick - getMediaStartTick(media);
};

/** Get the offset between the starting track index of the media and the index of the given track ID. */
export const getMediaIndexOffset = (
  media: Media,
  trackId: TrackId,
  trackIds: TrackId[]
) => {
  const startIndex = getMediaStartIndex(media, trackIds);
  const trackIndex = trackIds.indexOf(trackId);
  if (startIndex === -1 || trackIndex === -1) return 0;
  return trackIndex - startIndex;
};

/** Get the offsetted media starting from the new tick and optional track ID to start from. */
export const getOffsettedMedia = (
  media: Media,
  tick: number,
  trackId?: TrackId,
  trackIds?: TrackId[]
): Media => {
  // Get the track offset
  const shouldOffsetTracks = !!trackId && trackIds;
  const trackOffset = shouldOffsetTracks
    ? getMediaIndexOffset(media, trackId, trackIds)
    : 0;

  // Iterate through the media and offset each item
  const offsetedMedia = media.map((item) => {
    let element = { ...item };

    // Offset the tick
    const tickOffset = getMediaTickOffset(media, tick);
    element.tick += tickOffset;

    // Offset the track ID if the parameters are provided and in range
    const trackIndex = trackIds?.indexOf(item.trackId) ?? -1;
    const entryId = trackIds?.[trackIndex + trackOffset];
    if (trackIndex > -1 && entryId) element.trackId = entryId;

    // Update the portaled parameters if the item is a portal
    if (isPortal(element)) {
      // Update the portaled tick
      element.portaledTick += tickOffset;

      // Update the portaled track ID
      const { portaledTrackId } = element;
      const exitIndex = trackIds?.indexOf(portaledTrackId) ?? -1;
      const exitId = trackIds?.[exitIndex + trackOffset];
      if (exitIndex > -1 && exitId) element.portaledTrackId = exitId;
    }

    // Return the offseted item
    return element;
  });

  // Return the offseted media
  return offsetedMedia;
};

/** Get the duplicated media starting at the end of the given media. */
export const getDuplicatedMedia = (media: Media, durations: Tick[]) => {
  const endTick = getMediaEndTick(media, durations);
  return getOffsettedMedia(media, endTick);
};
