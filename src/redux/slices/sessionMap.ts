import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union, without } from "lodash";
import { ObjectPayload } from "redux/slices";
import { TrackId } from "types/tracks";
import { SliceClipPayload } from "./clips";
import { defaultSessionMap, SessionEntity } from "types/session";

const initialState = defaultSessionMap;

// TRACKS

// A track can be added with an optional parent track at an optional index
export interface AddTrackToSessionPayload extends Partial<SessionEntity> {
  id: TrackId;
  parentId?: TrackId;
  index?: number;
}

// A track must be removed by id
export type RemoveTrackFromSessionPayload = TrackId;

// A track can be moved to a new index in its parent track
export type MoveTrackInSessionPayload = {
  id: TrackId;
  index: number;
};

// A track can be moved to a new index in a new parent track
export type MigrateTrackInSessionPayload = {
  id: TrackId;
  parentId?: TrackId;
  index?: number;
};

// A track can be collapsed or expanded
export type CollapseTracksInSessionPayload = TrackId[];
export type ExpandTracksInSessionPayload = TrackId[];

// A track can be cleared of all clips and transpositions
export type ClearTrackInSessionPayload = TrackId;

// Clips can be added, removed, and sliced
export type AddClipsToSessionPayload = ObjectPayload;
export type RemoveClipsFromSessionPayload = ObjectPayload;
export type SliceClipInSessionPayload = SliceClipPayload;

// Transpositions can be added and removed
export type AddTranspositionsToSessionPayload = ObjectPayload;
export type RemoveTranspositionsFromSessionPayload = ObjectPayload;

// Clips and transpositions can be added and removed together
export type AddObjectsToSessionPayload = ObjectPayload;
export type RemoveObjectsFromSessionPayload = ObjectPayload;

// Get the objects of a track as a map of track id to object ids
const getObjectsByTrack = (arr?: { id: string; trackId: TrackId }[]) => {
  if (!arr?.length) return {};
  return arr.reduce((acc, clip) => {
    if (!acc[clip.trackId]) acc[clip.trackId] = [];
    acc[clip.trackId].push(clip.id);
    return acc;
  }, {} as Record<TrackId, string[]>);
};

