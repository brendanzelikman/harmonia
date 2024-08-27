import { Subdivision } from "utils/durations";
import { isNull, isNumber, isPlainObject, isString } from "lodash";
import { ClipType } from "types/Clip/ClipTypes";
import { isOptionalType } from "types/util";
import { TrackId } from "types/Track/TrackTypes";
import {
  MediaSelection,
  MediaDraft,
  MediaClipboard,
  MediaDragState,
  defaultMediaSelection,
  defaultMediaDraft,
  defaultMediaClipboard,
  defaultMediaDragState,
  isMediaSelection,
  isMediaDraft,
  isMediaClipboard,
  isMediaDragState,
} from "types/Media/MediaTypes";

// ------------------------------------------------------------
// Timeline Definitions
// ------------------------------------------------------------

/** The `Timeline` contains information about the data grid and manages all tracked objects. */
export type Timeline = Partial<{
  // Action info
  state: TimelineState;
  selectedTrackId: TrackId;
  selectedClipType: ClipType;

  // Media info
  mediaSelection: MediaSelection;
  mediaDraft: MediaDraft;
  mediaClipboard: MediaClipboard;

  // Grid info
  subdivision: Subdivision;
  cellWidth: number;
  cellHeight: number;

  // Render info
  showingTooltips: boolean;
  performanceMode: boolean;

  showingDiary: boolean;
  mediaDragState: MediaDragState;
}>;

/**  The `TimelineState` describes any interaction with the arrangement. */
export const TIMELINE_STATES = [
  "adding-pattern-clips",
  "adding-pose-clips",
  "adding-scale-clips",
  "slicing-clips",
  "portaling-clips",
  "merging-clips",
  "idle",
] as const;
export type TimelineState = (typeof TIMELINE_STATES)[number];

// ------------------------------------------------------------
// Timeline Defaults
// ------------------------------------------------------------

export const DEFAULT_CELL_WIDTH = 25;
export const DEFAULT_CELL_HEIGHT = 120;

/** The default timeline is used for initialization. */
export const defaultTimeline: Timeline = {
  state: "idle",
  selectedClipType: "pattern",

  mediaSelection: defaultMediaSelection,
  mediaDraft: defaultMediaDraft,
  mediaClipboard: defaultMediaClipboard,
  mediaDragState: defaultMediaDragState,

  subdivision: "16n",
  cellWidth: DEFAULT_CELL_WIDTH,
  cellHeight: DEFAULT_CELL_HEIGHT,

  showingTooltips: true,
  showingDiary: false,
  performanceMode: false,
};

// ------------------------------------------------------------
// Timeline Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `TimelineState` */
export const isTimelineState = (obj: unknown): obj is TimelineState => {
  const candidate = obj as TimelineState;
  return isString(candidate) && TIMELINE_STATES.includes(candidate);
};

/** Checks if a given object is of type `Timeline` */
export const isTimeline = (obj: unknown): obj is Timeline => {
  const candidate = obj as Timeline;
  return (
    isPlainObject(candidate) &&
    isOptionalType(candidate.state, isTimelineState) &&
    (isOptionalType(candidate.selectedTrackId, isString) ||
      isOptionalType(candidate.selectedTrackId, isNull)) &&
    isOptionalType(candidate.selectedClipType, isString) &&
    isOptionalType(candidate.cellWidth, isNumber) &&
    isOptionalType(candidate.cellHeight, isNumber) &&
    isOptionalType(candidate.mediaSelection, isMediaSelection) &&
    isOptionalType(candidate.mediaDraft, isMediaDraft) &&
    isOptionalType(candidate.mediaClipboard, isMediaClipboard) &&
    isOptionalType(candidate.mediaDragState, isMediaDragState)
  );
};
