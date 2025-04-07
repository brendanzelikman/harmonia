import {
  SAVE_PROJECT_HOTKEY,
  OPEN_PROJECT_HOTKEY,
  UNDO_PROJECT_HOTKEY,
  REDO_PROJECT_HOTKEY,
  TOGGLE_DIARY_HOTKEY,
  TOGGLE_SHORTCUTS_HOTKEY,
  CLOSE_MODALS_HOTKEY,
  EXPORT_MIDI_HOTKEY,
  EXPORT_AUDIO_HOTKEY,
} from "pages/Playground/hotkeys/usePlaygroundHotkeys";
import { TOGGLE_FOREST_HOTKEY } from "pages/Playground/hotkeys/useTimelineHotkeys";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import { useDispatch } from "types/hooks";

export function GlobalShortcuts() {
  const dispatch = useDispatch();
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut hotkey={dispatch(SAVE_PROJECT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(OPEN_PROJECT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(UNDO_PROJECT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(REDO_PROJECT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(TOGGLE_DIARY_HOTKEY)} />,
        <Shortcut hotkey={dispatch(TOGGLE_FOREST_HOTKEY)} />,
        <Shortcut hotkey={dispatch(TOGGLE_SHORTCUTS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(CLOSE_MODALS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(EXPORT_MIDI_HOTKEY)} />,
        <Shortcut hotkey={dispatch(EXPORT_AUDIO_HOTKEY)} />,
      ]}
    />
  );
}
