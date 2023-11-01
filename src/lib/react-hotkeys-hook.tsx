import { isArray } from "lodash";
import { useMemo, useState } from "react";
import { Keys, useHotkeys } from "react-hotkeys-hook";
import {
  HotkeyCallback,
  Options,
  OptionsOrDependencyArray,
} from "react-hotkeys-hook/dist/types";
import { isHoldingShift, isPressingLetter } from "utils/html";

/** Personally keep track of shifted key transformations.  */
export const SHIFTED_KEY_MAP: Record<string, string> = {
  "1": "!",
  "2": "@",
  "3": "#",
  "4": "$",
  "5": "%",
  "6": "^",
  "7": "&",
  "8": "*",
  "9": "(",
  "-": "_",
  "=": "+",
  "`": "~",
};

/** Custom upper case handler for special shifts. */
const upperCase = (key: string) => SHIFTED_KEY_MAP[key] || key.toUpperCase();

/** A custom hook that overrides the default hotkey behavior. */
export const useOverridingHotkeys = (
  keys: Keys,
  callback?: HotkeyCallback,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
) => {
  const hotkeyCallback = callback === undefined ? () => null : callback;
  const hotkeyOptions = isArray(options)
    ? { preventDefault: true }
    : isArray(dependencies)
    ? { ...options, preventDefault: true }
    : { preventDefault: true };
  const hotkeyDependencies = isArray(options)
    ? options
    : isArray(dependencies)
    ? dependencies
    : [];

  return useHotkeys(keys, hotkeyCallback, hotkeyOptions, hotkeyDependencies);
};

/** A custom hook that uses a specific scope and overrides the default hotkey behavior. */
export const useScopedHotkeys =
  (scopes: string) =>
  (
    keys: Keys,
    callback?: HotkeyCallback,
    options?: OptionsOrDependencyArray,
    dependencies?: OptionsOrDependencyArray
  ) => {
    const hotkeyCallback = callback === undefined ? () => null : callback;
    const hotkeyOptions = isArray(options)
      ? { preventDefault: true, scopes }
      : isArray(dependencies)
      ? { ...options, preventDefault: true, scopes }
      : { preventDefault: true, scopes };
    const hotkeyDependencies = isArray(options)
      ? options
      : isArray(dependencies)
      ? dependencies
      : [];
    return useOverridingHotkeys(
      keys,
      hotkeyCallback,
      hotkeyOptions,
      hotkeyDependencies
    );
  };

/** A custom hook that returns a record of keys that are currently being held down. */
export const useHeldHotkeys = (
  keys: Keys,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
) => {
  type KeyMap = Record<string, boolean>;
  const [heldKeys, setHeldKeys] = useState<KeyMap>({});

  // Set the key to true when it is pressed down
  const keydown = (e: KeyboardEvent) => {
    const isLetter = isPressingLetter(e);
    const key = isLetter
      ? isHoldingShift(e)
        ? upperCase(e.key)
        : e.key.toLowerCase()
      : e.key.toLowerCase();
    setHeldKeys((prev) => ({ ...prev, [key]: true }));
  };

  // Set the key (and its shift variant) to false when it is released
  const keyup = (e: KeyboardEvent) => {
    const lower = e.key.toLowerCase();
    const upper = upperCase(e.key);
    setHeldKeys((prev) => ({ ...prev, [upper]: false, [lower]: false }));
  };

  // Call the appropriate callback based on the event type
  const callback = (e: KeyboardEvent) => {
    e.type === "keydown" ? keydown(e) : keyup(e);
  };

  // Parse the keys and add all shift modifiers
  const allKeys = useMemo(() => {
    if (!Array.isArray(keys)) return keys;
    return keys.reduce((acc, key) => {
      const lower = key.toLowerCase();
      const upper = `shift*${lower}`;
      return [...acc, lower, upper];
    }, [] as Keys);
  }, [keys]);

  // Use the original hook
  useHotkeys(
    allKeys,
    callback,
    {
      ...options,
      keydown: true,
      keyup: true,
      splitKey: "&",
      combinationKey: "*",
    },
    [dependencies, allKeys, callback]
  );

  // Return the held keys
  return heldKeys;
};
