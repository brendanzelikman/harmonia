import { useState } from "react";
import { Keys, useHotkeys } from "react-hotkeys-hook";
import { OptionsOrDependencyArray } from "react-hotkeys-hook/dist/types";

export const useHeldHotkeys = (
  keys: Keys,
  options?: OptionsOrDependencyArray
) => {
  const [heldKeys, setHeldKeys] = useState<Record<string, boolean>>({});

  const keydown = (e: KeyboardEvent) => {
    setHeldKeys((prev) => ({ ...prev, [e.key]: true }));
  };
  const keyup = (e: KeyboardEvent) => {
    setHeldKeys((prev) => ({ ...prev, [e.key]: false }));
  };
  const callback = (e: KeyboardEvent) => {
    e.type === "keydown" ? keydown(e) : keyup(e);
  };

  useHotkeys(keys, callback, {
    ...options,
    keydown: true,
    keyup: true,
  });

  return heldKeys;
};
