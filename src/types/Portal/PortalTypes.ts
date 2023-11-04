import { nanoid } from "@reduxjs/toolkit";
import { chunk, isPlainObject, isString } from "lodash";
import { MediaClip } from "types/Media";
import { TrackId } from "types/Track";
import { isFiniteNumber } from "types/util";
import { NormalState, createNormalState } from "utils/normalizedState";

// ------------------------------------------------------------
// Portal Generics
// ------------------------------------------------------------
export type PortalId = string;
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

/** A portal chunk extends media to give it a definite duration. */
export type PortaledMedia = MediaClip & { duration: number };

/** A portal fragment stores a track ID and tick. */
export type PortalFragment = { trackId: TrackId; tick: number };

// ------------------------------------------------------------
// Portal Initialization
// ------------------------------------------------------------

export const initializePortal = (portal?: Partial<Portal>): Portal => ({
  id: nanoid(),
  trackId: portal?.trackId ?? "",
  tick: portal?.tick ?? 0,
  portaledTrackId: portal?.portaledTrackId ?? "",
  portaledTick: portal?.portaledTick ?? 0,
});

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
