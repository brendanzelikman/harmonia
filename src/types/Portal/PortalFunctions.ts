import {
  Portal,
  PortalUpdate,
  Portaled,
  PortaledClipId,
  initializePortaledClip,
} from "./PortalTypes";
import { Clip, ClipId, isClip } from "types/Clip";
import { Tick } from "types/units";

/** Get a `Portal` as a string. */
export const getPortalAsString = (portal: Portal) => {
  const { id, trackId, tick, portaledTrackId, portaledTick } = portal;
  return `${id}:${trackId}:${tick}:${portaledTrackId}:${portaledTick}`;
};

/** Get a `PortalUpdate` as a string. */
export const getPortalUpdateAsString = (update: PortalUpdate) => {
  return JSON.stringify(update);
};

/** Get the original media ID from a portaled media chunk. */
export const getOriginalIdFromPortaledClip = (clipId: PortaledClipId) =>
  clipId.split("-chunk-")[0] as ClipId;

/** Get a list of each clip's portaled chunks based on the given clips and portals. */
export function applyPortalsToClips<T extends Clip>(
  clips: T[],
  portals: Portal[],
  durations: Tick[]
) {
  return clips.map((clip, i) => {
    const duration = durations[i];
    if (duration < 0 || duration === Infinity) return [{ ...clip, duration }];

    // Start with the media bounds
    const startTick = clip.tick;
    const endTick = clip.tick + duration;

    // Initialize the chunks
    const portaledClips: Portaled<T>[] = [];
    let tick = 0;
    let chunkLength = 0;
    let fragment = { trackId: clip.trackId, tick: clip.tick };

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
      let chunk = initializePortaledClip<T>(
        { ...clip, ...fragment, duration: chunkLength },
        portaledClips.length + 1
      );

      // If the item is a clip, then increment its offset
      if (portaledClips.length > 0)
        chunk.offset = (chunk.offset ?? 0) + tick - chunkLength;

      // Update the fragment
      fragment = { trackId: portal.portaledTrackId, tick: portal.portaledTick };

      // Push the chunk
      portaledClips.push(chunk);
      chunkLength = 1;
      tick++;
    }

    // Push the final chunk
    let finalChunk = initializePortaledClip<T>(
      { ...clip, ...fragment, duration: chunkLength },
      portaledClips.length + 1
    );
    if (portaledClips.length > 0) {
      finalChunk.offset = (finalChunk.offset ?? 0) + tick - chunkLength;
    }
    portaledClips.push(finalChunk);

    // Return the chunks
    return portaledClips;
  }) as Portaled<T>[][];
}

/** Process the clip through the given portals. */
export const applyPortalsToClip = <T extends Clip>(
  clip: T,
  portals: Portal[],
  duration: Tick
) => {
  return applyPortalsToClips([clip], portals, [duration])[0];
};
