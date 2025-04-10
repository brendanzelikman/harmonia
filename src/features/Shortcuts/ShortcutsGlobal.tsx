import { Shortcut } from "./components/ShortcutsItem";
import { ShortcutContent } from "./components/ShortcutsContent";
import {
  ToggleDiaryHotkey,
  ToggleShortcutsHotkey,
  CloseModalsHotkey,
  ToggleTerminalHotkey,
} from "lib/hotkeys/global";
import {
  SaveJsonHotkey,
  OpenProjectHotkey,
  UndoProjectHotkey,
  RedoProjectHotkey,
  SaveMidiHotkey,
  SaveWavHotkey,
} from "lib/hotkeys/project";

export function GlobalShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut hotkey={SaveJsonHotkey} />,
        <Shortcut hotkey={OpenProjectHotkey} />,
        <Shortcut hotkey={UndoProjectHotkey} />,
        <Shortcut hotkey={RedoProjectHotkey} />,
        <Shortcut hotkey={ToggleDiaryHotkey} />,
        <Shortcut hotkey={ToggleTerminalHotkey} />,
        <Shortcut hotkey={ToggleShortcutsHotkey} />,
        <Shortcut hotkey={CloseModalsHotkey} />,
        <Shortcut hotkey={SaveMidiHotkey} />,
        <Shortcut hotkey={SaveWavHotkey} />,
      ]}
    />
  );
}
