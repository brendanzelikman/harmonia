import { useProjectSelector, useProjectDispatch } from "redux/hooks";
import { selectEditor } from "redux/selectors";
import { hideEditor } from "redux/Editor";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { updateMediaSelection } from "redux/Timeline";
import {
  exportProjectToHAM,
  openLocalProjects,
  clearProject,
} from "redux/thunks";
import { isEditorVisible } from "types/Editor";

/** Use global hotkeys for the project */
export function useGlobalHotkeys() {
  const dispatch = useProjectDispatch();
  const editor = useProjectSelector(selectEditor);
  const isVisible = isEditorVisible(editor);

  // Meta + S = Save Project
  useOverridingHotkeys("meta+s", () => dispatch(exportProjectToHAM()));

  // Meta + O = Open Project
  useOverridingHotkeys("meta+o", () => dispatch(openLocalProjects()));

  // Meta + Alt + N = New Project
  useOverridingHotkeys("meta+alt+n", () => dispatch(clearProject()));

  // Escape = Hide Editor
  useOverridingHotkeys(
    "escape",
    () => {
      if (isVisible) {
        dispatch(hideEditor());
      } else {
        dispatch(updateMediaSelection({ clipIds: [], transpositionIds: [] }));
      }
    },
    [isVisible]
  );
}
