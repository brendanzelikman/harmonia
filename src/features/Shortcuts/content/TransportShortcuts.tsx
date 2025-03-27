import { useProjectDispatch } from "types/hooks";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import {
  DEBUG_TRANSPORT_HOTKEY,
  LOOP_TRANSPORT_HOTKEY,
  MUTE_TRANSPORT_HOTKEY,
  RECORD_TRANSPORT_HOTKEY,
  STOP_TRANSPORT_HOTKEY,
  TOGGLE_TRANSPORT_HOTKEY,
} from "features/Playground/hooks/usePlaygroundHotkeys";
import {
  MOVE_LEFT_HOTKEY,
  MOVE_RIGHT_HOTKEY,
  SCRUB_LEFT_HOTKEY,
  SCRUB_RIGHT_HOTKEY,
} from "features/Timeline/hooks/useTimelineHotkeys";

export function TransportShortcuts() {
  const dispatch = useProjectDispatch();
  return (
    <ShortcutContent
      className="text-lg space-y-6"
      shortcuts={[
        <Shortcut hotkey={dispatch(TOGGLE_TRANSPORT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(STOP_TRANSPORT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(MOVE_LEFT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(MOVE_RIGHT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SCRUB_LEFT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(SCRUB_RIGHT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(LOOP_TRANSPORT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(MUTE_TRANSPORT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(RECORD_TRANSPORT_HOTKEY)} />,
        <Shortcut hotkey={dispatch(DEBUG_TRANSPORT_HOTKEY)} />,
      ]}
    />
  );
}
