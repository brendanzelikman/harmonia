import { DEFAULT_CELL_WIDTH } from "appConstants";
import { Clip } from "./clip";
import { Transposition } from "./transposition";
import { Subdivision } from "./units";

export interface TimelineClipboard {
  clips: Clip[];
  transpositions: Transposition[];
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

  clipboard: TimelineClipboard;
}

export const defaultTimeline: Timeline = {
  state: "idle",
  cellWidth: DEFAULT_CELL_WIDTH,
  subdivision: "1/16",
  clipboard: { clips: [], transpositions: [] },
};

export const isTimeline = (obj: any): obj is Timeline => {
  const { state, cellWidth, subdivision, clipboard } = obj;
  return (
    state !== undefined &&
    cellWidth !== undefined &&
    subdivision !== undefined &&
    clipboard !== undefined
  );
};
