import { isArray, omit, pick } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { isInputEvent } from "utils/event";

/** Create a record storing a map of keys to press states */
export const useHeldKeys = (keys: string[]) => {
  const keyset: Set<string> = useMemo(
    () => new Set(Object.values(pick(KeyCodeMap, keys))),
    []
  );
  const [heldKeys, setHeldKeys] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Add the key to the record on keypress
    const add = (e: KeyboardEvent) => {
      if (isInputEvent(e) || e.repeat) return;
      if (keyset.has(e.code)) {
        setHeldKeys((prev) => ({ ...prev, [e.code]: true }));
        window.localStorage.setItem(`holding-${e.code}`, "true");
      }
    };

    // Add the shift key to the record on keydown
    const addModifiers = (e: KeyboardEvent) => {
      if (isInputEvent(e) || e.repeat) return;
      if (specialKeySet.has(e.key)) {
        setHeldKeys((prev) => ({ ...prev, [e.code]: true }));
        window.localStorage.setItem(`holding-${e.code}`, "true");
      }
    };

    // Remove the key from the record on keyup
    const remove = (e: KeyboardEvent) => {
      if (keyset.has(e.code)) {
        setHeldKeys((prev) => omit(prev, e.code));
        window.localStorage.removeItem(`holding-${e.code}`);
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
    document.addEventListener("keypress", add);
    document.addEventListener("keydown", addModifiers);
    document.addEventListener("keyup", remove);
    window.addEventListener("blur", clear);
    // window.addEventListener("visibilitychange", clear);

    // Cleanup the event listeners
    return () => {
      document.removeEventListener("keydown", add);
      document.removeEventListener("keyup", remove);
      window.removeEventListener("blur", clear);
      // window.removeEventListener("visibilitychange", clear);
      clear();
    };
  }, []);

  return heldKeys;
};

/** Read the value of a key from local storage */
export const getHeldKey = (key: string) => {
  const code = getKeyCode(key);
  return window.localStorage.getItem(`holding-${code}`) === "true";
};

const specialKeySet = new Set(["Control", "Shift", "Alt", "Meta"]);

// Keys are mapped to codes to avoid issues with modifiers
const KeyCodeMap: Record<string, string> = {
  q: "KeyQ",
  w: "KeyW",
  e: "KeyE",
  r: "KeyR",
  t: "KeyT",
  y: "KeyY",
  u: "KeyU",
  i: "KeyI",
  o: "KeyO",
  p: "KeyP",
  a: "KeyA",
  s: "KeyS",
  d: "KeyD",
  f: "KeyF",
  g: "KeyG",
  h: "KeyH",
  j: "KeyJ",
  k: "KeyK",
  l: "KeyL",
  z: "KeyZ",
  x: "KeyX",
  c: "KeyC",
  v: "KeyV",
  b: "KeyB",
  n: "KeyN",
  m: "KeyM",
  "0": "Digit0",
  "1": "Digit1",
  "2": "Digit2",
  "3": "Digit3",
  "4": "Digit4",
  "5": "Digit5",
  "6": "Digit6",
  "7": "Digit7",
  "8": "Digit8",
  "9": "Digit9",
  " ": "Space",
  control: "ControlLeft",
  alt: "AltLeft",
  meta: "MetaLeft",
  shift: "ShiftLeft",
  rightshift: "ShiftRight",
  "`": "Backquote",
  ",": "Comma",
  ".": "Period",
  "/": "Slash",
  ";": "Semicolon",
  "'": "Quote",
  "-": "Minus",
  "=": "Equal",
  "[": "BracketLeft",
  "]": "BracketRight",
  "\\": "Backslash",
};

export const getKeyCode = (key: string) => KeyCodeMap[key] ?? key;
export const isHolding = (
  map: Record<string, boolean>,
  keys: string | string[],
  strict = false
) =>
  (isArray(keys)
    ? strict
      ? keys.every((key) => !!map[getKeyCode(key)])
      : keys.some((key) => !!map[getKeyCode(key)])
    : !!map[getKeyCode(keys)]) ||
  !!window.localStorage.getItem(`holding-${keys}`);
