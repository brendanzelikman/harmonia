import { useCallback, useState } from "react";
import { useCustomEventListener } from "./useCustomEventListener";
import { dispatchCustomEvent } from "utils/html";

export const useToggledState = (
  key: string = "default",
  defaultValue?: boolean
) => {
  const [state, setState] = useState(defaultValue ?? false);

  // Create open and close keys
  const OPEN = `open_${key}`;
  const CLOSE = `close_${key}`;
  const TOGGLE = `toggle_${key}`;

  const open = useCallback(() => dispatchCustomEvent(OPEN), []);
  const close = useCallback(() => dispatchCustomEvent(CLOSE), []);
  const toggle = useCallback(() => dispatchCustomEvent(TOGGLE), []);

  // Listen for open and close events
  useCustomEventListener(OPEN, () => setState(true));
  useCustomEventListener(CLOSE, () => setState(false));
  useCustomEventListener(TOGGLE, () => setState((prev) => !prev));

  return {
    open,
    close,
    toggle,
    isOpen: state,
    isClosed: !state,
  };
};
