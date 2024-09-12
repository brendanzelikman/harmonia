import { POSE_HOTKEYS } from "features/Editor/PoseEditor/hooks/usePoseEditorHotkeys";
import { Shortcut } from "../components/Shortcut";
import { ShortcutContent } from "../components/ShortcutContent";
import { useProjectDispatch } from "types/hooks";
import { POSE_VECTOR_HOTKEYS } from "features/Editor/PoseEditor/hooks/usePoseEditorVectorHotkeys";

export function PoseEditorShortcuts() {
  const dispatch = useProjectDispatch();
  return (
    <ShortcutContent
      className="space-y-4"
      shortcuts={[
        ...dispatch(POSE_HOTKEYS),
        ...dispatch(POSE_VECTOR_HOTKEYS),
      ].map((hotkey) => (
        <Shortcut hotkey={hotkey} />
      ))}
    />
  );
}
