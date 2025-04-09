import { useDispatch } from "hooks/useStore";
import { Shortcut } from "./components/ShortcutsItem";
import { ShortcutContent } from "./components/ShortcutsContent";
import {
  ARRANGE_PATTERNS_HOTKEY,
  ARRANGE_PORTALS_HOTKEY,
  ARRANGE_POSES_HOTKEY,
  CREATE_NEW_TREE_HOTKEY,
  MERGE_MEDIA_HOTKEY,
  SELECT_TRACK_PATTERNS_HOTKEY,
  SELECT_TRACK_POSES_HOTKEY,
  SLICE_CLIPS_HOTKEY,
  SLICE_CLIPS_IN_HALF_HOTKEY,
  TOGGLE_LIVE_PLAY_HOTKEY,
} from "features/Playground/useTimelineHotkeys";

export function ToolShortcuts() {
  const dispatch = useDispatch();
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut hotkey={dispatch(CREATE_NEW_TREE_HOTKEY)} />,
        <Shortcut hotkey={dispatch(TOGGLE_LIVE_PLAY_HOTKEY)} />,
        <Shortcut hotkey={dispatch(ARRANGE_PATTERNS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(ARRANGE_POSES_HOTKEY)} />,
        <Shortcut hotkey={dispatch(ARRANGE_PORTALS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SLICE_CLIPS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SELECT_TRACK_PATTERNS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SELECT_TRACK_POSES_HOTKEY)} />,
        <Shortcut hotkey={dispatch(MERGE_MEDIA_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SLICE_CLIPS_IN_HALF_HOTKEY)} />,
      ]}
    />
  );
}
