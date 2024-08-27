import { useState } from "react";
import { useCustomEventListener } from "./useCustomEventListener";

export const useWindowedState = (key: string, defaultValue?: boolean) => {
  const [state, setState] = useState(defaultValue ?? false);
  useCustomEventListener(`open_${key}`, () => setState(true));
  useCustomEventListener(`close_${key}`, () => setState(false));
  return { state, setState };
};
