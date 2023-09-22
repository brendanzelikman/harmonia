import { MIDI } from "./midi";
import { Duration, Note, Tick, Timing, Velocity } from "./units";

export type EditorId = "file" | "scale" | "instrument" | "patterns" | "hidden";
export type EditorState = "adding" | "inserting" | "removing" | "idle";
export type EditorClipboard = {
  notes: Note[];
};

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

  clipboard: EditorClipboard;
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

  clipboard: { notes: [] },
};

export const isEditor = (obj: any): obj is Editor => {
  const { id, state, show } = obj;
  return id !== undefined && state !== undefined && show !== undefined;
};

export const isEditorOn = (editor: Editor, id: EditorId) =>
  editor.show && editor.id === id;
