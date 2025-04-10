import { useDispatch } from "hooks/useStore";
import { HotkeyMap, hotkeys } from "lib/hotkeys";
import { useEffect } from "react";
import { isInputEvent } from "utils/html";

export function useHotkeys(hotkeyMap: HotkeyMap) {
  const dispatch = useDispatch();
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (isInputEvent(event)) return;
      const { key, metaKey, shiftKey, ctrlKey, altKey } = event;

      // Construct the combination key string
      let comboKey = key.toLowerCase();

      if (shiftKey && key !== "Shift") comboKey = "shift+" + comboKey;
      if (metaKey && key !== "Meta") comboKey = "meta+" + comboKey;
      if (ctrlKey && key !== "Ctrl") comboKey = "ctrl+" + comboKey;
      if (altKey && key !== "Alt") comboKey = "alt+" + comboKey;

      // Check if the combo exists in the hotkey map
      const action = (hotkeyMap ?? hotkeys)[comboKey];
      if (action) {
        event.preventDefault();
        action(dispatch, event);
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  }, [dispatch]);
}
