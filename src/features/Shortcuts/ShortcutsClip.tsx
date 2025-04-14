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
  _MoveClipsHotkey,
  _UnselectClipsHotkey,
  SelectClipsHotkey,
} from "lib/hotkeys/selection";
import { SelectPatternsHotkey, SelectPosesHotkey } from "lib/hotkeys/timeline";

export function ClipShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-5"
      shortcuts={[
        <Shortcut hotkey={SelectClipsHotkey} />,
        <Shortcut hotkey={SelectPatternsHotkey} />,
        <Shortcut hotkey={SelectPosesHotkey} />,
        <Shortcut hotkey={_UnselectClipsHotkey} />,
        <Shortcut hotkey={_MoveClipsHotkey} />,
        <Shortcut hotkey={CopyClipsHotkey} />,
        <Shortcut hotkey={CutClipsHotkey} />,
        <Shortcut hotkey={PasteClipsHotkey} />,
        <Shortcut hotkey={DuplicateClipsHotkey} />,
        <Shortcut hotkey={DeleteClipsHotkey} />,
      ]}
    />
  );
}
