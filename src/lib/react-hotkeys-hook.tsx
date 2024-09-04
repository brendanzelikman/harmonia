import { useRecordState } from "hooks/useRecordState";
import { isArray } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Keys, useHotkeys, useHotkeysContext } from "react-hotkeys-hook";
import {
  HotkeyCallback,
  OptionsOrDependencyArray,
} from "react-hotkeys-hook/dist/types";
import { isHoldingShift, isPressingLetter } from "utils/html";
import { getValueByKey } from "utils/objects";

export const SCOPES = ["timeline", "transport", "editor", "diary"] as const;
export type HotkeyScope = (typeof SCOPES)[number];

export const hotkeyScopes: Record<HotkeyScope, boolean> = {
  timeline: true,
  transport: true,
  editor: false,
  diary: false,
};

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
  (scope: HotkeyScope) =>
  (
    keys: Keys,
    callback?: HotkeyCallback,
    options?: OptionsOrDependencyArray,
    dependencies?: OptionsOrDependencyArray
  ) => {
    const scopes = useRecordState({ ...hotkeyScopes });
    const inScope = !!scopes[scope];

    const hotkeyCallback =
      !inScope || callback === undefined ? () => null : callback;
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
    return useOverridingHotkeys(
      keys,
      hotkeyCallback,
      hotkeyOptions,
      hotkeyDependencies
    );
  };

type KeyMap = Record<string, boolean>;

/** A custom hook that returns a record of keys that are currently being held down. */
export const useHeldHotkeys = (
  keys: Keys,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
) => {
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
  const callback = useCallback((e: KeyboardEvent) => {
    e.type === "keydown" ? keydown(e) : keyup(e);
  }, []);

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
    [dependencies, ...allKeys, callback]
  );

  // Return the held keys
  return heldKeys;
};

/** Use a current hotkey scope and disable the timeline */
export function useHotkeyScope(scope: string, condition: boolean) {
  const hotkeys = useHotkeysContext();

  // Update the hotkey scope
  useEffect(() => {
    if (!condition) return;

    // Remove the timeline scope when the condition is met
    hotkeys.enableScope(scope);
    hotkeys.disableScope("timeline");

    // Enable the timeline scope on cleanup
    return () => {
      hotkeys.disableScope(scope);
      hotkeys.enableScope("timeline");
    };
  }, [condition]);
}
