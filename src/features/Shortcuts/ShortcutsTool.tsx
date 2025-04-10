import { Shortcut } from "./components/ShortcutsItem";
import { ShortcutContent } from "./components/ShortcutsContent";
import {
  ArrangePatternsHotkey,
  ArrangePortalsHotkey,
  ArrangePosesHotkey,
  MergeClipsHotkey,
  SelectPatternsHotkey,
  SelectPosesHotkey,
  ToggleScissorsHotkey,
  SliceClipsHotkey,
  WaterTreeHotkey,
} from "lib/hotkeys/timeline";
import { CreateTracksHotkey } from "lib/hotkeys/track";

export function ToolShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut hotkey={CreateTracksHotkey} />,
        <Shortcut hotkey={WaterTreeHotkey} />,
        <Shortcut hotkey={ArrangePatternsHotkey} />,
        <Shortcut hotkey={ArrangePosesHotkey} />,
        <Shortcut hotkey={ArrangePortalsHotkey} />,
        <Shortcut hotkey={ToggleScissorsHotkey} />,
        <Shortcut hotkey={SelectPatternsHotkey} />,
        <Shortcut hotkey={SelectPosesHotkey} />,
        <Shortcut hotkey={MergeClipsHotkey} />,
        <Shortcut hotkey={SliceClipsHotkey} />,
      ]}
    />
  );
}
