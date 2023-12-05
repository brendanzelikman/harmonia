import { nanoid } from "@reduxjs/toolkit";
import { isPlainObject, isString } from "lodash";
import { Clip, ClipId } from "types/Clip";
import { TrackId } from "types/Track";
import { isFiniteNumber } from "types/util";
import { NormalState, createNormalState } from "utils/normalizedState";

// ------------------------------------------------------------
// Portal Generics
// ------------------------------------------------------------
export type PortalId = string;
export type PortalNoId = Omit<Portal, "id">;
export type PortalMap = Record<PortalId, Portal>;
export type PortalState = NormalState<PortalMap>;
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
  id: PortaledClipId;
  duration: number;
};
export type PortaledClipMap = Record<ClipId, Portaled<Clip>>;

/** A portaled clip has a chunk appended to the ID */
export type PortaledClipId = `${ClipId}-chunk-${number}`;

/** A portal fragment stores a track ID and tick. */
export type PortalFragment = { trackId: TrackId; tick: number };

// ------------------------------------------------------------
// Portal Initialization
// ------------------------------------------------------------

/** Create a portal with a unique ID. */
export const initializePortal = (portal?: Partial<Portal>): Portal => ({
  id: nanoid(),
  trackId: portal?.trackId ?? "",
  tick: portal?.tick ?? 0,
  portaledTrackId: portal?.portaledTrackId ?? "",
  portaledTick: portal?.portaledTick ?? 0,
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

/** The default portal state is used for Redux. */
export const defaultPortalState = createNormalState<PortalMap>([]);

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
