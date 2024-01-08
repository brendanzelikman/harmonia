import { useEffect } from "react";

export function useCustomEventListener(
  type: string,
  onEvent: (event: CustomEvent) => void
) {
  useEffect(() => {
    const listener = onEvent as EventListener;
    window.addEventListener(type, listener);
    return () => window.removeEventListener(type, listener);
  }, [type, onEvent]);
}
