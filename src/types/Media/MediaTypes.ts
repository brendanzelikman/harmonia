import { Payload } from "utils/redux";
import { Clip, ClipId } from "types/Clip/ClipTypes";
import { Portal, PortalId } from "types/Portal/PortalTypes";
import { Update } from "types/units";

// ------------------------------------------------------------
// Media Definitions
// ------------------------------------------------------------

/** A `MediaElement` refers to a clip or portal. */
export type MediaElement = Clip | Portal;
export type Media = MediaElement[];

/** A `MediaSelection` stores selected media. */
export type MediaSelection = {
  clipIds?: ClipId[];
  portalIds?: PortalId[];
};

/** A `MediaClipboard` stores media for copy/cut/paste. */
export type MediaClipboard = {
  clips?: Clip[];
  portals?: Portal[];
};

/** A `NewMediaPayload` contains IDs of clips and poses. */
export type NewMediaPayload = Payload<{
  clipIds?: ClipId[];
  portalIds?: PortalId[];
}>;

/** A `CreateMediaPayload` contains clips and/or portals. */
export type CreateMediaPayload = Payload<{
  clips?: Partial<Clip>[];
  portals?: Partial<Portal>[];
}>;

/** A `RemoveMediaPayload` contains IDs of clips and portals. */
export type RemoveMediaPayload = Payload<{
  clipIds?: ClipId[];
  portalIds?: PortalId[];
}>;

/** An `UpdateMediaPayload` contains updated clips and/or portals. */
export type UpdateMediaPayload = Payload<{
  clips?: Update<Clip>[];
  portals?: Update<Portal>[];
}>;

// ------------------------------------------------------------
// Media Defaults
// ------------------------------------------------------------

export const defaultMediaSelection: MediaSelection = {
  clipIds: [],
  portalIds: [],
};
export const defaultMediaClipboard: MediaClipboard = {
  clips: [],
  portals: [],
};
