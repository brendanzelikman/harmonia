import { useCallback, useState } from "react";
import { useCustomEventListener } from "./useCustomEventListener";
import { dispatchCustomEvent } from "utils/html";

export const useToggledState = (
  key: string = "default",
  defaultValue?: boolean
) => {
  const [state, setState] = useState(defaultValue ?? false);

  // Create open and close keys
  const open = useCallback(() => dispatchCustomEvent(OPEN_STATE(key)), []);
  const close = useCallback(() => dispatchCustomEvent(CLOSE_STATE(key)), []);
  const toggle = useCallback(() => dispatchCustomEvent(TOGGLE_STATE(key)), []);

  // Listen for open and close events
  useCustomEventListener(OPEN_STATE(key), () => setState(true));
  useCustomEventListener(CLOSE_STATE(key), () => setState(false));
  useCustomEventListener(TOGGLE_STATE(key), () => setState((prev) => !prev));

  return {
    open,
    close,
    toggle,
    isOpen: state,
    isClosed: !state,
  };
};

export const OPEN_STATE = (key: string) => `open_${key}`;
export const CLOSE_STATE = (key: string) => `close_${key}`;
export const TOGGLE_STATE = (key: string) => `toggle_${key}`;
