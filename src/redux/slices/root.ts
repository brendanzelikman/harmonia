import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import { ClipId } from "types/clips";
import { PatternId } from "types/patterns";
import { defaultRoot, Toolkit } from "types/root";
import { TrackId } from "types/tracks";
import { TransformId } from "types/transform";

export const rootSlice = createSlice({
  name: "root",
  initialState: defaultRoot,
  reducers: {
    // Project Values
    setProjectName(state, action: PayloadAction<string>) {
      state.projectName = action.payload;
    },
    setTourStep: (state, action: PayloadAction<number>) => {
      state.tourStep = action.payload;
    },
    startTour: (state) => {
      state.showingTour = true;
    },
    endTour: (state) => {
      state.showingTour = false;
      state.tourStep = 1;
    },
    nextTourStep: (state) => {
      state.tourStep += 1;
    },
    prevTourStep: (state) => {
      state.tourStep -= 1;
    },
    // ID Selection
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
    setSelectedClips: (state, action: PayloadAction<ClipId[]>) => {
      const clipIds = action.payload;
      state.selectedClipIds = clipIds;
    },
    addSelectedClip: (state, action: PayloadAction<ClipId>) => {
      const clipId = action.payload;
      state.selectedClipIds = union(state.selectedClipIds, [clipId]);
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
    setSelectedTransforms: (state, action: PayloadAction<TransformId[]>) => {
      const transformIds = action.payload;
      state.selectedTransformIds = transformIds;
    },
    addSelectedTransform: (state, action: PayloadAction<TransformId>) => {
      const transformId = action.payload;
      state.selectedTransformIds = union(state.selectedTransformIds, [
        transformId,
      ]);
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
    // Shortcuts State
    showShortcuts: (state) => {
      state.showingShortcuts = true;
    },
    hideShortcuts: (state) => {
      state.showingShortcuts = false;
    },
  },
});

export const {
  setProjectName,
  startTour,
  endTour,
  setTourStep,
  nextTourStep,
  prevTourStep,

  setSelectedTrack,
  setSelectedPattern,

  setSelectedClips,
  addSelectedClip,
  deselectClip,
  deselectAllClips,

  setSelectedTransforms,
  addSelectedTransform,
  deselectTransform,
  deselectAllTransforms,

  setToolkitValue,
  toggleToolkitValue,

  showShortcuts,
  hideShortcuts,
} = rootSlice.actions;

export default rootSlice.reducer;
