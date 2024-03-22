export const IS_PROD = import.meta.env.PROD;
// ------------------------------------------------------------
// Project Settings - Product Info
// ------------------------------------------------------------
export const FIREBASE_LIVE_API_KEY = import.meta.env.VITE_FIREBASE_LIVE_API_KEY;
export const FIREBASE_TEST_API_KEY = import.meta.env.VITE_FIREBASE_TEST_API_KEY;

// Website URL
export const WEBSITE_TEST_URL = import.meta.env.VITE_WEBSITE_TEST_URL;
export const WEBSITE_LIVE_URL = import.meta.env.VITE_WEBSITE_LIVE_URL;
export const WEBSITE_URL = IS_PROD ? WEBSITE_LIVE_URL : WEBSITE_TEST_URL;
export const REPO_URL = import.meta.env.VITE_REPOSITORY_URL;
export const DESKTOP_URL = import.meta.env.VITE_DESKTOP_URL;
export const PLUGIN_URL = import.meta.env.VITE_PLUGIN_URL;

// ------------------------------------------------------------
// Project Settings - Subscriptions
// ------------------------------------------------------------

export type SubscriptionStatus = "prodigy" | "maestro" | "virtuoso";

// Project Limits
export const PRODIGY_PROJECT_LIMIT = 1;
export const MAESTRO_PROJECT_LIMIT = 50;
export const VIRTUOSO_PROJECT_LIMIT = Infinity;

// Maestro Price
export const MAESTRO_TEST_PRICE_ID = import.meta.env.VITE_MAESTRO_TEST_PRICE_ID;
export const MAESTRO_LIVE_PRICE_ID = import.meta.env.VITE_MAESTRO_LIVE_PRICE_ID;
export const MAESTRO_PRICE_ID = IS_PROD
  ? MAESTRO_LIVE_PRICE_ID
  : MAESTRO_TEST_PRICE_ID;

// Virtuoso Price
export const VIRTUOSO_TEST_PRICE_ID = import.meta.env
  .VITE_VIRTUOSO_TEST_PRICE_ID;
export const VIRTUOSO_LIVE_PRICE_ID = import.meta.env
  .VITE_VIRTUOSO_LIVE_PRICE_ID;
export const VIRTUOSO_PRICE_ID = IS_PROD
  ? VIRTUOSO_LIVE_PRICE_ID
  : VIRTUOSO_TEST_PRICE_ID;

// Subscription Prices
export const PRICE_RECORD = {
  prodigy: null,
  maestro: IS_PROD ? MAESTRO_LIVE_PRICE_ID : MAESTRO_TEST_PRICE_ID,
  virtuoso: IS_PROD ? VIRTUOSO_LIVE_PRICE_ID : VIRTUOSO_TEST_PRICE_ID,
};

// ------------------------------------------------------------
// Plugin Settings
// ------------------------------------------------------------

export const PLUGIN_STARTING_PORT = 51200;
export const PLUGIN_PORT_RANGE = 16;

// ------------------------------------------------------------
// Indexed Database
// ------------------------------------------------------------

export const INDEXED_DATABASE_NAME = import.meta.env.VITE_INDEXED_DATABASE_NAME;
export const PROJECT_STORE = import.meta.env.VITE_PROJECT_STORE;
export const CURRENT_ID_STORE = import.meta.env.VITE_CURRENT_ID_STORE;

// ------------------------------------------------------------
// Tempo and Rhythm
// ------------------------------------------------------------

export const DEFAULT_BPM = 120;
export const MIN_BPM = 30;
export const MAX_BPM = 300;
export const MEASURE_COUNT = 64;
export const DEFAULT_DURATION = "eighth";
export const DEFAULT_BEATS_PER_BAR = 4;

// ------------------------------------------------------------
// Volume Settings
// ------------------------------------------------------------

export const DEFAULT_INSTRUMENT_KEY = "upright-piano";
export const DEFAULT_VOLUME = -6;
export const MIN_VOLUME = -60;
export const MAX_VOLUME = 6;
export const VOLUME_STEP = 0.1;
export const DEFAULT_TRANSPORT_VOLUME = -6;
export const MIN_TRANSPORT_VOLUME = -60;
export const MAX_TRANSPORT_VOLUME = 0;

// ------------------------------------------------------------
// Pan Settings
// ------------------------------------------------------------

export const DEFAULT_PAN = 0;
export const MIN_PAN = -1;
export const MAX_PAN = 1;
export const PAN_STEP = 0.01;

// ------------------------------------------------------------
// Note Settings
// ------------------------------------------------------------

export const DEFAULT_VELOCITY = 100;
export const MIN_VELOCITY = 0;
export const MAX_VELOCITY = 127;

// ------------------------------------------------------------
// Timeline Dimensions
// ------------------------------------------------------------

export const HEADER_HEIGHT = 80;
export const TRACK_WIDTH = 300;
export const COLLAPSED_TRACK_HEIGHT = 60;
export const MIN_CELL_WIDTH = 20;
export const MAX_CELL_WIDTH = 100;
export const MIN_CELL_HEIGHT = 80;
export const MAX_CELL_HEIGHT = 120;
export const POSE_HEIGHT = 20;
export const NAV_HEIGHT = 60;
export const SCALE_TRACK_SCALE_NAME = "$$$$$_track_scale_$$$$$";
