import { useState, useEffect } from "react";
import { TICK_UPDATE_EVENT } from "redux/Transport";

export default function useTransportTick() {
  const [tick, setTick] = useState(0);

  // Update the tick when the event is received
  useEffect(() => {
    const updateTick = (event: CustomEvent) => {
      setTick(event.detail);
    };
    const listener = updateTick as EventListener;
    window.addEventListener(TICK_UPDATE_EVENT, listener);
    return () => window.removeEventListener(TICK_UPDATE_EVENT, listener);
  }, []);

  return tick;
}
