import { Clip, ClipId, isClip } from "types/Clip";
import {
  Transposition,
  TranspositionId,
  isTransposition,
} from "types/Transposition";

/**
 * A `Media` refers to a clip or transposition.
 */
export type Media = Clip | Transposition;

/**
 * A `MediaSelection` contains selected media.
 * @property `clipIds` - The IDs of the selected clips.
 * @property `transpositionIds` - The IDs of the selected transpositions.
 */
export type MediaSelection = {
  clipIds: ClipId[];
  transpositionIds: TranspositionId[];
};
export const DEFAULT_MEDIA_SELECTION: MediaSelection = {
  clipIds: [],
  transpositionIds: [],
};

/**
 * A `MediaClipboard` contains copied media.
 * @property `clips` - The clips copied to the clipboard.
 * @property `transpositions` - The transpositions copied to the clipboard.
 */
export type MediaClipboard = {
  clips: Clip[];
  transpositions: Transposition[];
};

export const DEFAULT_MEDIA_CLIPBOARD: MediaClipboard = {
  clips: [],
  transpositions: [],
};

/**
 * A `MediaDraft` contains partially drafted media.
 * @property `clip` - A partial clip with any properties.
 * @property `transposition` - A partial transposition with any properties.
 */
export type MediaDraft = {
  clip: Partial<Clip>;
  transposition: Partial<Transposition>;
};
export const DEFAULT_MEDIA_DRAFT: MediaDraft = {
  clip: {},
  transposition: {},
};

/**
 * A `MediaDragState` contains information about dragged media.
 * @property draggingClip - A boolean indicating if a clip is being dragged.
 * @property draggingTransposition - A boolean indicating if a transposition is being dragged.
 */
export type MediaDragState = {
  draggingClip: boolean;
  draggingTransposition: boolean;
};
export const DEFAULT_MEDIA_DRAG_STATE: MediaDragState = {
  draggingClip: false,
  draggingTransposition: false,
};

/**
 * A `MediaPayload` refers to a payload containing clips and/or transpositions.
 * @property clips - Optional. A list of clips.
 * @property transpositions - Optional. A list of transpositions.
 */
export type MediaPayload = {
  clips?: Clip[];
  transpositions?: Transposition[];
};

/**
 * A `PartialMediaPayload` refers to a payload containing partial clips and/or transpositions.
 * @property clips - Optional. A list of partial clips.
 * @property transpositions - Optional. A list of partial transpositions.
 */
export type PartialMediaPayload = {
  clips?: Partial<Clip>[];
  transpositions?: Partial<Transposition>[];
};

/**
 * A `MediaPromise` returns ID's of created media.
 */
export type MediaPromise = {
  clipIds: ClipId[];
  transpositionIds: TranspositionId[];
};

/**
 * Checks if a given object is of type `Media`.
 * @param obj The object to check.
 * @returns True if the object is a `Media`, otherwise false.
 */
export const isMedia = (obj: unknown): obj is Media => {
  const candidate = obj as Media;
  return candidate !== undefined && (isClip(obj) || isTransposition(obj));
};
