import { useCallback, useEffect, useState } from "react";
import { useEvent } from "./useEvent";
import { dispatchCustomEvent } from "utils/event";

type ToggledKey = string;
const openKey = (key: ToggledKey) => `${key}-open`;
const closeKey = (key: ToggledKey) => `${key}-close`;
const toggleKey = (key: ToggledKey) => `${key}-toggle`;

/** Custom hook for using a toggled value. */
export const useToggle = (
  key: ToggledKey,
  defaultValue = !!getToggleValue(key)
) => {
  const [isOpen, setIsOpen] = useState(defaultValue);

  // Callback functions for changing state
  const setTrue = useCallback(() => setIsOpen(true), []);
  const setFalse = useCallback(() => setIsOpen(false), []);
  const setToggle = useCallback(() => setIsOpen((prev) => !prev), []);

  // Callback functions for broadcasting changes
  const open = useCallback(() => dispatchCustomEvent(openKey(key)), []);
  const close = useCallback(() => dispatchCustomEvent(closeKey(key)), []);
  const toggle = useCallback(() => dispatchCustomEvent(toggleKey(key)), []);

  // Event listeners for receiving broadcasts
  useEvent(openKey(key), setTrue);
  useEvent(closeKey(key), setFalse);
  useEvent(toggleKey(key), setToggle);

  // Update local storage when the state changes
  useEffect(() => {
    window.localStorage.setItem(key, `${isOpen}`);
    return () => {
      window.localStorage.removeItem(key);
    };
  }, [key, isOpen]);

  return { open, close, toggle, isOpen };
};

// --------------------------------------------------------------
// Global Functions
// --------------------------------------------------------------

/* Get the toggled state from local storage. */
export const getToggleValue = (key: ToggledKey) => {
  const value = window.localStorage.getItem(key);
  return JSON.parse(value ?? "false");
};

/** Dispatch an open event for a toggled key. */
export const dispatchOpen = (key: ToggledKey) => {
  dispatchCustomEvent(openKey(key));
};

/** Dispatch a close event for a toggled key. */
export const dispatchClose = (key: ToggledKey) => {
  dispatchCustomEvent(closeKey(key));
};

/** Dispatch a toggle event for a toggled key. */
export const dispatchToggle = (key: ToggledKey) => {
  dispatchCustomEvent(toggleKey(key));
};

// -----------------------------------------------------------------
// Event Listeners
// -----------------------------------------------------------------

/** Create a one-time event listener for a toggled key. */
export const addToggleCloseListener = (
  key: ToggledKey,
  callback: () => void
) => {
  window.addEventListener(closeKey(key), callback, { once: true });
};
