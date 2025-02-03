import { useEffect } from "react";

export function useCustomEventListener(
  type: string,
  onEvent: (event: CustomEvent) => void
) {
  useEffect(() => {
    window.addEventListener(type, onEvent as EventListener);
    return () =>
      window.removeEventListener(type, onEvent as EventListener, false);
  }, [type, onEvent]);
}

export function useCustomEventListeners(
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
        window.removeEventListener(type, listener, false);
      });
    };
  }, [...listeners]);
}
