import { DEFAULT_BPM } from "utils/constants";
import { BPM, Seconds, Tick, Volume } from "../units";
import { WholeNoteTicks } from "utils/durations";
import { dispatchClose, dispatchOpen } from "hooks/useToggle";
import { dispatchCustomEvent } from "utils/html";
import { getBarsBeatsSixteenths } from "./TransportFunctions";

/** The Transport mirrors and stores the Tone.js transport. */
export interface Transport {
  bpm: BPM;
  timeSignature: number;
  swing: number;
  loop: boolean;
  loopStart: Seconds;
  loopEnd: Seconds;
  volume: Volume;
  mute: boolean;
}

/** The default transport settings. */
export const defaultTransport: Transport = {
  bpm: DEFAULT_BPM,
  timeSignature: 4,
  loop: true,
  loopStart: 0,
  loopEnd: WholeNoteTicks - 1,
  volume: 0,
  swing: 0,
  mute: false,
};

// -------------------------------------------------
// Transport Tick Events
// -------------------------------------------------

export const UPDATE_TICK_NUMBER = "updateTick";
export const UPDATE_TICK_STRING = "displayTick";

/** Dispatch a tick as a number and as a string. */
export const dispatchTick = (tick: Tick) => {
  dispatchCustomEvent(UPDATE_TICK_NUMBER, tick);
  dispatchCustomEvent(UPDATE_TICK_STRING, getBarsBeatsSixteenths(tick).string);
};

// ------------------------------------------------
// Transport Recording Events
// -------------------------------------------------

export const RECORD_TRANSPORT = "recordTransport";

// -------------------------------------------------
// Transport Download Events
// -------------------------------------------------

export const DOWNLOAD_TRANSPORT = "downloadTransport";
export const UPDATE_DOWNLOAD_TICK = "updateDownloadTick";

/** Dispatch an event to update the download tick. */
export const dispatchDownloadTickEvent = (tick: Tick) => {
  dispatchCustomEvent(UPDATE_DOWNLOAD_TICK, tick);
};

/** Dispatch an event to start downloading the transport. */
export const startDownloadingTransport = () => {
  dispatchOpen(DOWNLOAD_TRANSPORT);
  dispatchDownloadTickEvent(0);
};

/** Dispatch an event to stop downloading the transport. */
export const stopDownloadingTransport = () => {
  dispatchClose(DOWNLOAD_TRANSPORT);
  dispatchDownloadTickEvent(0);
};
