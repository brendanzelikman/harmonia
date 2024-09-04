import { useProjectDispatch, use, useDeep } from "types/hooks";
import { useOverridingHotkeys } from "lib/react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { useAuth } from "providers/auth";
import { toggleEditor, hideEditor } from "types/Editor/EditorSlice";
import { updateMediaSelection } from "types/Timeline/TimelineSlice";
import { selectEditorView } from "types/Editor/EditorSelectors";
import {
  selectSelectedMotif,
  selectTimelineType,
} from "types/Timeline/TimelineSelectors";
import { defaultMediaSelection } from "types/Media/MediaTypes";
import { useHotkeys } from "react-hotkeys-hook";
import {
  selectCanRedoProject,
  selectCanUndoProject,
} from "types/Project/ProjectSelectors";
import { createProject } from "types/Project/ProjectThunks";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import { REDO_PROJECT, UNDO_PROJECT } from "providers/store";
import { useDiary } from "types/Diary/DiaryTypes";

/** Use global hotkeys for the project */
export function useGlobalHotkeys() {
  const dispatch = useProjectDispatch();
  const { isProdigy, isAtLeastRank } = useAuth();
  const navigate = useNavigate();
  const diary = useDiary();
  const type = use(selectTimelineType);
  const motif = useDeep(selectSelectedMotif);
  const isVisible = use(selectEditorView);

  // Meta + S = Save Project
  useOverridingHotkeys("meta+s");

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
    () => navigate(isAtLeastRank("maestro") ? "/projects" : "/demos"),
    [isAtLeastRank("maestro")]
  );

  // Meta + E = Toggle Editor
  useOverridingHotkeys(
    "meta+e",
    () => {
      if (motif !== undefined) {
        dispatch(toggleEditor({ data: type }));
      }
    },
    [motif, type]
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
