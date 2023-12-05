import { DurationType, WholeNoteTicks } from "utils/durations";
import { Tick, Velocity } from "../units";
import { DEFAULT_VELOCITY } from "utils/constants";
import { isBoolean, isPlainObject, isString, isUndefined } from "lodash";
import { TrackId } from "types/Track";
import { isBoundedNumber } from "types/util";

// ------------------------------------------------------------
// Editor Definitions
// ------------------------------------------------------------

/** The editor view can be dedicated or hidden. */
export type EditorView = DedicatedEditorView | HiddenEditorView;
export type DedicatedEditorView = "pattern" | "pose" | "scale" | "instrument";
export type HiddenEditorView = "file" | null;

/** A list of views currently supported by the editor. */
export const EDITOR_VIEWS = [
  "pattern",
  "pose",
  "scale",
  "instrument",
  "file",
] as EditorView[];

/** The editor can have a specific action specified. */
export type EditorAction = "addingNotes" | "insertingNotes" | "removingNotes";

/** A list of actions currently supported by the editor. */
export const EDITOR_ACTIONS = [
  "addingNotes",
  "insertingNotes",
  "removingNotes",
] as EditorAction[];

/** The editor has global settings that applies to the main content. */
export interface EditorGlobalSettings {
  showTooltips: boolean;
  showSidebar: boolean;
  showTracks: boolean;
  showPiano: boolean;
}

/** The editor has specific settings for inputting notes. */
export interface EditorNoteSettings {
  duration: DurationType;
  velocity: Velocity;
  scaleTrackId?: TrackId;
}

/** The editor has specific settings for recording notes. */
export interface EditorRecordingSettings {
  ticks: Tick;
  quantization: DurationType;
}

/** The editor has multiple kinds of settings available. */
export interface EditorSettings {
  global: EditorGlobalSettings;
  note: EditorNoteSettings;
  recording: EditorRecordingSettings;
}

/** The `Editor` is a dedicated UI for customization. */
export interface Editor {
  view?: EditorView;
  action?: EditorAction;
  settings: EditorSettings;
}

// ------------------------------------------------------------
// Editor Initialization
// ------------------------------------------------------------

/** The editor shows all components and hides tooltips by default. */
export const defaultEditorGlobalSettings: EditorGlobalSettings = {
  showSidebar: true,
  showTooltips: false,
  showTracks: true,
  showPiano: true,
};

/** The editor starts with basic quarter notes but does not lock to MIDI. */
export const defaultEditorNoteSettings: EditorNoteSettings = {
  duration: "quarter",
  velocity: DEFAULT_VELOCITY,
  scaleTrackId: undefined,
};

/** The editor starts by recording a measure of quantized eighth notes. */
export const defaultEditorRecordingSettings: EditorRecordingSettings = {
  ticks: WholeNoteTicks,
  quantization: "eighth",
};

/** The default settings are used for initialization. */
export const defaultEditorSettings: EditorSettings = {
  global: defaultEditorGlobalSettings,
  note: defaultEditorNoteSettings,
  recording: defaultEditorRecordingSettings,
};

/** The default editor is used for initialization. */
export const defaultEditor: Editor = {
  settings: defaultEditorSettings,
};

// ------------------------------------------------------------
// Editor Type Guards
// ------------------------------------------------------------

/** Checks if a given object is of type `EditorView` */
export const isEditorView = (obj: unknown): obj is EditorView => {
  const candidate = obj as EditorView;
  return (
    isUndefined(candidate) || EDITOR_VIEWS.includes(candidate as EditorView)
  );
};

/** Checks if a given object is of type `EditorAction` */
export const isEditorAction = (obj: unknown): obj is EditorAction => {
  const candidate = obj as EditorAction;
  return (
    isUndefined(candidate) || EDITOR_ACTIONS.includes(candidate as EditorAction)
  );
};

/** Checks if a given object is of type `EditorGlobalSettings` */
export const isEditorGlobalSettings = (
  obj: unknown
): obj is EditorGlobalSettings => {
  const candidate = obj as EditorGlobalSettings;
  return (
    isPlainObject(candidate) &&
    isBoolean(candidate.showTooltips) &&
    isBoolean(candidate.showSidebar) &&
    isBoolean(candidate.showTracks) &&
    isBoolean(candidate.showPiano)
  );
};

/** Checks if a given object is of type `EditorNoteSettings` */
export const isEditorNoteSettings = (
  obj: unknown
): obj is EditorNoteSettings => {
  const candidate = obj as EditorNoteSettings;
  return (
    isPlainObject(candidate) &&
    isString(candidate.duration) &&
    isBoundedNumber(candidate.velocity, 0, 127) &&
    (isUndefined(candidate.scaleTrackId) || isString(candidate.scaleTrackId))
  );
};

/** Checks if a given object is of type `EditorRecordingSettings` */
export const isEditorRecordingSettings = (
  obj: unknown
): obj is EditorRecordingSettings => {
  const candidate = obj as EditorRecordingSettings;
  return (
    isPlainObject(candidate) &&
    isBoundedNumber(candidate.ticks, 0, Infinity) &&
    isString(candidate.quantization)
  );
};

/** Checks if a given object is of type `EditorSettings` */
export const isEditorSettings = (obj: unknown): obj is EditorSettings => {
  const candidate = obj as EditorSettings;
  return (
    isPlainObject(candidate) &&
    isEditorGlobalSettings(candidate.global) &&
    isEditorNoteSettings(candidate.note) &&
    isEditorRecordingSettings(candidate.recording)
  );
};

/* Checks if a given object is of type `Editor`. */
export const isEditor = (obj: unknown): obj is Editor => {
  const candidate = obj as Editor;
  return (
    isPlainObject(candidate) &&
    isEditorView(candidate.view) &&
    isEditorAction(candidate.action) &&
    isEditorSettings(candidate.settings)
  );
};
