import { Track } from "types/Track";
import { Clip } from "../Clip";
import { Transposition } from "../Transposition";
import { Subdivision } from "../units";
import { Media } from "types/Media";

// Types
export type TimelineObject = Track | Media;

/**
 * The `TimelineState` contains the current state of the timeline.
 * @const `adding` - The user is adding clips.
 * @const `cutting` - The user is cutting clips.
 * @const `transposing` - The user is adding transpositions
 * @const `repeating` - The user is repeating clips/transpositions.
 * @const `merging` - The user is merging clips/transpositions.
 * @const `idle` - The user is not performing any actions.
 */
export type TimelineState =
  | "adding"
  | "cutting"
  | "transposing"
  | "repeating"
  | "merging"
  | "idle";

/**
 * The `TimelineClipboard` contains the media copied to the clipboard.
 * @property `clips` - The clips copied to the clipboard.
 * @property `transpositions` - The transpositions copied to the clipboard.
 */
export type TimelineClipboard = {
  clips: Clip[];
  transpositions: Transposition[];
};

export const DEFAULT_CLIPBOARD: TimelineClipboard = {
  clips: [],
  transpositions: [],
};

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
 * @property `cell` - The dimensions of a timeline cell.
 * @property `clipboard` - The media copied to the clipboard.
 * @property `subdivision` - The current subdivision of the timeline.
 */
export interface Timeline {
  state: TimelineState;
  clipboard: TimelineClipboard;
  cell: TimelineCell;
  subdivision: Subdivision;
}

export const defaultTimeline: Timeline = {
  state: "idle",
  cell: DEFAULT_CELL,
  clipboard: DEFAULT_CLIPBOARD,
  subdivision: "1/16",
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
    candidate?.clipboard !== undefined &&
    candidate?.cell !== undefined &&
    candidate?.subdivision !== undefined
  );
};
