import { isArray, isBoolean, isPlainObject, isString } from "lodash";
import { Clip, ClipId, ClipUpdate, isClip } from "types/Clip";
import {
  Transposition,
  TranspositionId,
  TranspositionUpdate,
  isTransposition,
} from "types/Transposition";

// ------------------------------------------------------------
// Media Definitions
// ------------------------------------------------------------

/** A `Media` refers to a clip or transposition. */
export type Media = Clip | Transposition;

/** A `MediaSelection` contains selected media. */
export type MediaSelection = {
  clipIds: ClipId[];
  transpositionIds: TranspositionId[];
};

/** A `MediaClipboard` contains copied media. */
export type MediaClipboard = {
  clips: Clip[];
  transpositions: Transposition[];
};

/** A `MediaDraft` contains partially drafted media. */
export type MediaDraft = {
  clip: Partial<Clip>;
  transposition: Partial<Transposition>;
};

/** A `MediaDragState` contains information about dragged media. */
export type MediaDragState = {
  draggingClip: boolean;
  draggingTransposition: boolean;
};

/** A `NewMediaPayload` contains IDs of clips and transpositions. */
export type NewMediaPayload = {
  clipIds: ClipId[];
  transpositionIds: TranspositionId[];
};

/** A `CreateMediaPayload` contains clips and/or transpositions. */
export type CreateMediaPayload = {
  clips?: Clip[];
  transpositions?: Transposition[];
};

/** A `RemoveMediaPayload` contains IDs of clips and transpositions. */
export type RemoveMediaPayload = NewMediaPayload;

/** An `UpdateMediaPayload` contains updated clips and/or transpositions. */
export type UpdateMediaPayload = {
  clips?: ClipUpdate[];
  transpositions?: TranspositionUpdate[];
};

// ------------------------------------------------------------
// Media Defaults
// ------------------------------------------------------------

export const DEFAULT_MEDIA_SELECTION: MediaSelection = {
  clipIds: [],
  transpositionIds: [],
};
export const DEFAULT_MEDIA_CLIPBOARD: MediaClipboard = {
  clips: [],
  transpositions: [],
};
export const DEFAULT_MEDIA_DRAFT: MediaDraft = {
  clip: {},
  transposition: {},
};
export const DEFAULT_MEDIA_DRAG_STATE: MediaDragState = {
  draggingClip: false,
  draggingTransposition: false,
};

// ------------------------------------------------------------
// Media Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `Media` */
export const isMedia = (obj: unknown): obj is Media => {
  return isClip(obj) || isTransposition(obj);
};

/** Checks if a given object is of type `MediaSelection` */
export const isMediaSelection = (obj: unknown): obj is MediaSelection => {
  const candidate = obj as MediaSelection;
  return (
    isPlainObject(candidate) &&
    isArray(candidate.clipIds) &&
    isArray(candidate.transpositionIds) &&
    candidate.clipIds.every(isString) &&
    candidate.transpositionIds.every(isString)
  );
};

/** Checks if a given object is of type `MediaClipboard` */
export const isMediaClipboard = (obj: unknown): obj is MediaClipboard => {
  const candidate = obj as MediaClipboard;
  return (
    isPlainObject(candidate) &&
    isArray(candidate.clips) &&
    isArray(candidate.transpositions) &&
    candidate.clips.every(isClip) &&
    candidate.transpositions.every(isTransposition)
  );
};

/** Checks if a given object is of type `MediaDraft` */
export const isMediaDraft = (obj: unknown): obj is MediaDraft => {
  const candidate = obj as MediaDraft;
  return (
    isPlainObject(candidate) &&
    isPlainObject(candidate.clip) &&
    isPlainObject(candidate.transposition)
  );
};

/** Checks if a given object is of type `MediaDragState` */
export const isMediaDragState = (obj: unknown): obj is MediaDragState => {
  const candidate = obj as MediaDragState;
  return (
    isPlainObject(candidate) &&
    isBoolean(candidate.draggingClip) &&
    isBoolean(candidate.draggingTransposition)
  );
};
