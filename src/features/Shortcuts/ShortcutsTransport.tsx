import { Shortcut } from "./components/ShortcutsItem";
import { ShortcutContent } from "./components/ShortcutsContent";
import {
  DebugTransportHotkey,
  LoopTransportHotkey,
  MuteTransportHotkey,
  RecordTransportHotkey,
  StopTransportHotkey,
  ToggleTransportHotkey,
} from "lib/hotkeys/transport";
import {
  _MoveLeftHotkey,
  _MoveRightHotkey,
  _ScrubLeftHotkey,
  _ScrubRightHotkey,
} from "lib/hotkeys/selection";

export function TransportShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut hotkey={ToggleTransportHotkey} />,
        <Shortcut hotkey={StopTransportHotkey} />,
        <Shortcut hotkey={_MoveLeftHotkey} />,
        <Shortcut hotkey={_MoveRightHotkey} />,
        <Shortcut hotkey={_ScrubLeftHotkey} />,
        <Shortcut hotkey={_ScrubRightHotkey} />,
        <Shortcut hotkey={LoopTransportHotkey} />,
        <Shortcut hotkey={MuteTransportHotkey} />,
        <Shortcut hotkey={RecordTransportHotkey} />,
        <Shortcut hotkey={DebugTransportHotkey} />,
      ]}
    />
  );
}
