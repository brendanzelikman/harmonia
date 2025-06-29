import { Shortcut } from "./components/ShortcutsItem";
import { ShortcutContent } from "./components/ShortcutsContent";

import {
  CollapseTreeHotkey,
  CollapseTrackHotkey,
  DeleteTrackHotkey,
  DeselectTrackHotkey,
  InputSampleHotkey,
  InputScaleHotkey,
  SelectNextTrackHotkey,
  SelectPreviousTrackHotkey,
  SelectTrackDisplayedHotkey,
  ToggleEditorHotkey,
} from "lib/hotkeys/track";

export function TrackShortcuts() {
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut hotkey={SelectTrackDisplayedHotkey} />,
        <Shortcut hotkey={DeselectTrackHotkey} />,
        <Shortcut hotkey={SelectPreviousTrackHotkey} />,
        <Shortcut hotkey={SelectNextTrackHotkey} />,
        <Shortcut hotkey={CollapseTrackHotkey} />,
        <Shortcut hotkey={CollapseTreeHotkey} />,
        <Shortcut hotkey={InputScaleHotkey} />,
        <Shortcut hotkey={ToggleEditorHotkey} />,
        <Shortcut hotkey={InputSampleHotkey} />,
        <Shortcut hotkey={DeleteTrackHotkey} />,
      ]}
    />
  );
}
