import { useState } from "react";

export interface EditorState<T> {
  state: T | undefined;
  setState: (arg: T) => void;
  onState: (arg: T) => boolean;
  clearState: () => void;
}
export default function useEditorState<T>(defaultState?: T): EditorState<T> {
  const [state, setState] = useState<T | undefined>(defaultState);
  const onState = (arg: T) => state === arg;
  const clearState = () => setState(undefined);
  return { state, setState, onState, clearState };
}
