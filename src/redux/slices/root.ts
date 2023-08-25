import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {
  DEFAULT_CELL_WIDTH,
  MAX_CELL_WIDTH,
  MIN_CELL_WIDTH,
} from "appConstants";
import { clamp } from "lodash";
import { Clip, ClipId } from "types/clips";
import { PatternId } from "types/patterns";
import { TrackId } from "types/tracks";
import { Transform, TransformId } from "types/transform";

// Active IDs
interface RootIds {
  selectedPatternId?: PatternId;
  selectedTrackId?: TrackId;
  selectedClipIds: ClipId[];
  selectedTransformIds: TransformId[];
}

export interface Clipboard {
  clips: Clip[];
  transforms: Transform[];
}

interface RootState {
  // Project State
  projectName: string;

  // Timeline State
  timelineState:
    | "adding"
    | "cutting"
    | "transposing"
    | "repeating"
    | "merging"
    | "idle";
  loadedTimeline: boolean;
  draggingClip: boolean;
  draggingTransform: boolean;
  cellWidth: number;
  clipboard: Clipboard;

  // Editor State
  editorState: "file" | "scale" | "patterns" | "instrument" | "hidden";
  showingEditor: boolean;

  // Shortcuts State
  showingShortcuts: boolean;
}

interface RootMerge {
  mergeName: string;
  mergeTransforms: boolean;
  mergeWithNewPattern: boolean;
}
interface RootRepeat {
  repeatCount: number;
  repeatTransforms: boolean;
  repeatWithTranspose: boolean;
}
interface RootTranspose {
  chromaticTranspose: number;
  scalarTranspose: number;
  chordalTranspose: number;
}

export type Toolkit = RootMerge & RootRepeat & RootTranspose;
interface RootToolkit {
  toolkit: Toolkit;
}

interface Root extends RootIds, RootState, RootToolkit {}

export const defaultRoot: Root = {
  projectName: "New Project",
  cellWidth: DEFAULT_CELL_WIDTH,

  // Timeline
  timelineState: "idle",
  loadedTimeline: false,

  clipboard: { clips: [], transforms: [] },
  selectedPatternId: "new-pattern",
  selectedClipIds: [],
  selectedTransformIds: [],

  draggingClip: false,
  draggingTransform: false,

  editorState: "hidden",
  showingShortcuts: false,
  showingEditor: false,

  // Toolkit
  toolkit: {
    // Merge
    mergeName: "",
    mergeTransforms: false,
    mergeWithNewPattern: false,
    // Repeat
    repeatCount: 1,
    repeatTransforms: false,
    repeatWithTranspose: false,
    // Transpose
    chromaticTranspose: 0,
    scalarTranspose: 0,
    chordalTranspose: 0,
  },
};

