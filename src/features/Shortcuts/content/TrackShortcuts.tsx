import { useProjectDispatch } from "types/hooks";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import {
  COLLAPSE_TRACK_HOTKEY,
  DELETE_TRACK_HOTKEY,
  DESELECT_TRACK_HOTKEY,
  INPUT_SAMPLES_HOTKEY,
  INPUT_SCALES_HOTKEY,
  SELECT_NEXT_TRACK_HOTKEY,
  SELECT_PREVIOUS_TRACK_HOTKEY,
  SELECT_TRACK_HOTKEY,
  TOGGLE_EDITOR_HOTKEY,
} from "features/Timeline/hooks/useTimelineHotkeys";

export function TrackShortcuts() {
  const dispatch = useProjectDispatch();
  return (
    <ShortcutContent
      className="text-lg space-y-8"
      shortcuts={[
        <Shortcut hotkey={dispatch(SELECT_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(DESELECT_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SELECT_PREVIOUS_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SELECT_NEXT_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(COLLAPSE_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(INPUT_SCALES_HOTKEY)} />,
        <Shortcut hotkey={dispatch(TOGGLE_EDITOR_HOTKEY)} />,
        <Shortcut hotkey={dispatch(INPUT_SAMPLES_HOTKEY)} />,
        <Shortcut hotkey={dispatch(DELETE_TRACK_HOTKEY)} />,
      ]}
    />
  );
}
