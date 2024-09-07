import { DurationType, WholeNoteTicks } from "utils/durations";
import { Tick, Velocity } from "../units";
import { DEFAULT_VELOCITY } from "utils/constants";
import { isPlainObject, isUndefined } from "lodash";
import { TrackId } from "types/Track/TrackTypes";

// ------------------------------------------------------------
// Editor Definitions
// ------------------------------------------------------------

/** The editor view can be dedicated or hidden. */
export type EditorView = "pattern" | "pose" | "scale" | "instrument" | null;

/** A list of views currently supported by the editor. */
export const EDITOR_VIEWS = [
  "pattern",
  "pose",
  "scale",
  "instrument",
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

/** The editor has specific settings for the clock */
export interface EditorClockSettings {
  clockLength: number;
  tickDuration: DurationType;
  swingPercentage: number;
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
  clock: EditorClockSettings;
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

/** The editor starts with 16 sixteenth notes and even swing. */
export const defaultEditorClockSettings: EditorClockSettings = {
  clockLength: 16,
  tickDuration: "16th",
  swingPercentage: 50,
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
  clock: defaultEditorClockSettings,
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
/* Checks if a given object is of type `Editor`. */
export const isEditor = (obj: unknown): obj is Editor => {
  const candidate = obj as Editor;
  return (
    isPlainObject(candidate) &&
    isEditorView(candidate.view) &&
    isEditorAction(candidate.action) &&
    isPlainObject(candidate.settings)
  );
};
