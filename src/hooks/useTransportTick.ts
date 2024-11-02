import { useCallback, useState } from "react";
import { useCustomEventListener } from "./useCustomEventListener";
import {
  UPDATE_OFFLINE_TICK,
  UPDATE_TICK,
} from "types/Transport/TransportThunks";

/** Get the current tick using a custom event listener */
export function useTransportTick(options?: { offline: boolean }) {
  const [tick, setTick] = useState(0);
  const updateTick = useCallback((e: CustomEvent) => setTick(e.detail), []);

  // Get the corresponding event
  const event = options?.offline ? UPDATE_OFFLINE_TICK : UPDATE_TICK;

  // Set the tick on the custom event
  useCustomEventListener(event, updateTick);

  // Return the tick
  return tick;
}
