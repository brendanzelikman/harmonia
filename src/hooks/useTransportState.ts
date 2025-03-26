import { useState } from "react";
import { useCustomEventListener } from "./useCustomEventListener";
import { dispatchCustomEvent } from "utils/html";

export const useTransportState = () => {
  const [state, setState] = useState("stopped");
  useCustomEventListener("stopTransport", () => setState("stopped"));
  useCustomEventListener("startTransport", () => setState("started"));
  useCustomEventListener("pauseTransport", () => setState("paused"));
  return state;
};

export const STOP_TRANSPORT = "stopTransport";
export const START_TRANSPORT = "startTransport";
export const PAUSE_TRANSPORT = "pauseTransport";

export const emitStopTransport = () => dispatchCustomEvent(STOP_TRANSPORT);
export const emitStartTransport = () => dispatchCustomEvent(START_TRANSPORT);
export const emitPauseTransport = () => dispatchCustomEvent(PAUSE_TRANSPORT);
