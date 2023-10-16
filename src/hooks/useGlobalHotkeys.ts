import { useAppSelector, useAppDispatch } from "redux/hooks";
import { selectEditor } from "redux/selectors";
import { hideEditor } from "redux/Editor";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { updateMediaSelection } from "redux/Timeline";
import {
  exportProjectToHAM,
  openLocalProjects,
  clearProject,
} from "redux/thunks";

export default function useGlobalHotkeys() {
  const dispatch = useAppDispatch();
  const editor = useAppSelector(selectEditor);

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
      if (editor.show) {
        dispatch(hideEditor());
      } else {
        dispatch(updateMediaSelection({ clipIds: [], transpositionIds: [] }));
      }
    },
    [editor.show]
  );
}
