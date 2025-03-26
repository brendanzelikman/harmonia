import { useProjectDispatch } from "types/hooks";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import {
  ARRANGE_CLIPS_HOTKEY,
  ARRANGE_PORTALS_HOTKEY,
  CLOSE_ALL_CLIPS_HOTKEY,
  COPY_MEDIA_HOTKEY,
  CUT_MEDIA_HOTKEY,
  DELETE_MEDIA_HOTKEY,
  DUPLICATE_MEDIA_HOTKEY,
  MOVE_MEDIA_LEFT_HOTKEY,
  MOVE_MEDIA_RIGHT_HOTKEY,
  PASTE_MEDIA_HOTKEY,
  SELECT_ALL_MEDIA_HOTKEY,
  SLICE_CLIPS_HOTKEY,
} from "features/Timeline/hooks/useTimelineHotkeys";

export function MediaShortcuts() {
  const dispatch = useProjectDispatch();
  return (
    <ShortcutContent
      className="text-lg space-y-4"
      shortcuts={[
        <Shortcut hotkey={dispatch(ARRANGE_CLIPS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(ARRANGE_PORTALS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SLICE_CLIPS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SELECT_ALL_MEDIA_HOTKEY)} />,
        <Shortcut hotkey={dispatch(CLOSE_ALL_CLIPS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(MOVE_MEDIA_LEFT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(MOVE_MEDIA_RIGHT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(COPY_MEDIA_HOTKEY)} />,
        <Shortcut hotkey={dispatch(CUT_MEDIA_HOTKEY)} />,
        <Shortcut hotkey={dispatch(PASTE_MEDIA_HOTKEY)} />,
        <Shortcut hotkey={dispatch(DUPLICATE_MEDIA_HOTKEY)} />,
        <Shortcut hotkey={dispatch(DELETE_MEDIA_HOTKEY)} />,
      ]}
    />
  );
}
