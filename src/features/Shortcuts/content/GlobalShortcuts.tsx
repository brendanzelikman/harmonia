import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import { PLAYGROUND_HOTKEYS } from "features/Playground/hooks/usePlaygroundHotkeys";
import { useProjectDispatch } from "types/hooks";

export function GlobalShortcuts() {
  const dispatch = useProjectDispatch();
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={dispatch(PLAYGROUND_HOTKEYS).map((hotkey) => (
        <Shortcut hotkey={hotkey} />
      ))}
    />
  );
}
