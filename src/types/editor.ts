import { Duration, Note, Timing } from "./units";

export type EditorId = "file" | "scale" | "instrument" | "patterns" | "hidden";
export type EditorState = "adding" | "inserting" | "removing" | "idle";
export type EditorClipboard = {
  notes: Note[];
};

export interface Editor {
  id: EditorId;
  state: EditorState;
  show: boolean;
  selectedDuration: Duration;
  selectedTiming: Timing;
  clipboard: EditorClipboard;
}

export const defaultEditor: Editor = {
  id: "hidden",
  state: "idle",
  show: false,
  selectedDuration: "quarter",
  selectedTiming: "straight",
  clipboard: { notes: [] },
};

export const isEditor = (obj: any): obj is Editor => {
  const { id, state, show, selectedDuration, selectedTiming, clipboard } = obj;
  return (
    id !== undefined &&
    state !== undefined &&
    show !== undefined &&
    selectedDuration !== undefined &&
    selectedTiming !== undefined &&
    clipboard !== undefined
  );
};
