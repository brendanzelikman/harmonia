import { TrackId, TrackMap } from "types/Track";
import { Media } from "./MediaTypes";
import { isClip } from "types/Clip";
import { isPatternTrack } from "types/PatternTrack";
import { isTransposition } from "types/Transposition";
import { Tick } from "types/units";

/** Get the clips from the media. */
export const getMediaClips = (media: Media[]) => {
  return media.filter(isClip);
};

/** Get the transpositions from the media. */
export const getMediaTranspositions = (media: Media[]) => {
  return media.filter(isTransposition);
};

/** Sort the media by tick. */
export const sortMedia = (media: Media[]) => {
  return media.sort((a, b) => a.tick - b.tick);
};

/** Get the valid media based on valid ticks and tracks. */
export const getValidMedia = (media: Media[], trackMap: TrackMap) => {
  return media.filter((item) => {
    // Make sure the tick is valid
    if (item.tick < 0) return false;

    // Make sure the track is valid
    const track = trackMap[item.trackId];
    if (!track) return false;

    // Make sure the clip is in a pattern track
    if (isClip(item) && !isPatternTrack(track)) return false;

    // Return true if all checks pass
    return true;
  });
};

/** Get the earliest start tick of all media. If there is no media, return Infinity. */
export const getMediaStartTick = (media: Media[]) => {
  return media.reduce((acc, item) => Math.min(acc, item.tick), Infinity);
};

/** Get the latest end tick of all media. If there is no media, return -Infinity. */
export const getMediaEndTick = (media: Media[], durations?: Tick[]) => {
  return media.reduce((acc, item, index) => {
    const duration = durations?.[index] ?? item.duration ?? 1;
    return Math.max(acc, item.tick + duration);
  }, -Infinity);
};

/** Get the duration of all media. If there is no media, return 0. */
export const getMediaDuration = (media: Media[], durations?: Tick[]) => {
  return getMediaEndTick(media, durations) - getMediaStartTick(media);
};

/** Get the media that starts in the given tick range. */
export const getMediaInRange = (
  media: Media[],
  mediaDuration: Tick[],
  [startTick, endTick]: [number, number]
) => {
  return media.filter((item, i) => {
    // Get the duration of the media
    const duration = mediaDuration ? mediaDuration[i] : item.duration;

    // Make sure the item is in the range
    const itemStartTick = item.tick;
    const itemEndTick = itemStartTick + (duration ?? 1);
    return itemStartTick < endTick && itemEndTick > startTick;
  });
};

/** Return true if the media overlaps with the given tick range. */
export const doesMediaOverlapRange = (
  media: Media,
  mediaDuration: Tick,
  [startTick, endTick]: [number, number]
) => {
  // Get the duration of the media
  const duration = mediaDuration ?? media.duration;
  if (duration === undefined) return false;

  // Make sure the item is in the range
  const itemStartTick = media.tick;
  const itemEndTick = itemStartTick + duration;
  return itemStartTick < endTick && itemEndTick > startTick;
};

/**
 * Get the list of track IDs that fall in between the given media and the given track ID.
 * If the track ID is not provided, return the track IDs that have media.
 */
export const getMediaTrackIds = (
  media: Media[],
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
export const getMediaStartIndex = (media: Media[], trackIds: TrackId[]) => {
  return trackIds.findIndex((id) => media.some((item) => item.trackId === id));
};

/** Get the offset of the start tick of all media and the given tick. */
export const getMediaTickOffset = (media: Media[], tick: number) => {
  return tick - getMediaStartTick(media);
};

/** Get the offset between the starting track index of the media and the index of the given track ID. */
export const getMediaIndexOffset = (
  media: Media[],
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
  media: Media[],
  tick: number,
  trackId?: TrackId,
  trackIds?: TrackId[]
): Media[] => {
  // Get the track offset
  const shouldOffsetTracks = !!trackId && trackIds;
  const trackOffset = shouldOffsetTracks
    ? getMediaIndexOffset(media, trackId, trackIds)
    : 0;

  // Iterate through the media and offset each item
  const offsetedMedia = media.map((item) => {
    const offsetedItem = { ...item };

    // Offset the tick
    const tickOffset = getMediaTickOffset(media, tick);
    offsetedItem.tick += tickOffset;

    // Offset the track ID if the parameters are provided and in range
    const trackIndex = trackIds?.indexOf(item.trackId);
    if (trackIndex === undefined) return offsetedItem;
    const newTrackId = trackIds?.[trackIndex + trackOffset];
    if (newTrackId) offsetedItem.trackId = newTrackId;

    // Return the offseted item
    return offsetedItem;
  });

  // Return the offseted media
  return offsetedMedia;
};

/** Get the duplicated media starting at the end of the given media. */
export const getDuplicatedMedia = (
  media: Media[],
  durations: Tick[]
): Media[] => {
  const endTick = getMediaEndTick(media, durations);
  return getOffsettedMedia(media, endTick);
};
