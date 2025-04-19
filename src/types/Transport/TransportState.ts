import { useEvent } from "hooks/useEvent";
import { useState } from "react";
import { dispatchCustomEvent } from "utils/event";
import * as Tone from "tone";
import { Thunk } from "types/Project/ProjectTypes";
import { scheduleTransport } from "./TransportScheduler";
import { dispatchTick } from "./TransportTick";
import { loadTransport } from "./TransportLoader";

// --------------------------------------------------------------
// Events
// --------------------------------------------------------------

export const START_TRANSPORT = "startTransport";
export const PAUSE_TRANSPORT = "pauseTransport";
export const STOP_TRANSPORT = "stopTransport";

/** Dispatch an event to start the transport. */
export const dispatchStartTransport = () => {
  dispatchCustomEvent(START_TRANSPORT);
};

/** Dispatch an event to pause the transport. */
export const dispatchPauseTransport = () => {
  dispatchCustomEvent(PAUSE_TRANSPORT);
};

/** Dispatch an event to stop the transport. */
export const dispatchStopTransport = () => {
  dispatchCustomEvent(STOP_TRANSPORT);
};

// --------------------------------------------------------------
// Hooks
// --------------------------------------------------------------

/** Custom hook for getting the state of the transport. */
export const useTransportState = () => {
  const [state, setState] = useState("stopped");
  useEvent(START_TRANSPORT, () => setState("started"));
  useEvent(PAUSE_TRANSPORT, () => setState("paused"));
  useEvent(STOP_TRANSPORT, () => setState("stopped"));
  return state;
};

// --------------------------------------------------------------
// Thunks
// --------------------------------------------------------------

/** Start the transport, using `Tone.scheduleRepeat` to schedule all samplers. */
export const startTransport = (): Thunk => async (dispatch) => {
  if (Tone.getContext().state !== "running") return;
  dispatch(scheduleTransport());
  dispatchStartTransport();
  Tone.getTransport().start();
};

/** Pause the transport, canceling all scheduled events. */
export const pauseTransport = () => {
  dispatchPauseTransport();
  Tone.getTransport().cancel();
  Tone.getTransport().pause();
};

/** Stop the transport, canceling all scheduled events. */
export const stopTransport = () => {
  dispatchStopTransport();
  dispatchTick(0);
  Tone.getTransport().cancel();
  Tone.getTransport().stop();
};

/** Toggle the transport between playing and paused/stopped. */
export const toggleTransport = (): Thunk => (dispatch) => {
  if (Tone.getTransport().state === "started") pauseTransport();
  else dispatch(startTransport());
};
