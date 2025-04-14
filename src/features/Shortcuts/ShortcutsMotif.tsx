import { Shortcut } from "./components/ShortcutsItem";
import { ShortcutContent } from "./components/ShortcutsContent";
import {
  ArrangePatternsHotkey,
  ArrangePortalsHotkey,
  ArrangePosesHotkey,
  MergeClipsHotkey,
  ToggleScissorsHotkey,
  SliceClipsHotkey,
  WaterTreeHotkey,
} from "lib/hotkeys/timeline";
import {
  CreateRandomTracksHotkey,
  CreateTracksHotkey,
} from "lib/hotkeys/track";

export function ToolShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut hotkey={CreateTracksHotkey} />,
        <Shortcut hotkey={CreateRandomTracksHotkey} />,
        <Shortcut hotkey={ArrangePatternsHotkey} />,
        <Shortcut hotkey={ArrangePosesHotkey} />,
        <Shortcut hotkey={WaterTreeHotkey} />,
        <Shortcut hotkey={ArrangePortalsHotkey} />,
        <Shortcut hotkey={ToggleScissorsHotkey} />,
        <Shortcut hotkey={MergeClipsHotkey} />,
        <Shortcut hotkey={SliceClipsHotkey} />,
      ]}
    />
  );
}
