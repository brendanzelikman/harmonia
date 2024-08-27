import { useProjectSelector, useProjectDispatch, use } from "types/hooks";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { useSubscription } from "providers/subscription";
import { isEditorVisible } from "types/Editor/EditorFunctions";
import { toggleEditor, hideEditor } from "types/Editor/EditorSlice";
import { updateMediaSelection } from "types/Timeline/TimelineSlice";
import { selectEditor } from "types/Editor/EditorSelectors";
import {
  selectSelectedMotif,
  selectTimeline,
} from "types/Timeline/TimelineSelectors";
import { defaultMediaSelection } from "types/Media/MediaTypes";
import { useHotkeys } from "react-hotkeys-hook";
import {
  selectCanRedoProject,
  selectCanUndoProject,
} from "types/Meta/MetaSelectors";
import { createProject } from "types/Project/ProjectThunks";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import { exportProjectToHAM } from "types/Project/ProjectExporters";
import { REDO_PROJECT, UNDO_PROJECT } from "providers/store";
import { useDiary } from "types/Diary/DiaryTypes";

/** Use global hotkeys for the project */
export function useGlobalHotkeys() {
  const dispatch = useProjectDispatch();
  const { isProdigy, isAtLeastStatus } = useSubscription();
  const navigate = useNavigate();
  const diary = useDiary();
  const timeline = useProjectSelector(selectTimeline);
  const editor = useProjectSelector(selectEditor);
  const object = useProjectSelector(selectSelectedMotif);
  const isVisible = isEditorVisible(editor);

  // Meta + S = Save Project
  useOverridingHotkeys("meta+s", () => dispatch(exportProjectToHAM()));

  // Meta + O = Open Project
  useOverridingHotkeys("meta+o", () => dispatch(readLocalProjects()));

  // Meta + Z = Undo Arrangement
  const canUndo = use(selectCanUndoProject);
  useHotkeys("meta+z", () => canUndo && dispatch({ type: UNDO_PROJECT }), [
    canUndo,
  ]);

  // Meta + Shift + Z = Redo Arrangement
  const canRedo = use(selectCanRedoProject);
  useHotkeys(
    "meta+shift+z",
    () => canRedo && dispatch({ type: REDO_PROJECT }),
    [canRedo]
  );

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
    "meta+e",
    () => {
      if (object !== undefined) {
        dispatch(toggleEditor({ data: timeline.selectedClipType }));
      }
    },
    [object, timeline.selectedClipType]
  );

  // Meta + D = Toggle Diary
  useOverridingHotkeys("shift+d", diary.toggle, [diary]);

  // Escape = Hide Editor or Clear Selection
  useOverridingHotkeys(
    "esc",
    () => {
      if (isVisible) {
        dispatch(hideEditor({ data: null }));
      } else {
        dispatch(updateMediaSelection({ data: defaultMediaSelection }));
      }
    },
    [isVisible]
  );
}
