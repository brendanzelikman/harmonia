import { useMemo, useState } from "react";
import { Keys, useHotkeys } from "react-hotkeys-hook";
import {
  HotkeyCallback,
  Options,
  OptionsOrDependencyArray,
} from "react-hotkeys-hook/dist/types";
import { isHoldingShift, isLetterKey, upperCase } from "utils";

/**
 * A hook that overrides the default hotkey behavior.
 * @param keys The keys to listen for.
 * @param callback The callback to call when the keys are pressed.
 * @param options Optional. The options to pass to `useHotkeys`.
 * @param dependencies Optional. The dependencies to pass to `useHotkeys`.
 */
export const useOverridingHotkeys = (
  keys: Keys,
  callback: HotkeyCallback,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
) => {
  const hotkeyOptions =
    options && !Array.isArray(options)
      ? { ...(options as Options), preventDefault: true }
      : { preventDefault: true };

  useHotkeys(keys, callback, hotkeyOptions, dependencies);
};

/**
 * Creates a scoped hook that overrides the default hotkey behavior.
 * @returns A scoped hook that overrides the default hotkey behavior.
 */
export const useScopedHotkeys =
  (scopes: string) =>
  (
    keys: Keys,
    callback: HotkeyCallback,
    options?: OptionsOrDependencyArray,
    dependencies?: OptionsOrDependencyArray
  ) => {
    const hotkeyOptions =
      options && !Array.isArray(options)
        ? { ...(options as Options), scopes }
        : { scopes };

    useOverridingHotkeys(keys, callback, hotkeyOptions, dependencies);
  };

/**
 * A hook that returns a record of keys that are currently being held down.
 * @param keys The keys to listen for.
 * @param options The options to pass to `useHotkeys`.
 * @returns A record of keys that are currently being held down.
 */
export const useHeldHotkeys = (
  keys: Keys,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
) => {
  type KeyMap = Record<string, boolean>;
  const [heldKeys, setHeldKeys] = useState<KeyMap>({});

  // Set the key to true when it is pressed down
  const keydown = (e: KeyboardEvent) => {
    const isLetter = isLetterKey(e);
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
