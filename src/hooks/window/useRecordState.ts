import { useState } from "react";
import { dispatchCustomEvent } from "utils/html";
import { useCustomEventListeners } from "./useCustomEventListener";
import { Dictionary } from "@reduxjs/toolkit";

export const useRecordState = <T extends Dictionary<any>>(record?: T) => {
  const [state, setState] = useState<T>(record ?? ({} as T));
  const keys = Object.keys(state);

  // Create an event type for each key
  const UPDATE_KEY = (key: string) => `update_${key}`;

  // Send an event to update a key
  const set = (key: string, value: any) => {
    dispatchCustomEvent(UPDATE_KEY(key), { detail: value });
  };

  // Listen for events to update the state
  const listeners = keys.map((key) => ({
    type: UPDATE_KEY(key),
    onEvent: (event: CustomEvent) => {
      setState((state) => ({ ...state, [key]: event.detail }));
    },
  }));
  useCustomEventListeners(listeners);

  // Check if any or all keys are truthy/falsy
  const any = keys.some((key) => !!state[key]);
  const all = keys.every((key) => !!state[key]);

  // Return state and functions
  return { ...state, set, any, all };
};
