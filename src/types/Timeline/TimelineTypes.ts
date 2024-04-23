import { TrackId } from "types/Track";
import { Subdivision } from "utils/durations";
import {
  DEFAULT_MEDIA_CLIPBOARD,
  DEFAULT_MEDIA_DRAFT,
  DEFAULT_MEDIA_DRAG_STATE,
  DEFAULT_MEDIA_SELECTION,
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
// Timeline Definitions
// ------------------------------------------------------------

/**  The `TimelineState` describes any interaction with the arrangement. */
export const TIMELINE_STATES = [
  "addingPatternClips",
  "addingPoseClips",
  "slicingClips",
  "portalingClips",
  "mergingClips",
  "idle",
] as const;
export type TimelineState = (typeof TIMELINE_STATES)[number];

/** The `TimelineCell` contains the dimensions of a timeline cell. */
export type TimelineCell = { width: number; height: number };

/** The selected clip type determines the visible interface. */
export type SelectedClipType = "pattern" | "pose";

/** The `LivePlay` interface specify its hotkey mode and enabled status. */
export type LivePlay = {
  mode: PoseMode;
  enabled: boolean;
};
export type PoseMode = "numerical" | "alphabetical";

/** The user can toggle their diary from the timeline. */

/** The `Timeline` contains information about the data grid and manages all tracked objects. */
export interface Timeline {
  state: TimelineState;

  subdivision: Subdivision;
  cell: TimelineCell;

  selectedTrackId?: TrackId;
  selectedClipType: SelectedClipType;

  mediaSelection: MediaSelection;
  mediaDraft: MediaDraft;
  mediaClipboard: MediaClipboard;
  mediaDragState: MediaDragState;

  livePlay: LivePlay;

  showingTooltips?: boolean;
  showingDiary?: boolean;
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
  selectedClipType: "pattern",
  mediaSelection: DEFAULT_MEDIA_SELECTION,
  mediaDraft: DEFAULT_MEDIA_DRAFT,
  mediaClipboard: DEFAULT_MEDIA_CLIPBOARD,
  mediaDragState: DEFAULT_MEDIA_DRAG_STATE,
  livePlay: {
    mode: "numerical",
    enabled: false,
  },
  showingDiary: false,
  showingTooltips: true,
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

/** Checks if a given object is of type `LivePlay` */
export const isLivePlay = (obj: unknown): obj is LivePlay => {
  const candidate = obj as LivePlay;
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
    isLivePlay(candidate.livePlay)
  );
};
