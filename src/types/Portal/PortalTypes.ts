import { EntityState } from "@reduxjs/toolkit";
import { isPlainObject, isString } from "lodash";
import { Clip, ClipId, ClipType, IClip, IClipId } from "types/Clip/ClipTypes";
import { TrackId } from "types/Track/TrackTypes";
import { Id } from "types/units";
import { createId } from "types/util";
import { isFiniteNumber } from "types/util";

// ------------------------------------------------------------
// Portal Generics
// ------------------------------------------------------------
export type PortalId = Id<"portal">;
export type PortalState = EntityState<Portal>;
export type PortalUpdate = Partial<Portal> & { id: PortalId };

// ------------------------------------------------------------
// Portal Definitions
// ------------------------------------------------------------

/** A portal allows media to travel from one track to another. */
export interface Portal {
  id: PortalId;
  trackId: TrackId;
  tick: number;
  portaledTrackId: TrackId;
  portaledTick: number;
}

/** A portaled clip has a chunked ID and a definite duration. */
export type Portaled<T extends Clip = Clip> = T & {
  id: PortaledClipId<T["id"]>;
  duration: number;
};
export type IPortaled<T extends ClipType = ClipType> = IClip<T> & {
  id: PortaledClipId<IClipId<T>>;
  duration: number;
};
export type PortaledClipMap = Record<ClipId, Portaled<Clip>>;

/** A portaled clip has a chunk appended to the ID */
export type PortaledClipId<T extends IClipId = ClipId> = `${T}-chunk-${number}`;
export type IPortaledClipId<T extends ClipType> = PortaledClipId<IClipId<T>>;

/** A portal fragment stores a track ID and tick. */
export type PortalFragment = { trackId: TrackId; tick: number };

// ------------------------------------------------------------
// Portal Initialization
// ------------------------------------------------------------

/** Create a portal with a unique ID. */
export const initializePortal = (portal: Partial<Portal>): Portal => ({
  tick: portal.tick ?? 0,
  portaledTick: portal.portaledTick ?? 0,
  trackId: portal.trackId ?? "pattern-track_1",
  portaledTrackId: portal.portaledTrackId ?? "pattern-track_2",
  id: createId("portal"),
});

/** Create a portal from two fragments. */
export const initializePortalFromFragments = (
  from: PortalFragment,
  to: PortalFragment
) =>
  initializePortal({
    trackId: from.trackId,
    tick: from.tick,
    portaledTrackId: to.trackId,
    portaledTick: to.tick,
  });

/** Create a portaled clip by appending a tag to the ID. */
export const initializePortaledClip = <T extends Clip>(
  media: Clip,
  chunkNumber: number
) => {
  return { ...media, id: `${media.id}-chunk-${chunkNumber}` } as Portaled<T>;
};

// ------------------------------------------------------------
// Portal Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Portal` */
export function isPortal(object: any): object is Portal {
  return (
    isPlainObject(object) &&
    isString(object.id) &&
    isFiniteNumber(object.tick) &&
    isString(object.trackId) &&
    isFiniteNumber(object.portaledTick) &&
    isString(object.portaledTrackId)
  );
}
