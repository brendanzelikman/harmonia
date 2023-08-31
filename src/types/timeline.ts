import { DEFAULT_CELL_WIDTH } from "appConstants";
import { Clip } from "./clips";
import { Transform } from "./transform";
import { Subdivision } from "./units";

export interface TimelineClipboard {
  clips: Clip[];
  transforms: Transform[];
}

export const orderedSubdivisions: Subdivision[] = [
  "1/1",
  "1/2",
  "1/4",
  "1/8",
  "1/16",
  "1/32",
  "1/64",
];

export type TimelineState =
  | "adding"
  | "cutting"
  | "transposing"
  | "repeating"
  | "merging"
  | "idle";

export interface Timeline {
  state: TimelineState;

  cellWidth: number;
  subdivision: Subdivision;

  draggingClip: boolean;
  draggingTransform: boolean;

  clipboard: TimelineClipboard;
}

export const defaultTimeline: Timeline = {
  state: "idle",
  cellWidth: DEFAULT_CELL_WIDTH,
  subdivision: "1/16",
  clipboard: { clips: [], transforms: [] },
  draggingClip: false,
  draggingTransform: false,
};

export const isTimeline = (obj: any): obj is Timeline => {
  const {
    state,
    cellWidth,
    subdivision,
    draggingClip,
    draggingTransform,
    clipboard,
  } = obj;
  return (
    state !== undefined &&
    cellWidth !== undefined &&
    subdivision !== undefined &&
    draggingClip !== undefined &&
    draggingTransform !== undefined &&
    clipboard !== undefined
  );
};
