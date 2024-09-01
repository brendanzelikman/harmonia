import { useEffect } from "react";

export function useEventListener(
  type: string,
  onEvent: (event: CustomEvent) => void
) {
  useEffect(() => {
    const listener = onEvent as EventListener;
    window.addEventListener(type, listener);
    return () => window.removeEventListener(type, listener);
  }, [type, onEvent]);
}

export function useEventListeners(
  listeners: { type: string; onEvent: (event: CustomEvent) => void }[]
) {
  useEffect(() => {
    listeners.forEach(({ type, onEvent }) => {
      const listener = onEvent as EventListener;
      window.addEventListener(type, listener);
    });
    return () => {
      listeners.forEach(({ type, onEvent }) => {
        const listener = onEvent as EventListener;
        window.removeEventListener(type, listener);
      });
    };
  }, [...listeners]);
}
