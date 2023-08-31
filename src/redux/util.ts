import { ID } from "types/units";
import { RootState } from "./store";
import { isRoot } from "types/root";
import { isEditor } from "types/editor";
import { isTimeline } from "types/timeline";
import { isTransport } from "types/transport";

export const isRootState = (obj: any): obj is RootState => {
  const { session, scales, patterns, root, editor, timeline, transport } = obj;

  // Validate session
  if (!session?.present) return false;
  const { clips, transforms, patternTracks, scaleTracks } = session.present;
  if (!isNormalizedState(clips)) return false;
  if (!isNormalizedState(transforms)) return false;
  if (!isNormalizedState(patternTracks)) return false;
  if (!isNormalizedState(scaleTracks)) return false;

  // Validate scales
  if (!scales?.present) return false;
  if (!isNormalizedState(scales.present)) return false;

  // Validate patterns
  if (!patterns?.present) return false;
  if (!isNormalizedState(patterns.present)) return false;

  // Validate editor
  if (!editor) return false;
  if (!isEditor(editor)) return false;

  // Validate root
  if (!root) return false;
  if (!isRoot(root)) return false;

  // Validate timeline
  if (!timeline) return false;
  if (!isTimeline(timeline)) return false;

  // Validate transport
  if (!transport) return false;
  if (!isTransport(transport)) return false;

  // Return true if all validations pass
  return true;
};

// Create a normalized state with a Record of IDs and an array of IDs
export interface NormalizedState<K extends ID, V> {
  byId: Record<K, V>;
  allIds: K[];
}

export const isNormalizedState = <K extends ID, V>(
  obj: any
): obj is NormalizedState<K, V> => {
  const { byId, allIds } = obj;
  return byId !== undefined && allIds !== undefined;
};

// Create a normalized state with a potential set of initial values
export const initializeState = <K extends ID, V extends { id: ID }>(
  initialValues?: V[]
): NormalizedState<K, V> => {
  if (!initialValues) return { byId: {} as Record<K, V>, allIds: [] };
  const allIds = initialValues.map((value) => value.id as K) ?? [];
  const byId =
    initialValues?.reduce((acc, value) => {
      acc[value.id as K] = value;
      return acc;
    }, {} as Record<K, V>) ?? ({} as Record<K, V>);

  return { byId, allIds };
};

// Save the state to local storage
export const saveState = (state: RootState) => {
  try {
    const editedState = {
      ...state,
      transport: {
        ...state.transport,
        state: "stopped",
        loaded: false,
        tick: 0,
      },
      timeline: {
        ...state.timeline,
        state: "idle",
        draggingClip: false,
        draggingTransform: false,
      },
      editor: {
        ...state.editor,
        id: "hidden",
        state: "idle",
        show: false,
      },
      session: { past: [], present: state.session.present, future: [] },
      scales: { past: [], present: state.scales.present, future: [] },
      patterns: { past: [], present: state.patterns.present, future: [] },
    };
    if (!isRootState(editedState)) return;
    const serializedState = JSON.stringify(editedState);
    localStorage.setItem("state", serializedState);
  } catch (e) {
    console.log(e);
  }
};
// Export the state to a file
export const saveStateToFile = () => {
  try {
    const serializedState = localStorage.getItem("state");
    if (!serializedState) return;
    const blob = new Blob([serializedState], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const state: RootState = JSON.parse(serializedState);
    link.download = `${state?.root?.projectName ?? "file"}.ham`;
    document.body.appendChild(link);
    link.href = url;
    link.click();
    document.body.removeChild(link);
  } catch (e) {
    console.log(e);
  }
};

// Load the state from local storage
export const loadState = () => {
  try {
    const serializedState = localStorage.getItem("state");
    if (!serializedState) return undefined;
    if (!isRootState(JSON.parse(serializedState))) {
      alert("Invalid file!");
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

// Start reading files from the file system
export const readFiles = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".ham";
  input.addEventListener("change", (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      loadStateFromFile(file);
    }
  });
  input.click();
};

// Load the state from a file
export const loadStateFromString = (state: string) => {
  try {
    const parsedState = JSON.parse(state);
    if (!isRootState(parsedState)) {
      alert("Invalid file!");
      return undefined;
    }
    saveState(parsedState);
    window.location.reload();
  } catch (e) {
    console.log(e);
  }
};

export const loadStateFromFile = (file: File) => {
  try {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const serializedState = e.target.result as string;
        const state = JSON.parse(serializedState);
        if (!state || !isRootState(state)) {
          alert("Invalid file!");
          return undefined;
        }
        saveState(state);
        window.location.reload();
      }
    };
    reader.readAsText(file);
  } catch (e) {
    console.log(e);
    return undefined;
  }
};

// Clear the state from local storage
export const clearState = () => {
  try {
    localStorage.removeItem("state");
    location.reload();
  } catch (e) {
    console.log(e);
  }
};
