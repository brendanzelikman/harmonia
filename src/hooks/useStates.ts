import { useState } from "react";

export const useStates = <T extends Record<any, any>>(initialState: T) => {
  const [state, setState] = useState(initialState);

  const set = (key: keyof T, value: T[keyof T]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  };

  const clear = (key: keyof T) => {
    setState((prev) => ({ ...prev, [key]: initialState[key] }));
  };

  return { state, ...state, set, clear };
};
