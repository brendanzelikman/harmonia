import { MIDI } from "../midi";
import { Duration, Tick, Timing, Velocity } from "../units";

/**
 * The ID of an editor corresponding to the editor's view.
 * @const `file` - The file editor.
 * @const `scale` - The scale editor.
 * @const `instrument` - The instrument editor.
 * @const `patterns` - The patterns editor.
 * @const `hidden` - No editor is shown.
 */
export type EditorId = "file" | "scale" | "instrument" | "patterns" | "hidden";

/**
 * The state of an editor corresponding to the current action.
 * @const `adding` - Adding notes.
 * @const `inserting` - Inserting notes.
 * @const `removing` - Removing notes.
 * @const `idle` - No action.
 */
export type EditorState = "adding" | "inserting" | "removing" | "idle";

/**
 * The `Editor` is a dedicated view for editing specific parts of the store.
 * @property `id` - The ID of the editor.
 * @property `state` - The state of the editor.
 * @property `show` - A boolean indicating whether the editor is shown or not.
 * @property `noteDuration` - The duration of notes added to the editor.
 * @property `noteTiming` - The timing of notes added to the editor.
 * @property `noteVelocity` - The velocity of notes added to the editor.
 * @property `recordingDuration` - The duration of notes recorded to the editor.
 * @property `recordingTiming` - The timing of notes recorded to the editor.
 * @property `recordingQuantization` - The quantization of notes recorded to the editor.
 */
export interface Editor {
  id: EditorId;
  state: EditorState;
  show: boolean;

  noteDuration: Duration;
  noteTiming: Timing;
  noteVelocity: Velocity;

  recordingDuration: Tick;
  recordingTiming: Timing;
  recordingQuantization: Duration;
}

export const defaultEditor: Editor = {
  id: "hidden",
  state: "idle",
  show: false,

  noteDuration: "quarter",
  noteTiming: "straight",
  noteVelocity: MIDI.DefaultVelocity,

  recordingDuration: MIDI.WholeNoteTicks,
  recordingTiming: "straight",
  recordingQuantization: "eighth",
};

/**
 * Checks if a given object is of type `Editor`.
 * @param obj The object to check.
 * @returns True if the object is a `Editor`, otherwise false.
 */
export const isEditor = (obj: unknown): obj is Editor => {
  const candidate = obj as Editor;
  return (
    candidate?.id !== undefined &&
    candidate?.state !== undefined &&
    candidate?.show !== undefined &&
    candidate?.noteDuration !== undefined &&
    candidate?.noteTiming !== undefined &&
    candidate?.noteVelocity !== undefined &&
    candidate?.recordingDuration !== undefined &&
    candidate?.recordingTiming !== undefined &&
    candidate?.recordingQuantization !== undefined
  );
};

/**
 * Checks if an `Editor` is showing a specific ID.
 * @param editor The editor object.
 * @param id The ID to check.
 * @returns True if the editor is showing the ID, otherwise false.
 */
export const isEditorOn = (editor: Editor, id: EditorId) =>
  editor.show && editor.id === id;
