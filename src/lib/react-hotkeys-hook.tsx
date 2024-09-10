import { isArray, isObject, noop, omit } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { Keys, useHotkeys } from "react-hotkeys-hook";
import {
  HotkeyCallback,
  OptionsOrDependencyArray,
} from "react-hotkeys-hook/dist/types";
import { useDiary } from "types/Diary/DiaryTypes";
import { selectIsEditorOpen } from "types/Editor/EditorSelectors";
import { use, useDeep } from "types/hooks";
import { isHoldingShift, isPressingLetter } from "utils/html";

// ------------------------------------------------------------
// Hotkey Scopes
// ------------------------------------------------------------

export const SCOPES = ["playground", "timeline", "editor", "diary"] as const;
export type Scope = (typeof SCOPES)[number];
export type ScopeMap = Record<Scope, boolean>;

// A hotkey can be accompanied by a name and description for documentation
export type Hotkey = {
  shortcut: string;
  callback: HotkeyCallback;
  name?: string;
  description?: string;
};

export type HotkeyFunction = (
  keys: Keys | Hotkey,
  callback?: HotkeyCallback,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
) => void;

/** A custom hook that uses a specific scope and overrides the default hotkey behavior. */
export const useScopedHotkeys =
  (scope: Scope): HotkeyFunction =>
  (keys, callback, options, dependencies) => {
    const diary = useDiary();
    const isHotkey = !!(isObject(keys) && "callback" in keys);
    const isEditorOpen = use(selectIsEditorOpen);
    const isDiaryOpen = diary.isOpen;

    // Use the callback if in scope, otherwise use a no-op
    const hotkeyShortcut = !!isHotkey ? keys.shortcut : keys;

    // Check if the current scope is in the correct state
    const isInScope = () => {
      if (scope === "editor") return isEditorOpen;
      if (scope === "diary") return isDiaryOpen;
      if (scope === "timeline") return !isEditorOpen && !isDiaryOpen;
      return true;
    };

    // Create a callback that only fires when the scope is correct
    const hotkeyCallback = () => {
      if (!isInScope) return;
      const cb = callback ?? (isHotkey ? keys.callback : noop);
      cb();
    };

    // Prevent the default behavior for all hotkeys
    const hotkeyOptions = {
      ...(isObject(options) && !("length" in options) ? options : {}),
      preventDefault: true,
    };

    // Use the dependencies if they are provided, otherwise use the options
    const hotkeyDependencies = [
      ...(isArray(options)
        ? options
        : isArray(dependencies)
        ? dependencies
        : []),
      hotkeyCallback,
    ];
    // Use the original hook
    return useHotkeys(
      hotkeyShortcut,
      hotkeyCallback,
      hotkeyOptions,
      hotkeyDependencies
    );
  };

export const useHotkeysInEditor = useScopedHotkeys("editor");
export const useHotkeysInTimeline = useScopedHotkeys("timeline");
export const useHotkeysInDiary = useScopedHotkeys("diary");
export const useHotkeysGlobally = useScopedHotkeys("playground");

// ------------------------------------------------------------
// Held Keys
// ------------------------------------------------------------

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
};

/** Custom upper case handler for special shifts. */
const upperCase = (key: string) => SHIFTED_KEY_MAP[key] || key.toUpperCase();

/** A custom hook that returns a record of keys that are currently being held down. */
export const useHeldHotkeys = (
  keys: Keys,
  options?: OptionsOrDependencyArray,
  dependencies?: OptionsOrDependencyArray
) => {
  const [heldKeys, setHeldKeys] = useState<Record<string, boolean>>({});

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
    setHeldKeys((prev) => omit(prev, upper, lower));
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

  // Compile the options
  const hotkeyOptions = useMemo(
    () => ({
      ...options,
      keydown: true,
      keyup: true,
      splitKey: "&",
      combinationKey: "*",
    }),
    [options]
  );

  // Compile the dependencies
  const hotkeyDependencies = useMemo(
    () => [dependencies, ...allKeys, callback],
    [dependencies, allKeys, callback]
  );

  // Use the original hook
  useHotkeys(allKeys, callback, hotkeyOptions, hotkeyDependencies);

  // Return the held keys
  return heldKeys;
};
