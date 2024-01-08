import { useState } from "react";
import { UPDATE_OFFLINE_TICK, UPDATE_TICK } from "redux/Transport";
import { useCustomEventListener } from "../window/useCustomEventListener";

/** Get the current tick using a custom event listener */
export function useTransportTick(options?: { offline: boolean }) {
  const [tick, setTick] = useState(0);

  // Get the corresponding event
  const event = options?.offline ? UPDATE_OFFLINE_TICK : UPDATE_TICK;

  // Set the tick on the custom event
  useCustomEventListener(event, (e) => setTick(e.detail));

  // Return the tick
  return tick;
}
