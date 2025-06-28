import { ClipId, Clip } from "types/Clip/ClipTypes";
import {
  Portal,
  Portaled,
  PortaledClipId,
  initializePortaledClip,
} from "./PortalTypes";
import { Timed } from "types/units";

/** Get the original media ID from a portaled media chunk. */
export const getOriginalIdFromPortaledClip = (
  clipId: PortaledClipId | ClipId
) =>
  (clipId.includes("-chunk-") ? clipId.split("-chunk-")[0] : clipId) as ClipId;

/** Get a list of each clip's portaled chunks based on the given clips and portals. */
export function applyPortalsToClips(clips: Timed<Clip>[], portals: Portal[]) {
  if (!portals.length) {
    return clips.map((clip) =>
      initializePortaledClip({ ...clip, duration: clip.duration || 0 }, 1)
    );
  }
  const processedClips: Portaled<Clip>[] = [];

  clips.forEach((clip) => {
    if (clip.duration === Infinity || clip.duration === undefined) {
      processedClips.push({
        ...clip,
        id: clip.id,
        duration: clip.duration || 0,
      } as Portaled<Clip>);
      return;
    }

    // Start with the media bounds
    const startTick = clip.tick;
    const endTick = clip.tick + clip.duration;
    // const usedPortalIds = new Set<string>();

    // Initialize the chunks
    const portaledClips: Portaled<Clip>[] = [];
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
        // && !usedPortalIds.has(portal.id)
      );

      // If no portal exists, then continue
      if (!portal) {
        chunkLength++;
        tick++;
        continue;
      }

      // Otherwise, get the new chunk and update the fragment
      let chunk = initializePortaledClip(
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
      // usedPortalIds.add(portal.id);
    }

    // Push the final chunk
    let finalChunk = initializePortaledClip(
      { ...clip, ...fragment, duration: chunkLength },
      portaledClips.length + 1
    );
    if (portaledClips.length > 0) {
      finalChunk.offset = (finalChunk.offset ?? 0) + tick - chunkLength;
    }
    portaledClips.push(finalChunk);

    // Return the chunks
    processedClips.push(...portaledClips);
  });

  return processedClips;
}

/** Process the clip through the given portals. */
export const applyPortalsToClip = (clip: Timed<Clip>, portals: Portal[]) => {
  return applyPortalsToClips([clip], portals).filter((c) =>
    c.id.startsWith(clip.id)
  );
};
