import { useProjectDispatch } from "types/hooks";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import {
  COLLAPSE_TRACK_CHILDREN_HOTKEY,
  COLLAPSE_TRACK_HOTKEY,
  COLLAPSE_TRACK_PARENTS_HOTKEY,
  CREATE_NEW_MOTIF_HOTKEY,
  CREATE_PATTERN_TRACK_HOTKEY,
  CREATE_SCALE_TRACK_HOTKEY,
  DELETE_TRACK_HOTKEY,
  INSERT_PARENT_TRACK_HOTKEY,
  SELECT_NEXT_TRACK_HOTKEY,
  SELECT_PREVIOUS_TRACK_HOTKEY,
  TOGGLE_MOTIF_HOTKEY,
} from "features/Timeline/hooks/useTimelineHotkeys";
import { TOGGLE_EDITOR_HOTKEY } from "features/Playground/hooks/usePlaygroundHotkeys";

export function TrackShortcuts() {
  const dispatch = useProjectDispatch();
  return (
    <ShortcutContent
      className="text-lg space-y-4"
      shortcuts={[
        <Shortcut hotkey={dispatch(CREATE_PATTERN_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(CREATE_SCALE_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(INSERT_PARENT_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(COLLAPSE_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(COLLAPSE_TRACK_PARENTS_HOTKEY)} />,
        <Shortcut hotkey={dispatch(COLLAPSE_TRACK_CHILDREN_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SELECT_PREVIOUS_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SELECT_NEXT_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(DELETE_TRACK_HOTKEY)} />,
        <Shortcut hotkey={dispatch(TOGGLE_MOTIF_HOTKEY)} />,
        <Shortcut hotkey={dispatch(CREATE_NEW_MOTIF_HOTKEY)} />,
        <Shortcut hotkey={dispatch(TOGGLE_EDITOR_HOTKEY)} />,
      ]}
    />
  );
}
