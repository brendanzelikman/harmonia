import { isArray, isBoolean, isPlainObject, isString } from "lodash";
import { Clip, ClipId, ClipUpdate, isClip } from "types/Clip";
import { Portal, PortalId, PortalUpdate, isPortal } from "types/Portal";
import { Pose, PoseId, PoseUpdate, isPose } from "types/Pose";
import { isTypedArray } from "types/util";

// ------------------------------------------------------------
// Media Definitions
// ------------------------------------------------------------

/** `MediaClip` refers to a clip or pose. */
export type MediaClip = Clip | Pose;
export type MediaClips = MediaClip[];

/** A `MediaElement` refers to a clip, pose, or portal. */
export type MediaElement = MediaClip | Portal;
export type Media = MediaElement[];

/** A `MediaSelection` contains selected media. */
export type MediaSelection = {
  clipIds: ClipId[];
  poseIds: PoseId[];
  portalIds: PortalId[];
};

/** A `MediaClipboard` contains copied media. */
export type MediaClipboard = {
  clips: Clip[];
  poses: Pose[];
  portals: Portal[];
};

/** A `MediaDraft` contains partially drafted media. */
export type MediaDraft = {
  clip: Partial<Clip>;
  pose: Partial<Pose>;
  portal: Partial<Portal>;
};

/** A `MediaDragState` contains information about dragged media. */
export type MediaDragState = {
  draggingClip: boolean;
  draggingPose: boolean;
  draggingPortal: boolean;
};

/** A `NewMediaPayload` contains IDs of clips and poses. */
export type NewMediaPayload = {
  clipIds: ClipId[];
  poseIds: PoseId[];
  portalIds: PortalId[];
};

/** A `CreateMediaPayload` contains clips and/or poses. */
export type CreateMediaPayload = {
  clips?: Clip[];
  poses?: Pose[];
  portals?: Portal[];
};

/** A `RemoveMediaPayload` contains IDs of clips and poses. */
export type RemoveMediaPayload = NewMediaPayload;

/** An `UpdateMediaPayload` contains updated clips and/or poses. */
export type UpdateMediaPayload = {
  clips?: ClipUpdate[];
  poses?: PoseUpdate[];
  portals?: PortalUpdate[];
};

// ------------------------------------------------------------
// Media Defaults
// ------------------------------------------------------------

export const DEFAULT_MEDIA_SELECTION: MediaSelection = {
  clipIds: [],
  poseIds: [],
  portalIds: [],
};
export const DEFAULT_MEDIA_CLIPBOARD: MediaClipboard = {
  clips: [],
  poses: [],
  portals: [],
};
export const DEFAULT_MEDIA_DRAFT: MediaDraft = {
  clip: {},
  pose: {},
  portal: {},
};
export const DEFAULT_MEDIA_DRAG_STATE: MediaDragState = {
  draggingClip: false,
  draggingPose: false,
  draggingPortal: false,
};

// ------------------------------------------------------------
// Media Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `MediaClip` */
export const isMediaClip = (obj: unknown): obj is MediaClip => {
  return isClip(obj) || isPose(obj);
};

/** Checks if a given object is of type `Media` */
export const isMedia = (obj: unknown): obj is Media => {
  return isMediaClip(obj) || isPortal(obj);
};

/** Checks if a given object is of type `MediaSelection` */
export const isMediaSelection = (obj: unknown): obj is MediaSelection => {
  const candidate = obj as MediaSelection;
  return (
    isPlainObject(candidate) &&
    isTypedArray(candidate.clipIds, isString) &&
    isTypedArray(candidate.poseIds, isString) &&
    isTypedArray(candidate.portalIds, isString)
  );
};

/** Checks if a given object is of type `MediaClipboard` */
export const isMediaClipboard = (obj: unknown): obj is MediaClipboard => {
  const candidate = obj as MediaClipboard;
  return (
    isPlainObject(candidate) &&
    isTypedArray(candidate.clips, isClip) &&
    isTypedArray(candidate.poses, isPose) &&
    isTypedArray(candidate.portals, isPortal)
  );
};

/** Checks if a given object is of type `MediaDraft` */
export const isMediaDraft = (obj: unknown): obj is MediaDraft => {
  const candidate = obj as MediaDraft;
  return (
    isPlainObject(candidate) &&
    isPlainObject(candidate.clip) &&
    isPlainObject(candidate.pose) &&
    isPlainObject(candidate.portal)
  );
};

/** Checks if a given object is of type `MediaDragState` */
export const isMediaDragState = (obj: unknown): obj is MediaDragState => {
  const candidate = obj as MediaDragState;
  return (
    isPlainObject(candidate) &&
    isBoolean(candidate.draggingClip) &&
    isBoolean(candidate.draggingPose) &&
    isBoolean(candidate.draggingPortal)
  );
};
