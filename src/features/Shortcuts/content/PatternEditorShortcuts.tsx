import { useProjectDispatch } from "types/hooks";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import { PATTERN_HOTKEYS } from "features/Editor/PatternEditor/hooks/usePatternEditorHotkeys";

export function PatternEditorShortcuts() {
  const dispatch = useProjectDispatch();
  return (
    <ShortcutContent
      className="space-y-1"
      shortcuts={dispatch(PATTERN_HOTKEYS).map((hotkey) => (
        <Shortcut hotkey={hotkey} />
      ))}
    />
  );
}
