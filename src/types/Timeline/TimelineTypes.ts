import { Subdivision } from "utils/durations";
import { isNumber, isPlainObject, isString } from "lodash";
import { ClipType } from "types/Clip/ClipTypes";
import { isOptionalType } from "types/util";
import { TrackId } from "types/Track/TrackTypes";
import {
  MediaSelection,
  MediaDraft,
  MediaClipboard,
  defaultMediaSelection,
  defaultMediaDraft,
  defaultMediaClipboard,
  isMediaSelection,
  isMediaDraft,
  isMediaClipboard,
} from "types/Media/MediaTypes";

// ------------------------------------------------------------
// Timeline Definitions
// ------------------------------------------------------------

/** The `Timeline` contains information about the data grid and manages all tracked objects. */
export type Timeline = Partial<{
  state: TimelineState;
  type: ClipType;

  draft: MediaDraft;
  clipboard: MediaClipboard;
  selection: TimelineSelection;

  subdivision: Subdivision;
  cellWidth: number;
  cellHeight: number;
}>;

/**  The `TimelineState` describes any interaction that changes the appearance of the timeline. */
export const TIMELINE_STATES = [
  "adding-clips",
  "slicing-clips",
  "portaling-clips",
  "merging-clips",
  "idle",
] as const;
export type TimelineState = (typeof TIMELINE_STATES)[number];
export type TimelineSelection = MediaSelection & { trackId?: TrackId };

// ------------------------------------------------------------
// Timeline Defaults
// ------------------------------------------------------------

export const DEFAULT_CELL_WIDTH = 25;
export const DEFAULT_CELL_HEIGHT = 120;

export const defaultTimelineSelection: TimelineSelection = {
  clipIds: [],
  portalIds: [],
  trackId: undefined,
};

/** The default timeline is used for initialization. */
export const defaultTimeline: Required<Timeline> = {
  state: "idle",
  type: "pattern",
  draft: defaultMediaDraft,
  clipboard: defaultMediaClipboard,
  selection: defaultTimelineSelection,
  subdivision: "16n",
  cellWidth: DEFAULT_CELL_WIDTH,
  cellHeight: DEFAULT_CELL_HEIGHT,
};

// ------------------------------------------------------------
// Timeline Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `TimelineState` */
export const isTimelineState = (obj: unknown): obj is TimelineState => {
  const candidate = obj as TimelineState;
  return isString(candidate) && TIMELINE_STATES.includes(candidate);
};

/** Checks if a given object is of type `TimelineSelection` */
export const isTimelineSelection = (obj: unknown): obj is TimelineSelection => {
  const candidate = obj as TimelineSelection;
  return (
    isPlainObject(candidate) &&
    isOptionalType(candidate.trackId, isString) &&
    isMediaSelection(candidate)
  );
};

/** Checks if a given object is of type `Timeline` */
export const isTimeline = (obj: unknown): obj is Timeline => {
  const candidate = obj as Timeline;
  return (
    isPlainObject(candidate) &&
    isOptionalType(candidate.state, isTimelineState) &&
    isOptionalType(candidate.type, isString) &&
    isOptionalType(candidate.cellWidth, isNumber) &&
    isOptionalType(candidate.cellHeight, isNumber) &&
    isOptionalType(candidate.selection, isTimelineSelection) &&
    isOptionalType(candidate.draft, isMediaDraft) &&
    isOptionalType(candidate.clipboard, isMediaClipboard)
  );
};
