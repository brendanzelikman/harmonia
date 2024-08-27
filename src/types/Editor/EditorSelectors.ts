import { createSelector } from "reselect";
import { SafeProject } from "types/Project/ProjectTypes";
import { selectSelectedClipType } from "types/Timeline/TimelineSelectors";
import { defaultEditor, Editor } from "./EditorTypes";

/** Create a safe selector for the editor. */
export const selectEditor = (project: SafeProject) =>
  (project?.present?.editor ?? defaultEditor) as Editor;

/** Select the editor view. */
export const selectEditorView = createSelector(
  selectEditor,
  (editor) => editor.view
);

/** Select the editor action. */
export const selectEditorAction = createSelector(
  selectEditor,
  (editor) => editor.action
);

/** Select the editor settings. */
export const selectEditorSettings = createSelector(
  selectEditor,
  (editor) => editor.settings
);

/** Select if the editor is open on the timeline. */
export const selectIsSelectedEditorOpen = createSelector(
  [selectEditorView, selectSelectedClipType],
  (view, type) => view === type
);
