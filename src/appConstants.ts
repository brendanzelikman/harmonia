import { Duration } from "types/units";

export const LANDING_LINK = "https://brendanzelikman.github.io/harmonia";
export const PLAYGROUND_LINK =
  "https://brendanzelikman.github.io/harmonia/playground";
export const REPO_LINK = "https://www.github.com/brendanzelikman/harmonia";

// Tempo
export const DEFAULT_BPM = 120;
export const MIN_BPM = 30;
export const MAX_BPM = 300;

// Volume
export const DEFAULT_VOLUME = -6;
export const MIN_VOLUME = -60;
export const MAX_VOLUME = 0;
export const VOLUME_STEP = 0.01;

export const DEFAULT_GLOBAL_VOLUME = 0;
export const MIN_GLOBAL_VOLUME = -60;
export const MAX_GLOBAL_VOLUME = 0;

// Pan
export const DEFAULT_PAN = 0;
export const MIN_PAN = -1;
export const MAX_PAN = 1;
export const PAN_STEP = 0.01;

// Time Signature + Rhythm
export const MEASURE_COUNT = 64;
export const DEFAULT_DURATION: Duration = "eighth";
export const DEFAULT_BEATS_PER_BAR = 4;

// Timeline
export const TRACK_WIDTH = 300;
export const DEFAULT_CELL_WIDTH = 25;
export const MIN_CELL_WIDTH = 25;
export const MAX_CELL_WIDTH = 50;
export const HEADER_HEIGHT = 80;
export const CELL_HEIGHT = 120;
export const TRANSPOSITION_HEIGHT = 20;
export const INITIAL_MAX_ROWS = 8;
