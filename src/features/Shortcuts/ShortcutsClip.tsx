import { Shortcut } from "./components/ShortcutsItem";
import { ShortcutContent } from "./components/ShortcutsContent";
import { DeleteClipsHotkey } from "lib/hotkeys/clipboard";
import {
  CopyClipsHotkey,
  CutClipsHotkey,
  DuplicateClipsHotkey,
  PasteClipsHotkey,
} from "lib/hotkeys/clipboard";
import {
  _UnselectClipsHotkey,
  MoveClipsDownHotkey,
  MoveClipsLeftHotkey,
  MoveClipsRightHotkey,
  MoveClipsUpHotkey,
  SelectClipsHotkey,
} from "lib/hotkeys/selection";

export function ClipShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-5"
      shortcuts={[
        <Shortcut hotkey={SelectClipsHotkey} />,
        <Shortcut hotkey={_UnselectClipsHotkey} />,
        <Shortcut hotkey={MoveClipsLeftHotkey} />,
        <Shortcut hotkey={MoveClipsRightHotkey} />,
        <Shortcut hotkey={MoveClipsUpHotkey} />,
        <Shortcut hotkey={MoveClipsDownHotkey} />,
        <Shortcut hotkey={CopyClipsHotkey} />,
        <Shortcut hotkey={CutClipsHotkey} />,
        <Shortcut hotkey={PasteClipsHotkey} />,
        <Shortcut hotkey={DuplicateClipsHotkey} />,
        <Shortcut hotkey={DeleteClipsHotkey} />,
      ]}
    />
  );
}
