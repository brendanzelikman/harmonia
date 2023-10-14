import { Track, TrackId } from "types/Track";
import { Subdivision } from "../units";
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
} from "types/Media";

// Types
export type TimelineObject = Track | Media;

/**
 * The `TimelineState` contains the current state of the timeline.
 * @const `addingClips` - The user is adding clips.
 * @const `addingTranspositions` - The user is adding transpositions.
 * @const `slicingMedia` - The user is slicing media.
 * @const `mergingMedia` - The user is merging media.
 * @const `idle` - The user is not performing any actions.
 */
export type TimelineState =
  | "addingClips"
  | "addingTranspositions"
  | "slicingMedia"
  | "mergingMedia"
  | "idle";

/**
 * The `TimelineCell` contains the dimensions of a timeline cell.
 * @property `width` - The width of the cell.
 * @property `height` - The height of the cell.
 */
export type TimelineCell = {
  width: number;
  height: number;
};

export const DEFAULT_CELL: TimelineCell = {
  width: 25,
  height: 120,
};

/**
 * The `Timeline` contains information about the data grid and manages all tracked objects.
 * @property `state` - The current action state of the timeline.
 * @property `subdivision` - The current subdivision of the timeline.
 * @property `cell` - The dimensions of a timeline cell.
 * @property `selectedTrackId` - The ID of the currently selected track.
 * @property `mediaSelection` - The selected media.
 * @property `mediaDraft` - The drafted media.
 * @property `mediaClipboard` - The copied media.
 * @property `mediaDragState` - The drag state of the media.
 */
export interface Timeline {
  state: TimelineState;
  subdivision: Subdivision;
  cell: TimelineCell;
  selectedTrackId?: TrackId;
  mediaSelection: MediaSelection;
  mediaDraft: MediaDraft;
  mediaClipboard: MediaClipboard;
  mediaDragState: MediaDragState;
}

export const defaultTimeline: Timeline = {
  state: "idle",
  subdivision: "1/16",
  cell: DEFAULT_CELL,
  selectedTrackId: undefined,
  mediaSelection: DEFAULT_MEDIA_SELECTION,
  mediaDraft: DEFAULT_MEDIA_DRAFT,
  mediaClipboard: DEFAULT_MEDIA_CLIPBOARD,
  mediaDragState: DEFAULT_MEDIA_DRAG_STATE,
};

/**
 * Checks if a given object is of type `Timeline`.
 * @param obj The object to check.
 * @returns True if the object is a `Timeline`, otherwise false.
 */
export const isTimeline = (obj: unknown): obj is Timeline => {
  const candidate = obj as Timeline;
  return (
    candidate?.state !== undefined &&
    candidate?.cell !== undefined &&
    candidate?.subdivision !== undefined &&
    candidate?.mediaSelection !== undefined &&
    candidate?.mediaDraft !== undefined &&
    candidate?.mediaClipboard !== undefined &&
    candidate?.mediaDragState !== undefined
  );
};
