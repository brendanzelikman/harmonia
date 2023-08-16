import { ID } from "types/units";
import { AppThunk, RootState } from "./store";

// Create a normalized state with a Record of IDs and an array of IDs
export interface NormalizedState<K extends ID, V> {
  byId: Record<K, V>;
  allIds: K[];
}

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
    const serializedState = JSON.stringify({
      ...state,
      transport: {
        ...state.transport,
        state: "stopped",
        loaded: false,
        time: 0,
      },
      root: {
        ...state.root,
        timelineState: "idle",
        editorState: "hidden",
        showingEditor: false,
        draggingClip: false,
      },
      timeline: { past: [], present: state.timeline.present, future: [] },
      scales: { past: [], present: state.scales.present, future: [] },
      patterns: { past: [], present: state.patterns.present, future: [] },
    });
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
