import { useCustomEventListener } from "hooks/useCustomEventListener";
import { useState } from "react";
import {
  UPDATE_TICK_STRING,
  UPDATE_DOWNLOAD_TICK,
  UPDATE_TICK_NUMBER,
} from "./TransportTypes";

/** Get the current tick using a custom event listener */
export function useTransportTick(options?: { offline: boolean }) {
  const [tick, setTick] = useState(0);
  const [string, setString] = useState("0:0:0");

  // Update the tick
  const tickEvent = options?.offline
    ? UPDATE_DOWNLOAD_TICK
    : UPDATE_TICK_NUMBER;
  useCustomEventListener(tickEvent, (e) => setTick(e.detail));

  // Update the string
  useCustomEventListener(UPDATE_TICK_STRING, (e) => setString(e.detail));

  return { tick, string };
}

/** Get the current tick using a custom event listener */
export function useOfflineTransportTick() {
  const [tick, setTick] = useState(0);
  useCustomEventListener(UPDATE_DOWNLOAD_TICK, (e) => setTick(e.detail));
  return tick;
}
