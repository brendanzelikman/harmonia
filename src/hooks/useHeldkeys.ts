import { omit } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { isInputEvent } from "utils/event";
import { useToggle } from "./useToggle";

const upperMap = {
  "~": "`",
  "!": "1",
  "@": "2",
  "#": "3",
  $: "4",
  "%": "5",
  "^": "6",
  "&": "7",
  "*": "8",
  "(": "9",
  ")": "0",
  _: "-",
  "+": "=",
  "<": ",",
  ">": ".",
  "?": "/",
} as Record<string, string>;

/** Create a record storing a map of keys to press states */
export const useHeldKeys = (keys: string[], scope: string = "global") => {
  const keyset = useMemo(() => new Set(keys), []);
  const keyboard = useToggle(`keyboard`);
  const outOfScope = keyboard.isOpen !== (scope === "keyboard");
  const disabled = scope !== "all" && outOfScope;
  const [heldKeys, setHeldKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Add the key to the record on keydown
    const add = (e: KeyboardEvent) => {
      if (disabled || isInputEvent(e) || e.repeat) return;
      const key = e.key.toLowerCase();
      if (keyset.has(key)) {
        setHeldKeys((prev) => ({ ...prev, [key]: true }));
        window.localStorage.setItem(`holding-${key}`, "true");
      }
    };

    // Remove the key from the record on keyup
    const remove = (e: KeyboardEvent) => {
      if (disabled || isInputEvent(e) || e.repeat) return;
      const key = e.key.toLowerCase();
      if (keyset.has(key)) {
        setHeldKeys((prev) => omit(prev, key));
        window.localStorage.removeItem(`holding-${key}`);
      } else {
        const upper = upperMap[key];
        if (upper && keyset.has(upper)) {
          setHeldKeys((prev) => omit(prev, upper));
          window.localStorage.removeItem(`holding-${upper}`);
        }
      }
    };

    // Clear held keys on input or when the window loses focus
    const clear = () => {
      setHeldKeys({});
      for (const key of keyset) {
        window.localStorage.removeItem(`holding-${key}`);
      }
    };

    // Add the event listeners
    document.addEventListener("keydown", add);
    document.addEventListener("keyup", remove);
    document.addEventListener("input", clear);
    window.addEventListener("blur", clear);

    // Cleanup the event listeners
    return () => {
      document.removeEventListener("keydown", add);
      document.removeEventListener("keyup", remove);
      document.removeEventListener("input", clear);
      window.removeEventListener("blur", clear);
      clear();
    };
  }, [disabled]);

  return heldKeys;
};

/** Read the value of a key from local storage */
export const getHeldKey = (key: string) => {
  return window.localStorage.getItem(`holding-${key}`) === "true";
};
