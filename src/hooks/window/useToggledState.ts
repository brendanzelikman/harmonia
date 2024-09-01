import { useState } from "react";
import { useEventListener } from "./useCustomEventListener";
import { dispatchCustomEvent } from "utils/html";

export const useToggledState = (key: string, defaultValue?: boolean) => {
  const [state, setState] = useState(defaultValue ?? false);

  // Create open and close keys
  const OPEN = `open_${key}`;
  const CLOSE = `close_${key}`;

  // Listen for open and close events
  useEventListener(OPEN, () => setState(true));
  useEventListener(CLOSE, () => setState(false));

  // Return state and functions
  return {
    open: () => dispatchCustomEvent(OPEN),
    close: () => dispatchCustomEvent(CLOSE),
    toggle: () => dispatchCustomEvent(state ? CLOSE : OPEN),
    isOpen: state,
    isClosed: !state,
  };
};
