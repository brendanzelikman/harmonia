import { Editor } from "./EditorTypes";

// ------------------------------------------------------------
// Editor View
// ------------------------------------------------------------

/** Checks if the editor is active with any view. */
export const isEditorOpen = (editor: Editor) => {
  return !!editor.view;
};

/** Checks if the pattern editor is open. */
export const isPatternEditorOpen = (editor: Editor) => {
  return editor.view === "pattern";
};

/** Checks if the scale editor is open. */
export const isScaleEditorOpen = (editor: Editor) => {
  return editor.view === "scale";
};

/** Checks if the instrument editor is open. */
export const isInstrumentEditorOpen = (editor: Editor) => {
  return editor.view === "instrument";
};

/** Checks if the editor is on a visible view. */
export const isEditorVisible = (editor: Editor) => {
  return !!editor.view;
};

/** Get the editor with the user idled. */
export const getIdleEditor = (editor: Editor): Editor => ({
  ...editor,
  view: undefined,
});

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
