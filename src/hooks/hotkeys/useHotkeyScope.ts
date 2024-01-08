import { useEffect } from "react";
import { useHotkeysContext } from "react-hotkeys-hook";
import { selectEditor } from "redux/Editor";
import { useProjectSelector } from "redux/hooks";
import { isEditorVisible } from "types/Editor";

/** Use a current hotkey scope and disable the timeline */
export function useHotkeyScope(scope: string) {
  const hotkeys = useHotkeysContext();
  const editor = useProjectSelector(selectEditor);
  const isVisible = isEditorVisible(editor);

  // Update the hotkey scope when the editor is visible
  useEffect(() => {
    if (!isVisible) return;

    // Remove the timeline scope when the editor is shown
    hotkeys.enableScope(scope);
    hotkeys.disableScope("timeline");

    // Enable the timeline scope when the editor is hidden
    return () => {
      hotkeys.disableScope(scope);
      hotkeys.enableScope("timeline");
    };
  }, [isVisible]);
}
