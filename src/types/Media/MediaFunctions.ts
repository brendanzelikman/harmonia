import { TrackId, TrackMap } from "types/Track/TrackTypes";
import { Media } from "./MediaTypes";
import { isClip } from "types/Clip/ClipTypes";
import { isPatternTrack } from "types/PatternTrack/PatternTrackTypes";
import { isTransposition } from "types/Transposition/TranspositionTypes";
import { Tick } from "types/units";

/**
 * Get the clips from the media.
 * @param media The media.
 * @returns An array of clips.
 */
export const getMediaClips = (media: Media[]) => {
  return media.filter(isClip);
};

/**
 * Get the transpositions from the media.
 * @param media The media.
 * @returns An array of transpositions.
 */
export const getMediaTranspositions = (media: Media[]) => {
  return media.filter(isTransposition);
};

/**
 * Sort the media by tick.
 * @param media The media to sort.
 * @returns The sorted media.
 */
export const sortMedia = (media: Media[]) => {
  return media.sort((a, b) => a.tick - b.tick);
};

/**
 * Get the valid media based on valid ticks and tracks.
 * @param media The media.
 * @param trackMap The track map.
 * @returns The valid media.
 */
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

/**
 * Get the media that is in the given tick range.
 * @param media The media.
 * @param startTick The start tick.
 * @param endTick The end tick.
 * @returns The valid media.
 */
export const getMediaInRange = (
  media: Media[],
  startTick: number,
  endTick: number,
  mediaDuration?: Tick[]
) => {
  return media.filter((item, i) => {
    // Get the duration of the media
    const duration = mediaDuration ? mediaDuration[i] : item.duration;
    if (duration === undefined) return false;

    // Make sure the item is in the range
    const itemStartTick = item.tick;
    const itemEndTick = itemStartTick + duration;
    return itemStartTick < endTick && itemEndTick > startTick;
  });
};

/**
 * Get the list of track IDs that fall in between the given media and the given track ID.
 * If the track ID is not provided, return the track IDs that have media.
 * @param media The media.
 * @param trackId The track ID.
 * @param trackIds The ordered track IDs.
 * @returns The list of track IDs.
 */
export const getMediaTrackIds = (
  media: Media[],
  trackIds: TrackId[],
  trackId?: TrackId
) => {
  // If the track ID is not provided, return the track IDs that have media
  if (!trackId) {
    return trackIds.filter((id) => media.some((clip) => clip.trackId === id));
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

/**
 * Get the earliest start tick of all media. If there is no media, return Infinity.
 * @param media The array of media.
 * @returns The start tick.
 */
export const getMediaStartTick = (media: Media[]) => {
  return media.reduce((acc, clip) => Math.min(acc, clip.tick), Infinity);
};

/**
 * Get the latest end tick of all media. If there is no media, return -Infinity.
 * @param media The array of media.
 * @param durations Optional. The durations of the media.
 * @returns The end tick.
 */
export const getMediaEndTick = (media: Media[], durations?: Tick[]) => {
  return media.reduce((acc, item, index) => {
    const duration = durations?.[index] ?? item.duration ?? 1;
    return Math.max(acc, item.tick + duration);
  }, -Infinity);
};

/**
 * Get the duration of all media. If there is no media, return 0.
 * @param media The array of media.
 * @param durations Optional. The durations of the media.
 * @returns The duration.
 */
export const getMediaDuration = (media: Media[], durations?: Tick[]) => {
  return getMediaEndTick(media, durations) - getMediaStartTick(media);
};

/**
 * Get the starting track index of the media using the list of ordered track IDs.
 * @param media The media.
 * @param trackIds The ordered track IDs.
 * @returns The start index or -1 if no match.
 */
export const getMediaStartIndex = (media: Media[], trackIds: TrackId[]) => {
  return trackIds.findIndex((id) => media.some((clip) => clip.trackId === id));
};

/**
 * Get the offset of the start tick of all media and the given tick.
 * @param media The array of media.
 * @param tick The tick.
 * @returns The offset.
 */
export const getMediaTickOffset = (media: Media[], tick: number) => {
  return tick - getMediaStartTick(media);
};

/**
 * Get the offset of the starting track index of the media and the index of the given track ID.
 * @param media The media.
 * @param trackId The track ID.
 * @param trackIds The ordered track IDs.
 * @returns The offset or -1 if no match.
 */
export const getMediaIndexOffset = (
  media: Media[],
  trackId: TrackId,
  trackIds: TrackId[]
) => {
  const startIndex = getMediaStartIndex(media, trackIds);
  const trackIndex = trackIds.indexOf(trackId);
  if (startIndex === -1 || trackIndex === -1) return -1;
  return trackIndex - startIndex;
};

/**
 * Get the offseted media based on the new starting tick and optional track ID.
 * @param media The media.
 * @param tick The starting tick.
 * @param trackId Optional. The starting track ID.
 * @param trackIds Optional. The ordered track IDs.
 * @returns The offseted media or an empty array if unsuccessful.
 */
export const getOffsetedMedia = (
  media: Media[],
  tick: number,
  trackId?: TrackId,
  trackIds?: TrackId[]
) => {
  // Iterate through the media and offset each item
  const offsetedMedia = media.map((item) => {
    const offsetedItem = { ...item };

    // Offset the tick
    const tickOffset = getMediaTickOffset(media, tick);
    offsetedItem.tick += tickOffset;

    // Offset the track ID if the track ID and track IDs are provided
    if (trackId && trackIds) {
      const offset = getMediaIndexOffset(media, trackId, trackIds);
      if (offset !== -1) {
        offsetedItem.trackId = trackIds[offset];
      }
    }

    // Return the offseted item
    return offsetedItem;
  });

  // Return the offseted media
  return offsetedMedia;
};

/**
 * Get the duplicated media starting after the end tick of the given media.
 * @param media The media.
 * @param durations The durations of the media.
 * @returns The duplicated media.
 */
export const getDuplicatedMedia = (
  media: Media[],
  durations: Tick[]
): Media[] => {
  const endTick = media.reduce((acc, item, index) => {
    return Math.max(acc, item.tick + durations[index]);
  }, 0);
  return getOffsetedMedia(media, endTick);
};

/**
 * Return true if the media overlaps with the given tick range.
 */
export const doesMediaOverlap = (
  media: Media,
  startTick: number,
  endTick: number,
  mediaDuration?: Tick
) => {
  // Get the duration of the media
  const duration = mediaDuration ?? media.duration;
  if (duration === undefined) return false;

  // Make sure the item is in the range
  const itemStartTick = media.tick;
  const itemEndTick = itemStartTick + duration;
  return itemStartTick < endTick && itemEndTick > startTick;
};
