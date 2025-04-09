import { useEvent } from "hooks/useEvent";
import { useState } from "react";
import {
  UPDATE_TICK_STRING,
  UPDATE_DOWNLOAD_TICK,
  UPDATE_TICK_NUMBER,
} from "../types/Transport/TransportTypes";

/** Get the current tick using a custom event listener */
export function useTick(options?: { offline: boolean }) {
  const [tick, setTick] = useState(0);
  const [string, setString] = useState("0:0:0");

  // Update the tick
  const tickEvent = options?.offline
    ? UPDATE_DOWNLOAD_TICK
    : UPDATE_TICK_NUMBER;
  useEvent(tickEvent, (e) => setTick(Math.round(e.detail)));

  // Update the string
  useEvent(UPDATE_TICK_STRING, (e) => setString(e.detail));

  return { tick, string };
}

/** Get the current tick using a custom event listener */
export function useOfflineTick() {
  const [tick, setTick] = useState(0);
  useEvent(UPDATE_DOWNLOAD_TICK, (e) => setTick(e.detail));
  return tick;
}
