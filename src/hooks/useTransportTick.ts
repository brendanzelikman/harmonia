import { useState, useEffect } from "react";
import { OFFLINE_TICK_UPDATE_EVENT, TICK_UPDATE_EVENT } from "redux/Transport";

export default function useTransportTick(options?: { offline: boolean }) {
  const [tick, setTick] = useState(0);

  // Update the tick when the event is received
  useEffect(() => {
    const updateTick = (event: CustomEvent) => {
      setTick(event.detail);
    };
    const listener = updateTick as EventListener;
    const event = options?.offline
      ? OFFLINE_TICK_UPDATE_EVENT
      : TICK_UPDATE_EVENT;
    window.addEventListener(event, listener);
    return () => window.removeEventListener(event, listener);
  }, [options]);

  // Return the tick
  return tick;
}
