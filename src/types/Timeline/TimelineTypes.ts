import { Subdivision } from "utils/durations";
import { ClipType } from "types/Clip/ClipTypes";
import { TrackId } from "types/Track/TrackTypes";
import {
  MediaSelection,
  MediaClipboard,
  defaultMediaDraft,
  defaultMediaClipboard,
} from "types/Media/MediaTypes";
import { Portal } from "types/Portal/PortalTypes";

// ------------------------------------------------------------
// Timeline Definitions
// ------------------------------------------------------------

/** The `Timeline` contains information about the data grid and manages all tracked objects. */
export type Timeline = Partial<{
  state: TimelineState;
  type: ClipType;

  fragment: Partial<Portal>;
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
  "editing-tracks",
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
  fragment: {},
  clipboard: defaultMediaClipboard,
  selection: defaultTimelineSelection,
  subdivision: "16n",
  cellWidth: DEFAULT_CELL_WIDTH,
  cellHeight: DEFAULT_CELL_HEIGHT,
};
