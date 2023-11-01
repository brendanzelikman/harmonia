import { Editor } from "./EditorTypes";

// ------------------------------------------------------------
// Editor View
// ------------------------------------------------------------

/** Checks if the editor is active with any view. */
export const isEditorOpen = (editor: Editor) => {
  return !!editor.view;
};

/** Checks if the pattern editor is active. */
export const isPatternEditorOpen = (editor: Editor) => {
  return editor.view === "patterns";
};

/** Checks if the scale editor is active. */
export const isScaleEditorOpen = (editor: Editor) => {
  return editor.view === "scale";
};

/** Checks if the instrument editor is active. */
export const isInstrumentEditorOpen = (editor: Editor) => {
  return editor.view === "instrument";
};

/** Checks if the file editor is active. */
export const isFileEditorOpen = (editor: Editor) => {
  return editor.view === "file";
};

/** Checks if the editor is on a visible view. */
export const isEditorVisible = (editor: Editor) => {
  return !!editor.view && editor.view !== "file";
};

// ------------------------------------------------------------
// Editor Action
// ------------------------------------------------------------

/** Checks if the editor is adding notes. */
export const isEditorAddingNotes = (editor: Editor) => {
  return editor.action === "addingNotes";
};

/** Checks if the editor is inserting notes. */
export const isEditorInsertingNotes = (editor: Editor) => {
  return editor.action === "insertingNotes";
};

/** Checks if the editor is removing notes. */
export const isEditorRemovingNotes = (editor: Editor) => {
  return editor.action === "removingNotes";
};

//** Checks if the editor is idle. */
export const isEditorIdle = (editor: Editor) => {
  return editor.action === undefined;
};

// ------------------------------------------------------------
// Editor Global Settings
// ------------------------------------------------------------

/** Checks if the editor is showing presets. */
export const isEditorShowingSidebar = (editor: Editor) => {
  return editor.settings.global.showSidebar;
};

/** Checks if the editor is showing tooltips. */
export const isEditorShowingTooltips = (editor: Editor) => {
  return editor.settings.global.showTooltips;
};

/** Checks if the editor is showing tracks. */
export const isEditorShowingTracks = (editor: Editor) => {
  return editor.settings.global.showTracks;
};

/** Checks if the editor is showing the piano. */
export const isEditorShowingPiano = (editor: Editor) => {
  return editor.settings.global.showPiano;
};
