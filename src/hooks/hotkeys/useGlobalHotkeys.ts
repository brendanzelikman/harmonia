import { useProjectSelector, useProjectDispatch } from "redux/hooks";
import { selectEditor } from "redux/selectors";
import { hideEditor, toggleEditor } from "redux/Editor";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";
import {
  selectTimeline,
  toggleDiary,
  updateMediaSelection,
} from "redux/Timeline";
import {
  exportProjectToHAM,
  loadFromLocalProjects,
  createProject,
} from "redux/thunks";
import { isEditorVisible } from "types/Editor";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "providers/subscription";

/** Use global hotkeys for the project */
export function useGlobalHotkeys() {
  const dispatch = useProjectDispatch();
  const { isProdigy, isAtLeastStatus } = useSubscription();
  const navigate = useNavigate();
  const timeline = useProjectSelector(selectTimeline);
  const editor = useProjectSelector(selectEditor);
  const isVisible = isEditorVisible(editor);

  // Meta + S = Save Project
  useOverridingHotkeys("meta+s", () => dispatch(exportProjectToHAM()));

  // Meta + O = Open Project
  useOverridingHotkeys("meta+o", () => dispatch(loadFromLocalProjects()));

  // Meta + Alt + N = New Project
  useOverridingHotkeys(
    "meta+alt+n",
    () => {
      if (isProdigy) return;
      createProject().then(() => location.reload());
    },
    [isProdigy]
  );

  // Meta + P = View Projects
  useOverridingHotkeys(
    "meta+shift+p",
    () => navigate(isAtLeastStatus("maestro") ? "/projects" : "/demos"),
    [isAtLeastStatus("maestro")]
  );

  // Meta + E = Toggle Editor
  useOverridingHotkeys(
    "shift+e",
    () => dispatch(toggleEditor(timeline.selectedClipType)),
    [timeline.selectedClipType]
  );

  // Meta + D = Toggle Diary
  useOverridingHotkeys("shift+d", () => dispatch(toggleDiary()), []);

  // Escape = Hide Editor or Clear Selection
  useOverridingHotkeys(
    "escape",
    () => {
      if (isVisible) {
        dispatch(hideEditor());
      } else {
        dispatch(
          updateMediaSelection({
            patternClipIds: [],
            poseClipIds: [],
            portalIds: [],
          })
        );
      }
    },
    [isVisible]
  );
}
