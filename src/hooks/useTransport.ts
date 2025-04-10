import { useState } from "react";
import { useEvent } from "./useEvent";
import { dispatchCustomEvent } from "utils/event";

export const START_TRANSPORT = "start-transport";
export const PAUSE_TRANSPORT = "pause-transport";
export const STOP_TRANSPORT = "stop-transport";

/** Custom hook for getting the state of the transport. */
export const useTransport = () => {
  const [state, setState] = useState("stopped");
  useEvent(START_TRANSPORT, () => setState("started"));
  useEvent(PAUSE_TRANSPORT, () => setState("paused"));
  useEvent(STOP_TRANSPORT, () => setState("stopped"));
  return state;
};

/** Dispatch a custom event to start the transport. */
export const broadcastStartTransport = () => {
  dispatchCustomEvent(START_TRANSPORT);
};

/** Dispatch a custom event to pause the transport. */
export const broadcastPauseTransport = () => {
  dispatchCustomEvent(PAUSE_TRANSPORT);
};

/** Dispatch a custom event to stop the transport. */
export const broadcastStopTransport = () => {
  dispatchCustomEvent(STOP_TRANSPORT);
};
