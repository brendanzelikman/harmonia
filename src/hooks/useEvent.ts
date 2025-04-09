import { useEffect } from "react";

/** Custom hook for a an event listener */
export function useEvent(type: string, onEvent: (event: CustomEvent) => void) {
  useEffect(() => {
    window.addEventListener(type, onEvent as EventListener);
    return () =>
      window.removeEventListener(type, onEvent as EventListener, false);
  }, [type, onEvent]);
}
