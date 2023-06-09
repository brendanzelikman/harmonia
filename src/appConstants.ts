import { Duration } from "types/units";

// Tempo
export const MIN_BPM = 30;
export const DEFAULT_BPM = 120;
export const MAX_BPM = 300;

// Volume
export const MIN_VOLUME = -60;
export const DEFAULT_VOLUME = -6;
export const MAX_VOLUME = 0;
export const MIN_GLOBAL_VOLUME = -30;
export const DEFAULT_GLOBAL_VOLUME = 0;
export const MAX_GLOBAL_VOLUME = 6;

// Time Signature + Rhythm
export const MEASURE_COUNT = 128;
export const TIMELINE_SUBDIVISION = 16;
export const MAX_SUBDIVISION = 16;
export const DEFAULT_DURATION: Duration = "eighth";
export const DEFAULT_BEATS_PER_BAR = 4;

// Timeline
export const TRACK_WIDTH = 300;
export const CELL_WIDTH = 20;
export const HEADER_HEIGHT = 80;
export const CELL_HEIGHT = 120;
export const TRANSPOSE_HEIGHT = 20;
export const INITIAL_MAX_ROWS = 8;

// Effects
export const MIN_WET = 0;
export const DEFAULT_WET = 0;
export const MAX_WET = 1;

// Warp
export const MIN_WARP_PITCH = -12;
export const DEFAULT_WARP_PITCH = 0;
export const MAX_WARP_PITCH = 12;
export const MIN_WARP_WINDOW = 0.01;
export const DEFAULT_WARP_WINDOW = 0.01;
export const MAX_WARP_WINDOW = 0.1;

// Reverb
export const MIN_REVERB_DECAY = 0.1;
export const DEFAULT_REVERB_DECAY = 1;
export const MAX_REVERB_DECAY = 10;
export const MIN_REVERB_PREDELAY = 0.01;
export const DEFAULT_REVERB_PREDELAY = 0.01;
export const MAX_REVERB_PREDELAY = 0.5;

// Chorus
export const MIN_CHORUS_FREQUENCY = 0.1;
export const DEFAULT_CHORUS_FREQUENCY = 1.5;
export const MAX_CHORUS_FREQUENCY = 5;
export const MIN_CHORUS_DEPTH = 0;
export const DEFAULT_CHORUS_DEPTH = 0.5;
export const MAX_CHORUS_DEPTH = 1;
export const MIN_CHORUS_DELAY_TIME = 0.1;
export const DEFAULT_CHORUS_DELAY_TIME = 3.5;
export const MAX_CHORUS_DELAY_TIME = 5.0;

// Delay
export const MIN_DELAY_TIME = 0.01;
export const DEFAULT_DELAY_TIME = 0.25;
export const MAX_DELAY_TIME = 1;
export const MIN_DELAY_FEEDBACK = 0;
export const DEFAULT_DELAY_FEEDBACK = 0.5;
export const MAX_DELAY_FEEDBACK = 1;

// EQ
export const MIN_FILTER_LOW = -30;
export const DEFAULT_FILTER_LOW = -30;
export const MAX_FILTER_LOW = 0;
export const MIN_FILTER_MID = -30;
export const DEFAULT_FILTER_MID = -30;
export const MAX_FILTER_MID = 0;
export const MIN_FILTER_HIGH = -30;
export const DEFAULT_FILTER_HIGH = -30;
export const MAX_FILTER_HIGH = 0;
