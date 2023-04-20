import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ClipId } from "types/clips";
import { PatternId } from "types/patterns";
import { TrackId } from "types/tracks";

// Active IDs
interface RootIds {
  activePatternId?: PatternId;
  activeTrackId?: TrackId;
  selectedClipIds: ClipId[];
}

interface RootState {
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

  // Editor State
  editorState: "file" | "scale" | "patterns" | "instrument" | "hidden";
  showEditor: boolean;

  // Clip State
  draggingClip: boolean;
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

interface RootToolkit extends RootMerge, RootRepeat, RootTranspose {}

interface Root extends RootIds, RootState, RootToolkit {}

export const defaultRoot: Root = {
  projectName: "New Project",
  activePatternId: "new-pattern",

  // Timeline
  timelineState: "idle",
  loadedTimeline: false,

  // Editor
  editorState: "hidden",
  showEditor: false,

  // Clips
  selectedClipIds: [],
  draggingClip: false,

  // Transpose
  chromaticTranspose: 0,
  scalarTranspose: 0,
  chordalTranspose: 0,

  // Repeat
  repeatCount: 1,
  repeatTransforms: false,
  repeatWithTranspose: false,

  // Merge
  mergeName: "",
  mergeTransforms: false,
  mergeWithNewPattern: false,
};

export const rootSlice = createSlice({
  name: "root",
  initialState: defaultRoot,
  reducers: {
    // Project
    setProjectName(state, action: PayloadAction<string>) {
      state.projectName = action.payload;
    },
    // Timeline Ids
    setActiveTrack: (state, action: PayloadAction<TrackId | undefined>) => {
      const trackId = action.payload;
      state.activeTrackId = trackId;
    },
    setActivePattern: (state, action: PayloadAction<PatternId | undefined>) => {
      const patternId = action.payload;
      state.activePatternId = patternId;
    },
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
    // Timeline State
    toggleAddingClip: (state) => {
      const isAdding = state.timelineState === "adding";
      state.timelineState = isAdding ? "idle" : "adding";
    },
    toggleCuttingClip: (state) => {
      const isCutting = state.timelineState === "cutting";
      state.timelineState = isCutting ? "idle" : "cutting";
    },
    toggleTransposingClip: (state) => {
      const isTransposing = state.timelineState === "transposing";
      state.timelineState = isTransposing ? "idle" : "transposing";
    },
    toggleRepeatingClips: (state) => {
      const isRepeating = state.timelineState === "repeating";
      state.timelineState = isRepeating ? "idle" : "repeating";
    },
    toggleRepeatTransforms: (state) => {
      state.repeatTransforms = !state.repeatTransforms;
    },
    toggleRepeatWithTranspose: (state) => {
      state.repeatWithTranspose = !state.repeatWithTranspose;
    },
    toggleMergingClips: (state) => {
      const isMerging = state.timelineState === "merging";
      state.timelineState = isMerging ? "idle" : "merging";
    },
    toggleMergeTransforms: (state) => {
      state.mergeTransforms = !state.mergeTransforms;
    },
    toggleMergeWithNewPattern: (state) => {
      state.mergeWithNewPattern = !state.mergeWithNewPattern;
    },
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
    // Editor State
    viewEditor: (state, action) => {
      const { id, trackId } = action.payload;
      state.editorState = id;
      state.showEditor = true;
      if (trackId) state.activeTrackId = trackId;
    },
    hideEditor: (state) => {
      state.editorState = "hidden";
      state.showEditor = false;
    },
    // Clip State
    startDraggingClip: (state) => {
      state.draggingClip = true;
    },
    stopDraggingClip: (state) => {
      state.draggingClip = false;
    },
    // Timeline Transform
    setChromaticTranspose: (state, action: PayloadAction<number>) => {
      if (action.payload === undefined) return;
      const chromaticTranspose = action.payload;
      state.chromaticTranspose = chromaticTranspose;
    },
    setScalarTranspose: (state, action: PayloadAction<number>) => {
      if (action.payload === undefined) return;
      const scalarTranspose = action.payload;
      state.scalarTranspose = scalarTranspose;
    },
    setChordalTranspose: (state, action: PayloadAction<number>) => {
      if (action.payload === undefined) return;
      const chordalTranspose = action.payload;
      state.chordalTranspose = chordalTranspose;
    },
    setRepeatCount: (state, action: PayloadAction<number>) => {
      if (action.payload === undefined) return;
      const repeatCount = action.payload;
      state.repeatCount = repeatCount;
    },
    setMergeName: (state, action: PayloadAction<string>) => {
      if (action.payload === undefined) return;
      const mergeName = action.payload;
      state.mergeName = mergeName;
    },
  },
});

export const {
  setProjectName,

  setActiveTrack,
  setActivePattern,

  toggleAddingClip,
  toggleCuttingClip,

  toggleMergingClips,
  toggleMergeTransforms,
  toggleMergeWithNewPattern,

  toggleRepeatingClips,
  toggleRepeatTransforms,
  toggleRepeatWithTranspose,

  toggleTransposingClip,
  setTimelineState,
  clearTimelineState,

  viewEditor,
  hideEditor,

  selectClip,
  selectAnotherClip,
  selectClips,
  deselectClip,
  deselectAllClips,

  startDraggingClip,
  stopDraggingClip,

  setChromaticTranspose,
  setScalarTranspose,
  setChordalTranspose,
  setRepeatCount,
  setMergeName,

  loadTimeline,
  unloadTimeline,
} = rootSlice.actions;

export default rootSlice.reducer;
