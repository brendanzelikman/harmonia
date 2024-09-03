import { useState } from "react";
import { dispatchCustomEvent } from "utils/html";
import { useCustomEventListeners } from "./useCustomEventListener";
import { Dictionary } from "@reduxjs/toolkit";

export const useRecordState = <T extends Dictionary<any>>(record: T) => {
  const [state, setState] = useState<T>(record);
  const keys = Object.keys(state);

  // Create an event type for each key
  const EVENT_KEY = (key: keyof T) => `update_${String(key)}`;

  // Send an event to update a key
  const set = (key: keyof T, value: any) => {
    dispatchCustomEvent(EVENT_KEY(key), value);
  };

  // Send an event to clear all keys
  const clear = () => {
    keys.forEach((key) => dispatchCustomEvent(EVENT_KEY(key), null));
  };

  // Listen for events to update the state
  const listeners = keys.map((key) => ({
    type: EVENT_KEY(key),
    onEvent: (event: CustomEvent) => {
      setState((state) => ({ ...state, [key]: event.detail }));
    },
  }));
  useCustomEventListeners(listeners);

  // Check if any or all keys are truthy/falsy
  const any = keys.some((key) => !!state[key]);
  const all = keys.every((key) => !!state[key]);

  // Return state and functions
  return { ...state, set, clear, any, all };
};