export const rootSlice = createSlice({
  name: "root",
  initialState: defaultRoot,
  reducers: {
    // Project Values
    setProjectName(state, action: PayloadAction<string>) {
      state.projectName = action.payload;
    },
    setCellWidth(state, action: PayloadAction<number>) {
      state.cellWidth = clamp(action.payload, MIN_CELL_WIDTH, MAX_CELL_WIDTH);
    },
    // Timeline - State
    setTimelineState: (state, action) => {
      state.timelineState = action.payload;
    },
    clearTimelineState: (state) => {
      state.timelineState = "idle";
    },
    loadTimeline: (state) => {
      state.loadedTimeline = true;
    },
    unloadTimeline: (state) => {
      state.loadedTimeline = false;
    },
    // Timeline - ID Selection
    setSelectedTrack: (state, action: PayloadAction<TrackId | undefined>) => {
      const trackId = action.payload;
      state.selectedTrackId = trackId;
    },
    setSelectedPattern: (
      state,
      action: PayloadAction<PatternId | undefined>
    ) => {
      const patternId = action.payload;
      state.selectedPatternId = patternId;
    },
    setClipboard: (state, action: PayloadAction<Clipboard>) => {
      const clipboard = action.payload;
      state.clipboard = clipboard;
    },
    // Timeline - Clip Selection
    selectClip: (state, action: PayloadAction<ClipId>) => {
      const clipId = action.payload;
      state.selectedClipIds = [clipId];
    },
    selectAnotherClip: (state, action: PayloadAction<ClipId>) => {
      const clipId = action.payload;
      state.selectedClipIds.push(clipId);
    },
    selectClips: (state, action: PayloadAction<ClipId[]>) => {
      const clipIds = action.payload;
      state.selectedClipIds = clipIds;
    },
    deselectClip: (state, action: PayloadAction<ClipId>) => {
      const clipId = action.payload;
      state.selectedClipIds = state.selectedClipIds.filter(
        (id) => id !== clipId
      );
    },
    deselectAllClips: (state) => {
      state.selectedClipIds = [];
    },
    // Timeline - Transform Selection
    selectTransform: (state, action: PayloadAction<TransformId>) => {
      const transformId = action.payload;
      state.selectedTransformIds = [transformId];
    },
    selectAnotherTransform: (state, action: PayloadAction<TransformId>) => {
      const transformId = action.payload;
      state.selectedTransformIds.push(transformId);
    },
    selectTransforms: (state, action: PayloadAction<TransformId[]>) => {
      const transformIds = action.payload;
      state.selectedTransformIds = transformIds;
    },
    deselectTransform: (state, action: PayloadAction<TransformId>) => {
      const transformId = action.payload;
      state.selectedTransformIds = state.selectedTransformIds.filter(
        (id) => id !== transformId
      );
    },
    deselectAllTransforms: (state) => {
      state.selectedTransformIds = [];
    },
    // Toolkit – State
    toggleAddingClip: (state) => {
      const isAdding = state.timelineState === "adding";
      state.timelineState = isAdding ? "idle" : "adding";
    },
    toggleCuttingClip: (state) => {
      const isCutting = state.timelineState === "cutting";
      state.timelineState = isCutting ? "idle" : "cutting";
    },
    toggleMergingClips: (state) => {
      const isMerging = state.timelineState === "merging";
      state.timelineState = isMerging ? "idle" : "merging";
    },
    toggleRepeatingClips: (state) => {
      const isRepeating = state.timelineState === "repeating";
      state.timelineState = isRepeating ? "idle" : "repeating";
    },
    toggleTransposingClip: (state) => {
      const isTransposing = state.timelineState === "transposing";
      state.timelineState = isTransposing ? "idle" : "transposing";
    },
    setToolkitValue: (
      state,
      action: PayloadAction<{ key: keyof Partial<Toolkit>; value: any }>
    ) => {
      if (action.payload === undefined) return;
      const { key, value } = action.payload;
      if (!key) return;
      state.toolkit = { ...state.toolkit, [key]: value };
    },
    toggleToolkitValue: (
      state,
      action: PayloadAction<keyof Partial<Toolkit>>
    ) => {
      const key = action.payload;
      if (!key) return;
      state.toolkit = {
        ...state.toolkit,
        [key]: !state.toolkit[key],
      };
    },
    // Editor State
    showEditor: (state, action) => {
      const { id, trackId } = action.payload;
      state.editorState = id;
      state.showingEditor = true;
      if (trackId) state.selectedTrackId = trackId;
    },
    hideEditor: (state) => {
      state.editorState = "hidden";
      state.showingEditor = false;
    },
    // Shortcuts State
    showShortcuts: (state) => {
      state.showingShortcuts = true;
    },
    hideShortcuts: (state) => {
      state.showingShortcuts = false;
    },
    // Clip – DND
    startDraggingClip: (state) => {
      state.draggingClip = true;
    },
    stopDraggingClip: (state) => {
      state.draggingClip = false;
    },
    // Transform - DND
    startDraggingTransform: (state) => {
      state.draggingTransform = true;
    },
    stopDraggingTransform: (state) => {
      state.draggingTransform = false;
    },
  },
});

export const {
  setProjectName,
  setCellWidth,

  setTimelineState,
  clearTimelineState,
  loadTimeline,
  unloadTimeline,

  setSelectedTrack,
  setSelectedPattern,
  setClipboard,

  selectClip,
  selectAnotherClip,
  selectClips,
  deselectClip,
  deselectAllClips,

  selectTransform,
  selectAnotherTransform,
  selectTransforms,
  deselectTransform,
  deselectAllTransforms,

  toggleAddingClip,
  toggleCuttingClip,
  toggleMergingClips,
  toggleRepeatingClips,
  toggleTransposingClip,
  setToolkitValue,
  toggleToolkitValue,

  showEditor,
  hideEditor,
  showShortcuts,
  hideShortcuts,

  startDraggingClip,
  stopDraggingClip,
  startDraggingTransform,
  stopDraggingTransform,
} = rootSlice.actions;

export default rootSlice.reducer;
