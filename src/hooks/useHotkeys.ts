import { useAppDispatch } from "hooks/useRedux";
import { HotkeyMap, playgroundHotkeys } from "lib/hotkeys";
import { useEffect } from "react";
import { isInputEvent } from "utils/event";
import { useToggle } from "./useToggle";
import { ToggleKeyboardHotkey } from "lib/hotkeys/global";

type HotkeyEvent = "keydown" | "keypress" | "keyup";

export function useHotkeys(
  hotkeyMap: HotkeyMap,
  event: HotkeyEvent = "keydown",
  scope: string = "all"
) {
  const dispatch = useAppDispatch();
  const onKeyboard = useToggle(`keyboard`).isOpen;
  const outOfScope = onKeyboard !== (scope === "keyboard");
  const disabled = scope !== "all" && outOfScope;

  useEffect(() => {
    // Register non-input keydown event listener
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isInputEvent(event) || event.repeat) return;
      const { key, metaKey, shiftKey, ctrlKey, altKey } = event;

      // Construct the combination key string
      let comboKey = key.toLowerCase();
      if (shiftKey && key !== "Shift") comboKey = "shift+" + comboKey;
      if (metaKey && key !== "Meta") comboKey = "meta+" + comboKey;
      if (ctrlKey && key !== "Ctrl") comboKey = "ctrl+" + comboKey;
      if (altKey && key !== "Alt") comboKey = "alt+" + comboKey;

      // Check if the hotkeys are disabled
      if (disabled && comboKey !== ToggleKeyboardHotkey.shortcut) return;

      // Check if the combo exists in the hotkey map
      const action = (hotkeyMap ?? playgroundHotkeys)[comboKey];
      if (action) {
        event.preventDefault();
        action(dispatch, event);
      }
    };

    // Add the event listener
    document.addEventListener(event, handleKeyPress);

    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener(event, handleKeyPress);
    };
  }, [hotkeyMap, disabled, dispatch, scope]);
}
