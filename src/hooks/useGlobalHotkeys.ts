import { useAppSelector, useAppDispatch } from "redux/hooks";
import { selectEditor } from "redux/selectors";
import { clearState, readFiles, saveStateToFile } from "redux/util";
import { hideEditor } from "redux/Editor";
import { deselectAllClips, deselectAllTranspositions } from "redux/Root";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";

export default function useGlobalHotkeys() {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(selectEditor);

  // Meta + S = Save Project
  useOverridingHotkeys("meta+s", saveStateToFile);

  // Meta + O = Open Project
  useOverridingHotkeys("meta+o", readFiles);

  // Meta + Alt + N = New Project
  useOverridingHotkeys("meta+alt+n", clearState);

  // Escape = Hide Editor
  useOverridingHotkeys(
    "escape",
    () => {
      if (editor.show) {
        dispatch(hideEditor());
      } else {
        dispatch(deselectAllClips());
        dispatch(deselectAllTranspositions());
      }
    },
    [editor.show, editor.id]
  );
}
