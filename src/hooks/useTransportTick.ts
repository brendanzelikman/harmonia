import { useMemo, useState } from "react";
import { useCustomEventListener } from "./useCustomEventListener";
import {
  UPDATE_OFFLINE_TICK,
  UPDATE_TICK,
} from "types/Transport/TransportThunks";

/** Get the current tick using a custom event listener */
export function useTransportTick(options?: { offline: boolean }) {
  const [tick, setTick] = useState(0);
  const [string, setString] = useState("0:0:0");

  // Update the tick
  const tickEvent = options?.offline ? UPDATE_OFFLINE_TICK : UPDATE_TICK;
  useCustomEventListener(tickEvent, (e: CustomEvent) => setTick(e.detail));

  // Update the string
  useCustomEventListener("printTick", (e: CustomEvent) => setString(e.detail));

  return useMemo(() => ({ tick, string }), [tick, string]);
}
