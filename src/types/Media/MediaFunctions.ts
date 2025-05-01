import { Media, MediaElement } from "./MediaTypes";
import { Tick, Timed } from "types/units";
import { inRange, isUndefined, minBy } from "lodash";
import { Clip } from "types/Clip/ClipTypes";
import { applyPortalsToClips } from "types/Portal/PortalFunctions";
import { isPortal } from "types/Portal/PortalTypes";
import { TrackMap, TrackId } from "types/Track/TrackTypes";
import { isFinite } from "utils/math";
import { Thunk } from "types/Project/ProjectTypes";
import { selectClipDurationMap } from "types/Clip/ClipSelectors";
import { selectSubdivisionTicks } from "types/Timeline/TimelineSelectors";

/** Get the clips from the media. */
export const getClipsFromMedia = (media: Media) => {
  return media.filter((item) => "patternId" in item || "poseId" in item);
};

/** Get the portals from the media. */
export const getPortalsFromMedia = (media: Media) => {
  return media.filter((item) => "portaledTrackId" in item);
};

/** Sort the media clips by tick. */
export const sortMediaByTick = (media: Media) => {
  return media.sort((a, b) => a.tick - b.tick);
};

/** Get the valid media clips based on valid ticks and tracks. */
export const getValidMedia = (media: Media, trackMap: TrackMap): Media => {
  return media.filter(
    (item) => item.tick >= 0 && trackMap[item.trackId] !== undefined
  );
};

/** Get the duration of a media element and try to use the provided value. */
export const getMediaElementDuration = (
  element: MediaElement,
  value?: Tick
) => {
  if (!isUndefined(value)) return value || 1;
  if (isPortal(element)) return 1;
  return element?.duration ?? 1;
};

/** Get the earliest start tick of all media. If there is no media, return Infinity. */
export const getMediaStartTick = (media: Media) => {
  return minBy(media, "tick")?.tick ?? Infinity;
};

/** Get the latest end tick of all media. If there is no media, return -Infinity. */
export const getMediaEndTick =
  (media: MediaElement[]): Thunk<number> =>
  (_, getProject) => {
    const project = getProject();
    const durationMap = selectClipDurationMap(project) as Record<
      string,
      number
    >;
    const subdivisionTicks = selectSubdivisionTicks(project);

    // Get the portals and their indices
    const portals = getPortalsFromMedia(media);

    // Get all clips and their durations
    const clips = getClipsFromMedia(media) as Timed<Clip>[];

    // Apply the clips through the portals first
    const portaledClips = applyPortalsToClips(clips, portals);
    const processedMedia = media.map(
      (item) => portaledClips.find((clip) => clip.id === item.id) ?? item
    );

    // Get the end tick of the processed media
    return processedMedia.reduce((acc, item) => {
      const duration =
        durationMap[item.id] ?? ("duration" in item ? item.duration : Infinity);
      return Math.max(
        acc,
        item.tick + (isFinite(duration) ? duration : subdivisionTicks)
      );
    }, -Infinity);
  };

/** Get the media that starts in the given tick range. */
export const getMediaInRange = (
  media: Timed<MediaElement>[],
  [startTick, endTick]: number[]
): Media => {
  return media.filter((item, i) => {
    // Get the duration of the media
    const duration = getMediaElementDuration(item, media[i].duration);
    if (!isFinite(duration)) {
      return inRange(item.tick, startTick, endTick);
    }

    // Make sure the item is in the range
    const itemStartTick = item.tick;
    const itemEndTick = itemStartTick + (duration ?? 1);
    return itemStartTick < endTick && itemEndTick > startTick;
  });
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

  return trackIds.slice(
    Math.min(startIndex, endIndex),
    Math.max(startIndex, endIndex) + 1
  );
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
): MediaElement[] => {
  // Get the track offset
  const shouldOffsetTracks = !!trackId && trackIds;
  const trackOffset = shouldOffsetTracks
    ? getMediaIndexOffset(media, trackId, trackIds)
    : 0;

  // Iterate through the media and offset each item
  const offsetedMedia = media.map((item) => {
    const element = { ...item };

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
