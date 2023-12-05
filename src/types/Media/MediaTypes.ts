import { isBoolean, isPlainObject, isString } from "lodash";
import {
  PatternClip,
  ClipUpdate,
  isClip,
  PoseClip,
  PatternClipId,
  PoseClipId,
  Clip,
  ClipId,
} from "types/Clip";
import { Portal, PortalId, PortalUpdate, isPortal } from "types/Portal";
import { isTypedArray } from "types/util";

// ------------------------------------------------------------
// Media Definitions
// ------------------------------------------------------------

/** A `MediaElement` refers to a clip or portal. */
export type MediaElement = Clip | Portal;
export type Media = MediaElement[];

/** A `MediaSelection` contains selected media. */
export type MediaSelection = {
  patternClipIds: PatternClipId[];
  poseClipIds: PoseClipId[];
  portalIds: PortalId[];
};

/** A `MediaClipboard` contains copied media. */
export type MediaClipboard = {
  clips: Clip[];
  portals: Portal[];
};

/** A `MediaDraft` contains partially drafted media. */
export type MediaDraft = {
  patternClip: Partial<PatternClip>;
  poseClip: Partial<PoseClip>;
  portal: Partial<Portal>;
};

/** A `MediaDragState` contains information about dragged media. */
export type MediaDragState = {
  draggingPatternClip: boolean;
  draggingPoseClip: boolean;
  draggingPortal: boolean;
};

/** A `NewMediaPayload` contains IDs of clips and poses. */
export type NewMediaPayload = {
  clipIds?: ClipId[];
  portalIds?: PortalId[];
};

/** A `CreateMediaPayload` contains clips and/or portals. */
export type CreateMediaPayload = {
  clips?: Clip[];
  portals?: Portal[];
};

/** A `RemoveMediaPayload` contains IDs of clips and portals. */
export type RemoveMediaPayload = NewMediaPayload;

/** An `UpdateMediaPayload` contains updated clips and/or portals. */
export type UpdateMediaPayload = {
  clips?: ClipUpdate[];
  portals?: PortalUpdate[];
};

// ------------------------------------------------------------
// Media Defaults
// ------------------------------------------------------------

export const DEFAULT_MEDIA_SELECTION: MediaSelection = {
  patternClipIds: [],
  poseClipIds: [],
  portalIds: [],
};
export const DEFAULT_MEDIA_CLIPBOARD: MediaClipboard = {
  clips: [],
  portals: [],
};
export const DEFAULT_MEDIA_DRAFT: MediaDraft = {
  patternClip: {},
  poseClip: {},
  portal: {},
};
export const DEFAULT_MEDIA_DRAG_STATE: MediaDragState = {
  draggingPatternClip: false,
  draggingPoseClip: false,
  draggingPortal: false,
};

// ------------------------------------------------------------
// Media Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Media` */
export const isMedia = (obj: unknown): obj is Media => {
  return isClip(obj) || isPortal(obj);
};

/** Checks if a given object is of type `MediaSelection` */
export const isMediaSelection = (obj: unknown): obj is MediaSelection => {
  const candidate = obj as MediaSelection;
  return (
    isPlainObject(candidate) &&
    isTypedArray(candidate.patternClipIds, isString) &&
    isTypedArray(candidate.poseClipIds, isString) &&
    isTypedArray(candidate.portalIds, isString)
  );
};

/** Checks if a given object is of type `MediaClipboard` */
export const isMediaClipboard = (obj: unknown): obj is MediaClipboard => {
  const candidate = obj as MediaClipboard;
  return (
    isPlainObject(candidate) &&
    isTypedArray(candidate.clips, isClip) &&
    isTypedArray(candidate.portals, isPortal)
  );
};

/** Checks if a given object is of type `MediaDraft` */
export const isMediaDraft = (obj: unknown): obj is MediaDraft => {
  const candidate = obj as MediaDraft;
  return (
    isPlainObject(candidate) &&
    isPlainObject(candidate.patternClip) &&
    isPlainObject(candidate.poseClip) &&
    isPlainObject(candidate.portal)
  );
};

/** Checks if a given object is of type `MediaDragState` */
export const isMediaDragState = (obj: unknown): obj is MediaDragState => {
  const candidate = obj as MediaDragState;
  return (
    isPlainObject(candidate) &&
    isBoolean(candidate.draggingPatternClip) &&
    isBoolean(candidate.draggingPoseClip) &&
    isBoolean(candidate.draggingPortal)
  );
};
