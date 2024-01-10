import { useEffect } from "react";
import { useHotkeysContext } from "react-hotkeys-hook";

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
