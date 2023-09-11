import { useState } from "react";
import useEventListeners from "./useEventListeners";
import { isInputEvent, keyCode } from "utils";

export default function useKeyHolder(keys: string[] | string) {
  const [heldKeys, setHeldKeys] = useState<Record<string, boolean>>({});

  const keydown = (key: string) => (e: KeyboardEvent) => {
    if (isInputEvent(e)) return;
    if (keyCode(e.key) === keyCode(key)) {
      setHeldKeys((prev) => ({ ...prev, [key]: true }));
    }
  };
  const keyup = (key: string) => (e: KeyboardEvent) => {
    if (isInputEvent(e)) return;
    if (keyCode(e.key) === keyCode(key)) {
      setHeldKeys((prev) => ({ ...prev, [key]: false }));
    }
  };

  const keyMap =
    typeof keys === "string"
      ? {
          [keys]: {
            keydown: keydown(keys),
            keyup: keyup(keys),
          },
        }
      : keys.reduce(
          (acc, key) => ({
            ...acc,
            [key]: {
              keydown: keydown(key),
              keyup: keyup(key),
            },
          }),
          {}
        );

  useEventListeners(keyMap, []);

  return heldKeys;
}
