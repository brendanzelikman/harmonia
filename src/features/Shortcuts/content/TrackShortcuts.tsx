import { useProjectDispatch } from "types/hooks";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import {
  COLLAPSE_TRACK_CHILDREN_HOTKEY,
  COLLAPSE_TRACK_HOTKEY,
  COLLAPSE_TRACK_PARENTS_HOTKEY,
  DELETE_TRACK_HOTKEY,
  SELECT_NEXT_TRACK_HOTKEY,
  SELECT_PREVIOUS_TRACK_HOTKEY,
} from "features/Timeline/hooks/useTimelineHotkeys";

export function TrackShortcuts() {
  const dispatch = useProjectDispatch();
  return (
    <ShortcutContent
      className="text-lg space-y-4"
      shortcuts={[
        <Shortcut hotkey={dispatch(COLLAPSE_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(COLLAPSE_TRACK_PARENTS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(COLLAPSE_TRACK_CHILDREN_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SELECT_PREVIOUS_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SELECT_NEXT_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(DELETE_TRACK_HOTKEY)} />,
      ]}
    />
  );
}
