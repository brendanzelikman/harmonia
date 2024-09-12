import { useProjectDispatch } from "types/hooks";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import { SCALE_HOTKEYS } from "features/Editor/ScaleEditor/hooks/useScaleEditorHotkeys";

export function ScaleEditorShortcuts() {
  const dispatch = useProjectDispatch();
  return (
    <ShortcutContent
      className="text-lg space-y-4"
      shortcuts={dispatch(SCALE_HOTKEYS).map((hotkey) => (
        <Shortcut hotkey={hotkey} />
      ))}
    />
  );
}
