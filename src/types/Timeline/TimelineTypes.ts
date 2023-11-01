import { Track, TrackId } from "types/Track";
import { Subdivision } from "utils/durations";
import {
  DEFAULT_MEDIA_CLIPBOARD,
  DEFAULT_MEDIA_DRAFT,
  DEFAULT_MEDIA_DRAG_STATE,
  DEFAULT_MEDIA_SELECTION,
  Media,
  MediaClipboard,
  MediaDraft,
  MediaDragState,
  MediaSelection,
  isMediaClipboard,
  isMediaDraft,
  isMediaDragState,
  isMediaSelection,
} from "types/Media";
import { isBoolean, isPlainObject, isString } from "lodash";

// ------------------------------------------------------------
// Timeline Generics
// ------------------------------------------------------------
export type TimelineObject = Track | Media;
export type TranspositionMode = "numerical" | "alphabetical";

// ------------------------------------------------------------
// Timeline Definitions
// ------------------------------------------------------------

/**  The `TimelineState` contains the current action of the user. */
export const TIMELINE_STATES = [
  "addingClips",
  "addingTranspositions",
  "slicingMedia",
  "mergingMedia",
  "idle",
] as const;
export type TimelineState = (typeof TIMELINE_STATES)[number];

/** The `TimelineCell` contains the dimensions of a timeline cell. */
export type TimelineCell = { width: number; height: number };

/** The `LiveTranspositionSettings` specify its hotkey mode and enabled status. */
export type LiveTranspositionSettings = {
  mode: TranspositionMode;
  enabled: boolean;
};

/** The `Timeline` contains information about the data grid and manages all tracked objects. */
export interface Timeline {
  state: TimelineState;
  subdivision: Subdivision;
  cell: TimelineCell;
  selectedTrackId?: TrackId;
  mediaSelection: MediaSelection;
  mediaDraft: MediaDraft;
  mediaClipboard: MediaClipboard;
  mediaDragState: MediaDragState;
  liveTranspositionSettings: LiveTranspositionSettings;
}

// ------------------------------------------------------------
// Timeline Defaults
// ------------------------------------------------------------

export const DEFAULT_CELL: TimelineCell = {
  width: 25,
  height: 120,
};

/** The default timeline is used for initialization. */
export const defaultTimeline: Timeline = {
  state: "idle",
  subdivision: "16n",
  cell: DEFAULT_CELL,
  selectedTrackId: undefined,
  mediaSelection: DEFAULT_MEDIA_SELECTION,
  mediaDraft: DEFAULT_MEDIA_DRAFT,
  mediaClipboard: DEFAULT_MEDIA_CLIPBOARD,
  mediaDragState: DEFAULT_MEDIA_DRAG_STATE,
  liveTranspositionSettings: {
    mode: "numerical",
    enabled: false,
  },
};

// ------------------------------------------------------------
// Timeline Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `TimelineState` */
export const isTimelineState = (obj: unknown): obj is TimelineState => {
  const candidate = obj as TimelineState;
  return isString(candidate) && TIMELINE_STATES.includes(candidate);
};

/** Checks if a given object is of type `TimelineCell` */
export const isTimelineCell = (obj: unknown): obj is TimelineCell => {
  const candidate = obj as TimelineCell;
  return (
    isPlainObject(candidate) &&
    isFinite(candidate.width) &&
    isFinite(candidate.height)
  );
};

/** Checks if a given object is of type `LiveTranspositionSettings` */
export const isLiveTranspositionSettings = (
  obj: unknown
): obj is LiveTranspositionSettings => {
  const candidate = obj as LiveTranspositionSettings;
  return (
    isPlainObject(candidate) &&
    (candidate.mode === "numerical" || candidate.mode === "alphabetical") &&
    isBoolean(candidate.enabled)
  );
};

/** Checks if a given object is of type `Timeline` */
export const isTimeline = (obj: unknown): obj is Timeline => {
  const candidate = obj as Timeline;
  return (
    isPlainObject(candidate) &&
    isTimelineState(candidate.state) &&
    isTimelineCell(candidate.cell) &&
    candidate?.subdivision !== undefined &&
    isMediaSelection(candidate.mediaSelection) &&
    isMediaDraft(candidate.mediaDraft) &&
    isMediaClipboard(candidate.mediaClipboard) &&
    isMediaDragState(candidate.mediaDragState) &&
    isLiveTranspositionSettings(candidate.liveTranspositionSettings)
  );
};
