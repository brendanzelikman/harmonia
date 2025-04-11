// ------------------------------------------------------------
// Browser - Storage
// ------------------------------------------------------------

export const PROJECT_ID = "projectId";
export const IDB_NAME = "harmonia-idb";
export const PROJECT_STORE = "projects";
export const SAMPLE_STORE = "samples";
export const UPDATE_PROJECT_EVENT = "updateProjects";

// ------------------------------------------------------------
// Audio - Rhythm
// ------------------------------------------------------------

export const DEFAULT_BPM = 120;
export const MIN_BPM = 30;
export const MAX_BPM = 300;
export const MEASURE_COUNT = 64;
export const DEFAULT_DURATION = "eighth";
export const DEFAULT_BEATS_PER_BAR = 4;
export const DEFAULT_SUBDIVISION = "16n";

// ------------------------------------------------------------
// Audio - Volume
// ------------------------------------------------------------

export const DEFAULT_INSTRUMENT_KEY = "upright-piano";
export const DEFAULT_VOLUME = -6;
export const MIN_VOLUME = -60;
export const MAX_VOLUME = 12;
export const VOLUME_STEP = 0.1;

// ------------------------------------------------------------
// Audio - Pan
// ------------------------------------------------------------

export const DEFAULT_PAN = 0;
export const MIN_PAN = -1;
export const MAX_PAN = 1;
export const PAN_STEP = 0.01;

// ------------------------------------------------------------
// Audio - Velocity
// ------------------------------------------------------------

export const DEFAULT_VELOCITY = 100;
export const MIN_VELOCITY = 0;
export const MAX_VELOCITY = 127;

// ------------------------------------------------------------
// Timeline - Cell
// ------------------------------------------------------------

export const MIN_CELL_WIDTH = 25;
export const MAX_CELL_WIDTH = 125;
export const DEFAULT_CELL_WIDTH = 25;

export const MIN_CELL_HEIGHT = 80;
export const MAX_CELL_HEIGHT = 120;
export const DEFAULT_CELL_HEIGHT = 120;

// ------------------------------------------------------------
// Timeline - Header
// ------------------------------------------------------------

export const NAV_HEIGHT = 60;
export const HEADER_HEIGHT = 80;

// ------------------------------------------------------------
// Timeline - Track
// ------------------------------------------------------------

export const TRACK_WIDTH = 300;
export const COLLAPSED_TRACK_HEIGHT = 45;

// ------------------------------------------------------------
// Timeline - Clip
// ------------------------------------------------------------

export const POSE_NOTCH_HEIGHT = 20;
export const CLIP_NAME_HEIGHT = 24;
export const CLIP_STREAM_MARGIN = 8;

// ------------------------------------------------------------
// Vector - Keys
// ------------------------------------------------------------

export const CHORDAL_KEY = "r";
export const CHROMATIC_KEY = "t";
export const OCTAVE_KEY = "y";
export const PITCH_KEY = "*";
export const VECTOR_SEPARATOR = " + ";
export const VECTOR_BASE = "Root";
