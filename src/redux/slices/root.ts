import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union } from "lodash";
import { ClipId } from "types/clip";
import { PatternId } from "types/pattern";
import { defaultRoot, Toolkit } from "types/root";
import { TrackId } from "types/tracks";
import { TranspositionId } from "types/transposition";

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
    setSelectedTranspositions: (
      state,
      action: PayloadAction<TranspositionId[]>
    ) => {
      const transpositionIds = action.payload;
      state.selectedTranspositionIds = transpositionIds;
    },
    addSelectedTransposition: (
      state,
      action: PayloadAction<TranspositionId>
    ) => {
      const transpositionId = action.payload;
      state.selectedTranspositionIds = union(state.selectedTranspositionIds, [
        transpositionId,
      ]);
    },
    deselectTransposition: (state, action: PayloadAction<TranspositionId>) => {
      const transpositionId = action.payload;
      state.selectedTranspositionIds = state.selectedTranspositionIds.filter(
        (id) => id !== transpositionId
      );
    },
    deselectAllTranspositions: (state) => {
      state.selectedTranspositionIds = [];
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

  setSelectedTranspositions,
  addSelectedTransposition,
  deselectTransposition,
  deselectAllTranspositions,

  setToolkitValue,
  toggleToolkitValue,

  showShortcuts,
  hideShortcuts,
} = rootSlice.actions;

export default rootSlice.reducer;
