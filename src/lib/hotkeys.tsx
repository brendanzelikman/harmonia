import { capitalize, omit } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { Keys, useHotkeys } from "react-hotkeys-hook";
import { OptionsOrDependencyArray } from "react-hotkeys-hook/dist/types";
import { useDispatch } from "hooks/useStore";
import { Thunk } from "types/Project/ProjectTypes";
import { isHoldingShift, isPressingLetter } from "utils/html";

// A hotkey can be accompanied by a name and description for documentation
export type Hotkey = {
  shortcut: string;
  callback: () => void;
  name?: string;
  description?: string;
};

// Format a shortcut
export const formatShortcut = (shortcut: string) => {
  let result = shortcut;
  result = result.replace("shift", "⇧");
  result = result.replace("alt", "⌥");
  result = result.replace("ctrl", "⌃");
  result = result.replace("meta", "⌘");
  result = result.replace("slash", "/");
  result = result.replace("comma", ",");
  result = result.replace("period", ".");
  result = result.replace("backspace", "⌫");
  result = result.replace("equal", "=");
  result = result.replace("left", "←");
  result = result.replace("right", "→");
  result = result.replace("up", "↑");
  result = result.replace("down", "↓");
  result = result.replace("`", "Tilde");
  result = capitalize(result);
  result = result.replace(/\b[a-zA-Z]\b/g, (match) => match.toUpperCase());
  result = result.replace("esc", "Escape");
  result = result.replace(/\s*\+\s*/g, " + ");
  return result;
};

// ------------------------------------------------------------
// Scoped Hotkeys
// ------------------------------------------------------------

export const useDispatchedHotkey = (keys: Thunk<Hotkey>) => {
  const dispatch = useDispatch();
  const hotkey = useMemo(() => dispatch(keys), []);
  const callback = useCallback(hotkey.callback, [hotkey]);
  useHotkeys(hotkey.shortcut, callback, [callback], { preventDefault: true });
};

// ------------------------------------------------------------
// Held Hotkeys
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
  const [holding, setHeldKeys] = useState<Record<string, boolean>>({});

  // Call the appropriate callback based on the event type
  const callback = useCallback((e: KeyboardEvent) => {
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
  return holding;
};
