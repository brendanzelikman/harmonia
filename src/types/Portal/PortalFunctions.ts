import { Portal, PortalUpdate, PortaledMedia } from "./PortalTypes";
import { isArray } from "lodash";
import { getClipsFromMedia, getPosesFromMedia, MediaClip } from "types/Media";
import { Clip, isClip } from "types/Clip";
import { Pose } from "types/Pose";
import { isFiniteNumber } from "types/util";

/** Get a `Portal` as a string. */
export const getPortalAsString = (portal: Portal) => {
  const { id, trackId, tick, portaledTrackId, portaledTick } = portal;
  return `${id}:${trackId}:${tick}:${portaledTrackId}:${portaledTick}`;
};

/** Get a `PortalUpdate` as a string. */
export const getPortalUpdateAsString = (update: PortalUpdate) => {
  return JSON.stringify(update);
};

/** Create a portal chunk by appending a tag to the ID. */
export const createPortalChunk = (
  media: PortaledMedia,
  chunkNumber: number
): PortaledMedia => {
  return { ...media, id: `${media.id}-chunk-${chunkNumber}` };
};

/** Get the original media ID from a portaled media chunk. */
export const parsePortalChunkId = (mediaId: string): string =>
  mediaId.split("-chunk-")[0];

/** Get the portaled chunks of media based on the given media and portals. */

// Overload #1: Accept a single piece of media and return an array of portaled media
export function applyPortalsToMedia(
  media: MediaClip,
  portals: Portal[],
  duration: number
): PortaledMedia[];

// Overload #2: Accept an array of media and return an array of portaled media arrays
export function applyPortalsToMedia(
  media: MediaClip[],
  portals: Portal[],
  durations: number[]
): PortaledMedia[][];

// Implementation
export function applyPortalsToMedia<T extends MediaClip | MediaClip[]>(
  media: T,
  portals: Portal[],
  duration: number | number[]
): PortaledMedia[] | PortaledMedia[][] {
  // Get the media and duration arrays
  const isMediaArray = isArray(media);
  const mediaArray = isMediaArray ? media : [media];
  const isDurationArray = isArray(duration);
  const durationArray = isDurationArray ? duration : [duration];

  // Iterate through each media
  const portaledMediaArray = mediaArray.map((media, i) => {
    const duration = durationArray[i];
    if (duration < 0 || duration === Infinity) return [];
    // Start with the media bounds
    const startTick = media.tick;
    const endTick = media.tick + duration;

    const chunks: PortaledMedia[] = [];
    let tick = 0;
    let chunkLength = 0;
    let fragment = { trackId: media.trackId, tick: media.tick };

    // Iterate through each tick
    for (let i = startTick; i < endTick; i++) {
      // Find a current portal if any exists
      const portal = portals.find(
        (portal) =>
          portal.trackId === fragment.trackId &&
          portal.tick === fragment.tick + chunkLength
      );

      // If no portal exists, then continue
      if (!portal) {
        chunkLength++;
        tick++;
        continue;
      }

      // Otherwise, get the new chunk and update the fragment
      let chunk = createPortalChunk(
        { ...media, ...fragment, duration: chunkLength },
        chunks.length + 1
      );

      // If the item is a clip, then increment its offset
      if (isClip(chunk) && chunks.length > 0)
        chunk.offset += tick - chunkLength;

      // Update the fragment
      fragment = { trackId: portal.portaledTrackId, tick: portal.portaledTick };

      // Push the chunk
      chunks.push(chunk);
      chunkLength = 1;
      tick++;
    }

    // Push the final chunk
    let finalChunk = createPortalChunk(
      { ...media, ...fragment, duration: chunkLength },
      chunks.length + 1
    );
    if (isClip(finalChunk) && chunks.length > 0) {
      finalChunk.offset += tick - chunkLength;
    }
    chunks.push(finalChunk);

    // Return the chunks
    return chunks;
  });

  // Return the corresponding media
  return isMediaArray ? portaledMediaArray : portaledMediaArray.flat();
}

/** Process the clip through the given portals. */
export const applyPortalsToClip = (
  clip: Clip,
  portals: Portal[],
  duration: number
): Clip[] => {
  const portaledMedia = applyPortalsToMedia(clip, portals, duration);
  return getClipsFromMedia(portaledMedia);
};

/** Process the pose through the given portals if it has an explicit duration. */
export const applyPortalsToPose = (pose: Pose, portals: Portal[]): Pose[] => {
  const duration = pose.duration;
  if (!isFiniteNumber(duration) || !duration) return [pose];
  const portaledMedia = applyPortalsToMedia(pose, portals, duration);
  return getPosesFromMedia(portaledMedia);
};

/** Process the clips through the given portals. */
export const applyPortalsToClips = (
  clips: Clip[],
  portals: Portal[],
  durations: number[]
): Clip[] => {
  const portaledMedia = applyPortalsToMedia(clips, portals, durations);
  return portaledMedia.map(getClipsFromMedia).flat();
};

/** Process the poses through the given portals. */
export const applyPortalsToPoses = (
  poses: Pose[],
  portals: Portal[]
): Pose[] => {
  // Filter poses into finite and infinite
  const finitePoses: Pose[] = [];
  const infinitePoses: Pose[] = [];
  poses.forEach((pose) => {
    if (isFiniteNumber(pose.duration) && pose.duration) {
      finitePoses.push(pose);
    } else {
      infinitePoses.push(pose);
    }
  });

  // Apply portals to finite poses
  const portaledMedia = finitePoses.map((t) => applyPortalsToPose(t, portals));

  // Return the poses
  return [...infinitePoses, ...portaledMedia.map(getPosesFromMedia).flat()];
};
