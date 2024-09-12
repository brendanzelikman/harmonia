import { useProjectDispatch } from "types/hooks";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import { INSTRUMENT_HOTKEYS } from "features/Editor/InstrumentEditor/hooks/useInstrumentEditorHotkeys";

export function InstrumentEditorShortcuts() {
  const dispatch = useProjectDispatch();
  return (
    <ShortcutContent
      className="space-y-1"
      shortcuts={dispatch(INSTRUMENT_HOTKEYS).map((hotkey) => (
        <Shortcut hotkey={hotkey} />
      ))}
    />
  );
}
