import { useRecordState } from "hooks/useRecordState";
import { Payload } from "lib/redux";
import { isPlainObject, isString } from "lodash";
import { Clip, ClipId, isClipInterface } from "types/Clip/ClipTypes";
import { Portal, PortalId, isPortal } from "types/Portal/PortalTypes";
import { Update } from "types/units";
import { isOptionalTypedArray } from "types/util";

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

/** A `MediaDraft` stores new media for arrangement. */
export type MediaDraft = {
  portal?: Partial<Portal>;
};

/** A `MediaDragState` stores information about dragged media. */
export type MediaDragState = {
  draggingPatternClip?: boolean;
  draggingPoseClip?: boolean;
  draggingPortal?: boolean;
};
export const useDragState = () => useRecordState(defaultMediaDragState);
export type setDragState = ReturnType<typeof useDragState>["set"];

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
export const defaultMediaDraft: MediaDraft = {
  portal: {},
};
export const defaultMediaDragState: MediaDragState = {
  draggingPatternClip: false,
  draggingPoseClip: false,
  draggingPortal: false,
};

// ------------------------------------------------------------
// Media Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Media` */
export const isMedia = (obj: unknown): obj is Media => {
  return isClipInterface(obj) || isPortal(obj);
};

/** Checks if a given object is of type `MediaSelection` */
export const isMediaSelection = (obj: unknown): obj is MediaSelection => {
  const candidate = obj as MediaSelection;
  return (
    isPlainObject(candidate) &&
    isOptionalTypedArray(candidate.clipIds, isString) &&
    isOptionalTypedArray(candidate.portalIds, isString)
  );
};

/** Checks if a given object is of type `MediaClipboard` */
export const isMediaClipboard = (obj: unknown): obj is MediaClipboard => {
  const candidate = obj as MediaClipboard;
  return (
    isPlainObject(candidate) &&
    isOptionalTypedArray(candidate.clips, isClipInterface) &&
    isOptionalTypedArray(candidate.portals, isPortal)
  );
};
