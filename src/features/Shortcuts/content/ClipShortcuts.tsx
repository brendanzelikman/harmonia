import { useDispatch } from "types/hooks";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import {
  CLOSE_ALL_CLIPS_HOTKEY,
  COPY_MEDIA_HOTKEY,
  CUT_MEDIA_HOTKEY,
  DELETE_MEDIA_HOTKEY,
  DUPLICATE_MEDIA_HOTKEY,
  MOVE_CLIPS_DOWN_HOTKEY,
  MOVE_CLIPS_UP_HOTKEY,
  MOVE_CLIPS_LEFT_HOTKEY,
  MOVE_CLIPS_RIGHT_HOTKEY,
  PASTE_MEDIA_HOTKEY,
  SELECT_ALL_MEDIA_HOTKEY,
} from "pages/Playground/hotkeys/useTimelineHotkeys";

export function ClipShortcuts() {
  const dispatch = useDispatch();
  return (
    <ShortcutContent
      className="text-lg space-y-5"
      shortcuts={[
        <Shortcut hotkey={dispatch(SELECT_ALL_MEDIA_HOTKEY)} />,
        <Shortcut hotkey={dispatch(CLOSE_ALL_CLIPS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(MOVE_CLIPS_LEFT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(MOVE_CLIPS_RIGHT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(MOVE_CLIPS_UP_HOTKEY)} />,
        <Shortcut hotkey={dispatch(MOVE_CLIPS_DOWN_HOTKEY)} />,
        <Shortcut hotkey={dispatch(COPY_MEDIA_HOTKEY)} />,
        <Shortcut hotkey={dispatch(CUT_MEDIA_HOTKEY)} />,
        <Shortcut hotkey={dispatch(PASTE_MEDIA_HOTKEY)} />,
        <Shortcut hotkey={dispatch(DUPLICATE_MEDIA_HOTKEY)} />,
        <Shortcut hotkey={dispatch(DELETE_MEDIA_HOTKEY)} />,
      ]}
    />
  );
}
