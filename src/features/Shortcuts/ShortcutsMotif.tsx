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
  SampleProject,
} from "lib/hotkeys/timeline";
import { CreateRandomTreeHotkey, CreateTreeHotkey } from "lib/hotkeys/track";

export function ToolShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut hotkey={CreateTreeHotkey} />,
        <Shortcut hotkey={CreateRandomTreeHotkey} />,
        <Shortcut hotkey={ArrangePatternsHotkey} />,
        <Shortcut hotkey={ArrangePosesHotkey} />,
        <Shortcut hotkey={WaterTreeHotkey} />,
        <Shortcut hotkey={SampleProject} />,
        <Shortcut hotkey={ArrangePortalsHotkey} />,
        <Shortcut hotkey={ToggleScissorsHotkey} />,
        <Shortcut hotkey={MergeClipsHotkey} />,
        <Shortcut hotkey={SliceClipsHotkey} />,
      ]}
    />
  );
}