export const sessionMapSlice = createSlice({
  name: "session",
  initialState,
  reducers: {
    // Add a scale track to the session
    addScaleTrackToSession: (
      state,
      action: PayloadAction<AddTrackToSessionPayload>
    ) => {
      const { id, parentId, trackIds, clipIds, transpositionIds, index } =
        action.payload;
      if (!id || state.byId[id]) return;

      // Create a new scale track entity
      const newScaleTrack: SessionEntity = {
        id,
        type: "scaleTrack",
        depth: 0,
        trackIds: trackIds ?? [],
        clipIds: clipIds ?? [],
        transpositionIds: transpositionIds ?? [],
      };

      // If there is a parent, add the scale track to the parent
      if (parentId) {
        const scaleTrack = state.byId[parentId];
        if (!scaleTrack) return;
        // Set the scale track's depth to one more than its parent
        newScaleTrack.depth = scaleTrack.depth + 1;
        // Add the scale track to the parent at the specified index or at the end
        if (index !== undefined) {
          scaleTrack.trackIds.splice(index, 0, id);
        } else {
          scaleTrack.trackIds.push(id);
        }
      } else {
        // Otherwise, add the scale track to the top level
        state.topLevelIds.push(id);
      }

      // Add the scale track to the session
      state.byId[id] = newScaleTrack;
      state.allIds.push(id);
    },
    // Remove a scale track from the session
    removeScaleTrackFromSession: (
      state,
      action: PayloadAction<RemoveTrackFromSessionPayload>
    ) => {
      const id = action.payload;
      if (!id) return;
      const scaleTrack = state.byId[id];
      if (!scaleTrack) return;

      // Recursively remove all of the scale track's children if they exist
      const removeChildren = (children: TrackId[]) => {
        children.forEach((childId) => {
          const child = state.byId[childId];
          if (!child) return;
          removeChildren(child.trackIds);
          delete state.byId[childId];
          state.allIds = without(state.allIds, childId);
        });
      };
      removeChildren(scaleTrack.trackIds);

      // Remove the scale track from the session
      delete state.byId[id];
      state.allIds = without(state.allIds, id);
      state.topLevelIds = without(state.topLevelIds, id);
    },
    // Add a pattern track to the session
    addPatternTrackToSession: (
      state,
      action: PayloadAction<AddTrackToSessionPayload>
    ) => {
      const { id, parentId, trackIds, clipIds, transpositionIds, index } =
        action.payload;
      if (!id || state.byId[id]) return;

      // Create a new pattern track entity
      const newPatternTrack: SessionEntity = {
        id,
        depth: 0,
        type: "patternTrack",
        trackIds: trackIds ?? [],
        clipIds: clipIds ?? [],
        transpositionIds: transpositionIds ?? [],
      };

      // If there is a parent, add the pattern track to the parent
      if (parentId) {
        const scaleTrack = state.byId[parentId];
        if (!scaleTrack) return;

        // Add the scale track to the parent at the specified index or at the end
        if (index !== undefined) {
          scaleTrack.trackIds.splice(index, 0, id);
        } else {
          scaleTrack.trackIds.push(id);
        }
        newPatternTrack.depth = scaleTrack.depth + 1;
      } else {
        // Otherwise, add the pattern track to the top level
        state.topLevelIds.push(id);
      }
      // Add the pattern track to the session
      state.byId[id] = newPatternTrack;
      state.allIds.push(id);
    },
    // Remove a pattern track from the session
    removePatternTrackFromSession: (
      state,
      action: PayloadAction<RemoveTrackFromSessionPayload>
    ) => {
      const id = action.payload;
      if (!id) return;
      const patternTrack = state.byId[id];
      if (!patternTrack) return;
      // Remove the pattern track from the session
      delete state.byId[id];
      state.allIds = without(state.allIds, id);
      // Find and remove the pattern track from its parent
      const parentId = state.allIds.find((someId) =>
        state.byId[someId].trackIds.includes(id)
      );
      if (!parentId) return;
      const scaleTrack = state.byId[parentId];
      if (!scaleTrack) return;
      scaleTrack.trackIds = without(scaleTrack.trackIds, id);
    },
    // Move a track to a new index in its parent track
    moveTrackInSession: (
      state,
      action: PayloadAction<MoveTrackInSessionPayload>
    ) => {
      const { id, index } = action.payload;
      if (!id || index < 0) return;
      const scaleTrack = state.byId[id];
      if (!scaleTrack) return;
      // Find the parent scale track
      const parentId = state.allIds.find((someId) =>
        state.byId[someId].trackIds.includes(id)
      );
      if (!parentId) return;
      const parentScaleTrack = state.byId[parentId];
      if (!parentScaleTrack) return;
      // Move the scale track to the specified index or to the end
      const oldIndex = parentScaleTrack.trackIds.indexOf(id);
      if (oldIndex === -1) return;
      parentScaleTrack.trackIds.splice(oldIndex, 1);
      parentScaleTrack.trackIds.splice(index, 0, id);
    },
    // Move a track to a new index in a new parent track
    migrateTrackInSession: (
      state,
      action: PayloadAction<MigrateTrackInSessionPayload>
    ) => {
      const { id, parentId, index } = action.payload;
      if (!id) return;
      const scaleTrack = state.byId[id];
      if (!scaleTrack) return;
      // Find the parent scale track
      const oldParentId = state.allIds.find((someId) =>
        state.byId[someId].trackIds.includes(id)
      );
      if (!oldParentId) return;
      const oldParentScaleTrack = state.byId[oldParentId];
      if (!oldParentScaleTrack) return;
      // Remove the track from its old parent
      const oldIndex = oldParentScaleTrack.trackIds.indexOf(id);
      if (oldIndex === -1) return;
      oldParentScaleTrack.trackIds.splice(oldIndex, 1);
      // Add the track to its new parent at the specified index or at the end
      if (parentId) {
        const newParentScaleTrack = state.byId[parentId];
        if (!newParentScaleTrack) return;
        const parentDepth = newParentScaleTrack.depth;
        scaleTrack.depth = parentDepth + 1;
        if (index !== undefined) {
          newParentScaleTrack.trackIds.splice(index, 0, id);
        } else {
          newParentScaleTrack.trackIds.push(id);
        }
      } else {
        // Otherwise, add the track to the top level
        state.topLevelIds.push(id);
      }
    },
    // Collapse tracks in section
    collapseTracksInSession: (
      state,
      action: PayloadAction<CollapseTracksInSessionPayload>
    ) => {
      const ids = action.payload;
      if (!ids?.length) return;
      ids.forEach((id) => {
        const track = state.byId[id];
        if (!track) return;
        track.collapsed = true;
      });
    },
    // Expand tracks in section
    expandTracksInSession: (
      state,
      action: PayloadAction<ExpandTracksInSessionPayload>
    ) => {
      const ids = action.payload;
      if (!ids?.length) return;
      ids.forEach((id) => {
        const track = state.byId[id];
        if (!track) return;
        track.collapsed = false;
      });
    },
    // Clear a track of all clips and transpositions
    clearTrackInSession: (
      state,
      action: PayloadAction<ClearTrackInSessionPayload>
    ) => {
      const id = action.payload;
      if (!id) return;
      const track = state.byId[id];
      if (!track) return;
      track.clipIds = [];
      track.transpositionIds = [];
    },
    // Add clips to a track
    addClipsToSession: (
      state,
      action: PayloadAction<AddClipsToSessionPayload>
    ) => {
      const { clips } = action.payload;
      if (!clips?.length) return;
      // Add the clips to their respective tracks
      const clipsByTrack = getObjectsByTrack(clips);
      Object.keys(clipsByTrack).forEach((trackId) => {
        const track = state.byId[trackId];
        if (!track) return;
        const clips = clipsByTrack[trackId];
        if (!clips?.length) return;
        track.clipIds = union(track.clipIds, clipsByTrack[trackId]);
      });
    },
    // Remove clips from the session
    removeClipsFromSession: (
      state,
      action: PayloadAction<RemoveClipsFromSessionPayload>
    ) => {
      const { clips } = action.payload;
      if (!clips?.length) return;
      const ids = clips.map((clip) => clip.id);
      // Remove the clips from every track
      state.allIds.forEach((trackId) => {
        const track = state.byId[trackId];
        if (!track) return;
        track.clipIds = without(track.clipIds, ...ids);
      });
    },
    // Slice a clip into two new clips
    sliceClipInSession: (
      state,
      action: PayloadAction<SliceClipInSessionPayload>
    ) => {
      const { oldClip, firstClip, secondClip } = action.payload;
      if (!oldClip || !firstClip || !secondClip) return;
      // Find the track that contains the old clip
      const trackId = state.allIds.find((someId) =>
        state.byId[someId].clipIds.includes(oldClip.id)
      );
      if (!trackId) return;
      const track = state.byId[trackId];
      if (!track) return;
      // Add the new clips to the track and remove the old clip
      track.clipIds = union(track.clipIds, [firstClip.id, secondClip.id]);
      track.clipIds = without(track.clipIds, oldClip.id);
    },
    // Add transpositions to a track
    addTranspositionsToSession: (
      state,
      action: PayloadAction<AddTranspositionsToSessionPayload>
    ) => {
      const { transpositions } = action.payload;
      if (!transpositions?.length) return;
      // Add the transpositions to their respective tracks
      const transpositionsByTrack = getObjectsByTrack(transpositions);
      Object.keys(transpositionsByTrack).forEach((trackId) => {
        const track = state.byId[trackId];
        if (!track) return;
        const transpositions = transpositionsByTrack[trackId];
        if (!transpositions?.length) return;
        track.transpositionIds = union(
          track.transpositionIds,
          transpositionsByTrack[trackId]
        );
      });
    },
    // Remove transpositions from the session
    removeTranspositionsFromSession: (
      state,
      action: PayloadAction<RemoveTranspositionsFromSessionPayload>
    ) => {
      const { transpositions } = action.payload;
      if (!transpositions?.length) return;
      const ids = transpositions.map((transposition) => transposition.id);
      // Remove the transpositions from the state
      state.allIds.forEach((trackId) => {
        const track = state.byId[trackId];
        if (!track) return;
        track.transpositionIds = without(track.transpositionIds, ...ids);
      });
    },
    // Add clips and transpositions to a track
    addClipsAndTranspositionsToSession: (
      state,
      action: PayloadAction<AddObjectsToSessionPayload>
    ) => {
      const { clips, transpositions } = action.payload;

      // Add the clips to their respective tracks
      const clipsByTrack = getObjectsByTrack(clips);
      const transpositionsByTrack = getObjectsByTrack(transpositions);

      // Add the clips to their respective tracks
      Object.keys(clipsByTrack).forEach((trackId) => {
        const track = state.byId[trackId];
        if (!track) return;
        const clipIds = clipsByTrack[trackId];
        if (!clips?.length) return;
        track.clipIds = union(track.clipIds, clipIds);
      });

      // Add the transpositions to their respective tracks
      Object.keys(transpositionsByTrack).forEach((trackId) => {
        const track = state.byId[trackId];
        if (!track) return;
        const transpositionIds = transpositionsByTrack[trackId];
        if (!transpositions?.length) return;
        track.transpositionIds = union(
          track.transpositionIds,
          transpositionIds
        );
      });
    },
    // Remove clips and transpositions from the session
    removeClipsAndTranspositionsFromSession: (
      state,
      action: PayloadAction<RemoveObjectsFromSessionPayload>
    ) => {
      const { clips, transpositions } = action.payload;
      // Remove the clips and transpositions from every track
      state.allIds.forEach((trackId) => {
        const track = state.byId[trackId];
        if (!track) return;
        const clipIds = (clips || []).map((clip) => clip.id);
        const transpositionIds = (transpositions || []).map(
          (transposition) => transposition.id
        );
        track.clipIds = without(track.clipIds, ...clipIds);
        track.transpositionIds = without(
          track.transpositionIds,
          ...transpositionIds
        );
      });
    },
  },
});

export const {
  addScaleTrackToSession,
  removeScaleTrackFromSession,
  addPatternTrackToSession,
  removePatternTrackFromSession,
  moveTrackInSession,
  migrateTrackInSession,
  collapseTracksInSession,
  expandTracksInSession,
  clearTrackInSession,
  addClipsToSession,
  removeClipsFromSession,
  sliceClipInSession,
  addTranspositionsToSession,
  removeTranspositionsFromSession,
  addClipsAndTranspositionsToSession,
  removeClipsAndTranspositionsFromSession,
} = sessionMapSlice.actions;

export default sessionMapSlice.reducer;
