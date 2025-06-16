import { useAppDispatch } from "hooks/useRedux";
import { HotkeyMap } from "lib/hotkeys";
import { useEffect } from "react";
import { isInputEvent } from "utils/event";

type HotkeyEvent = "keydown" | "keypress" | "keyup";

export function useHotkeys(
  hotkeyMap: HotkeyMap,
  event: HotkeyEvent = "keydown"
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Register non-input keydown event listener
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isInputEvent(event) || event.repeat) return;
      const { key, metaKey, shiftKey, ctrlKey, altKey } = event;

      // Construct the combination key string
      let comboKey = key.toLowerCase();
      if (shiftKey && key !== "Shift") comboKey = "shift+" + comboKey;
      if (metaKey && key !== "Meta") comboKey = "meta+" + comboKey;
      else if (ctrlKey && key !== "Ctrl") comboKey = "meta+" + comboKey;
      if (altKey && key !== "Alt") comboKey = "alt+" + comboKey;

      // Check if the combo exists in the hotkey map
      const action = (hotkeyMap ?? hotkeyMap)[comboKey];
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
  }, [hotkeyMap, dispatch]);
}
