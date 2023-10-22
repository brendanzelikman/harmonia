import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union, without } from "lodash";
import { defaultTrackHierarchy, TrackNode } from "types/TrackHierarchy";
import { MediaPayload, PartialMediaPayload } from "types/Media";
import { TrackId, TrackInterface } from "types/Track";
import { isTransposition } from "types/Transposition";

/**
 * A track can be added by ID with an optional parent ID at an optional index.
 */
export type AddTrackToHierarchyPayload = TrackInterface;
/**
 * A track can be removed by ID.
 */
export type RemoveTrackFromHierarchyPayload = TrackId;
/**
 * A track can be moved to a new index in its parent track.
 */
export type MoveTrackInHierarchyPayload = {
  id: TrackId;
  index: number;
};
/**
 * A track can be moved to a new index in a new parent track
 */
export type MigrateTrackInHierarchyPayload = {
  id: TrackId;
  parentId?: TrackId;
  index?: number;
};
/**
 * Tracks can be collapsed by ID.
 */
export type CollapseTracksInHierarchyPayload = TrackId[];

/**
 * Tracks can be expanded by ID.
 */
export type ExpandTracksInHierarchyPayload = TrackId[];

/**
 * A track can be cleared of all media.
 */
export type ClearTrackInHierarchyPayload = TrackId;

/**
 * A clip can be sliced into two new clips.
 */
export type SliceMediaInHierarchyPayload = {
  oldId: string;
  newIds: string[];
};

/**
 * Media can be added to the hierarchy within a bundle.
 */
export type AddMediaToHierarchyPayload = MediaPayload;

/**
 * Media can be removed from the hierarchy within a bundle.
 */
export type RemoveMediaFromHierarchyPayload = MediaPayload;

/**
 * Media can be updated in the hierarchy within a bundle.
 */
export type UpdateMediaInHierarchyPayload = PartialMediaPayload;

/**
 * Reduce an array of objects to a map of track id to object ids.
 * @param arr An array of objects.
 * @returns A map of track id to object ids.
 */
const getObjectsByTrack = (arr?: { id: string; trackId: TrackId }[]) => {
  if (!arr?.length) return {};
  return arr.reduce((acc, clip) => {
    if (!acc[clip.trackId]) acc[clip.trackId] = [];
    acc[clip.trackId].push(clip.id);
    return acc;
  }, {} as Record<TrackId, string[]>);
};

/**
 * The hierarchy slice contains all of the tracks, clips, and transpositions in the hierarchy.
 *
 * @property `addScaleTrackToHierarchy` - Add a scale track to the hierarchy.
 * @property `removeScaleTrackFromHierarchy` - Remove a scale track from the hierarchy.
 * @property `addPatternTrackToHierarchy` - Add a pattern track to the hierarchy.
 * @property `removePatternTrackFromHierarchy` - Remove a pattern track from the hierarchy.
 * @property `moveTrackInHierarchy` - Move a track to a new index in its parent track.
 * @property `migrateTrackInHierarchy` - Move a track to a new index in a new parent track.
 * @property `collapseTracksInHierarchy` - Collapse tracks in the hierarchy.
 * @property `expandTracksInHierarchy` - Expand tracks in the hierarchy.
 * @property `clearTrackInHierarchy` - Clear a track of all media.
 * @property `addMediaToHierarchy` - Add media to the hierarchy.
 * @property `removeMediaFromHierarchy` - Remove media from the hierarchy.
 * @property `updateMediaInHierarchy` - Update media in the hierarchy.
 * @property `sliceMediaInHierarchy` - Slice media into two.
 *
 */
export const trackHierarchySlice = createSlice({
  name: "trackHierarchy",
  initialState: defaultTrackHierarchy,
  reducers: {
    /**
     * Add a scale track to the hierarchy.
     * @param project The hierarchy state.
     * @param action The payload action.
     */
    addScaleTrackToHierarchy: (
      state,
      action: PayloadAction<AddTrackToHierarchyPayload>
    ) => {
      const { id, parentId, type } = action.payload;
      if (!id || state.byId[id]) return;

      // Create a new scale track node
      const newScaleTrack: TrackNode = {
        id,
        type,
        depth: 0,
        trackIds: [],
        clipIds: [],
        transpositionIds: [],
      };

      // If there is a parent, add the scale track to the parent
      if (parentId) {
        const scaleTrack = state.byId[parentId];
        if (!scaleTrack) return;
        // Set the scale track's depth to one more than its parent
        newScaleTrack.depth = scaleTrack.depth + 1;
        // Add the scale track to the parent
        scaleTrack.trackIds.push(id);
      } else {
        // Otherwise, add the scale track to the top level
        state.topLevelIds.push(id);
      }

      // Add the scale track to the hierarchy
      state.byId[id] = newScaleTrack;
      state.allIds.push(id);
    },
    /**
     * Remove a scale track from the hierarchy.
     * @param project The hierarchy state.
     * @param action The payload action.
     */
    removeScaleTrackFromHierarchy: (
      state,
      action: PayloadAction<RemoveTrackFromHierarchyPayload>
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

      // Remove the scale track from the hierarchy
      delete state.byId[id];
      state.allIds = without(state.allIds, id);
      state.topLevelIds = without(state.topLevelIds, id);
    },
    /**
     * Add a pattern track to the hierarchy.
     * @param project The hierarchy state.
     * @param action The payload action.
     */
    addPatternTrackToHierarchy: (
      state,
      action: PayloadAction<AddTrackToHierarchyPayload>
    ) => {
      const { id, parentId, type } = action.payload;
      if (!id || state.byId[id]) return;

      // Create a new pattern track node
      const newPatternTrack: TrackNode = {
        id,
        depth: 0,
        type,
        trackIds: [],
        clipIds: [],
        transpositionIds: [],
      };

      // If there is a parent, add the pattern track to the parent
      if (parentId) {
        const scaleTrack = state.byId[parentId];
        if (!scaleTrack) return;
        newPatternTrack.depth = scaleTrack.depth + 1;
        // Add the scale track to the parent at the specified index or at the end
        scaleTrack.trackIds.push(id);
      } else {
        // Otherwise, add the pattern track to the top level
        state.topLevelIds.push(id);
      }
      // Add the pattern track to the hierarchy
      state.byId[id] = newPatternTrack;
      state.allIds.push(id);
    },
    /**
     * Remove a pattern track from the hierarchy.
     * @param project The hierarchy state.
     * @param action The payload action.
     */
    removePatternTrackFromHierarchy: (
      state,
      action: PayloadAction<RemoveTrackFromHierarchyPayload>
    ) => {
      const id = action.payload;
      if (!id) return;
      const patternTrack = state.byId[id];
      if (!patternTrack) return;
      // Remove the pattern track from the hierarchy
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
    /**
     * Move a track to a new index in its parent track.
     * @param project The hierarchy state.
     * @param action The payload action.
     * @returns The new hierarchy state.
     */
    moveTrackInHierarchy: (
      state,
      action: PayloadAction<MoveTrackInHierarchyPayload>
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
    /**
     * Move a track to a new index in a new parent track.
     * @param project The hierarchy state.
     * @param action The payload action.
     */
    migrateTrackInHierarchy: (
      state,
      action: PayloadAction<MigrateTrackInHierarchyPayload>
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
    /**
     * Collapse the tracks in the hierarchy.
     * @param project The hierarchy state.
     * @param action The payload action.
     */
    collapseTracksInHierarchy: (
      state,
      action: PayloadAction<CollapseTracksInHierarchyPayload>
    ) => {
      const ids = action.payload;
      ids.forEach((id) => {
        const track = state.byId[id];
        if (!track) return;
        track.collapsed = true;
      });
    },
    /**
     * Expand the tracks in the hierarchy.
     * @param project The hierarchy state.
     * @param action The payload action.
     * @returns The new hierarchy state.
     */
    expandTracksInHierarchy: (
      state,
      action: PayloadAction<ExpandTracksInHierarchyPayload>
    ) => {
      const ids = action.payload;
      ids.forEach((id) => {
        const track = state.byId[id];
        if (!track) return;
        track.collapsed = false;
      });
    },
    /**
     * Clear a track of all media.
     * @param project The hierarchy state.
     * @param action The payload action.
     * @returns The new hierarchy state.
     */
    clearTrackInHierarchy: (
      state,
      action: PayloadAction<ClearTrackInHierarchyPayload>
    ) => {
      const id = action.payload;
      if (!id) return;
      const track = state.byId[id];
      if (!track) return;
      track.clipIds = [];
      track.transpositionIds = [];
    },
    /**
     * Add media to the hierarchy.
     * @param project The hierarchy state.
     * @param action The payload action.
     */
    addMediaToHierarchy: (
      state,
      action: PayloadAction<AddMediaToHierarchyPayload>
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
    /**
     * Remove media from the hierarchy.
     * @param project The hierarchy state.
     * @param action The payload action.
     */
    removeMediaFromHierarchy: (
      state,
      action: PayloadAction<RemoveMediaFromHierarchyPayload>
    ) => {
      const { clips, transpositions } = action.payload;
      // Remove the media from every track
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
    /**
     * Update media in the hierarchy, changing track IDs where necessary.
     * @param project The hierarchy state.
     * @param action The payload action.
     */
    updateMediaInHierarchy: (
      state,
      action: PayloadAction<UpdateMediaInHierarchyPayload>
    ) => {
      const { clips, transpositions } = action.payload;

      const media = [...(clips || []), ...(transpositions || [])];
      // Move media if their track IDs have changed
      for (const item of media) {
        const { id, trackId } = item;
        if (!id || !trackId) continue;
        const trackNode = state.byId[trackId];
        if (!trackNode) continue;
        const field = isTransposition(item) ? "transpositionIds" : "clipIds";
        if (trackNode[field].includes(id)) continue;

        // Remove the clip from its old track
        const oldTrackId = state.allIds.find((someId) =>
          state.byId[someId][field].includes(id)
        );
        if (!oldTrackId) continue;
        const oldNode = state.byId[oldTrackId];
        if (!oldNode) continue;
        oldNode[field] = without(oldNode[field], id);

        // Add the clip to its new track
        trackNode[field].push(id);
      }
    },
    /**
     * Slice a media clip into two new clips.
     * @param project The hierarchy state.
     * @param action The payload action.
     */
    sliceMediaInHierarchy: (
      state,
      action: PayloadAction<SliceMediaInHierarchyPayload>
    ) => {
      const { oldId, newIds } = action.payload;
      // Find the track that contains the old clip
      let isClip, trackId;
      for (const id of state.allIds) {
        const trackNode = state.byId[id];
        if (!trackNode) continue;
        if (trackNode.clipIds.includes(oldId)) {
          isClip = true;
          trackId = id;
          break;
        }
        if (trackNode.transpositionIds.includes(oldId)) {
          isClip = false;
          trackId = id;
          break;
        }
      }
      if (!trackId) return;
      const track = state.byId[trackId];
      if (!track) return;
      // Add the new ids to the track and remove the old id
      if (isClip) {
        track.clipIds = union(track.clipIds, newIds);
        track.clipIds = without(track.clipIds, oldId);
      } else {
        track.transpositionIds = union(track.transpositionIds, newIds);
        track.transpositionIds = without(track.transpositionIds, oldId);
      }
    },
  },
});

export const {
  addScaleTrackToHierarchy,
  removeScaleTrackFromHierarchy,
  addPatternTrackToHierarchy,
  removePatternTrackFromHierarchy,
  moveTrackInHierarchy,
  migrateTrackInHierarchy,
  collapseTracksInHierarchy,
  expandTracksInHierarchy,
  clearTrackInHierarchy,
  addMediaToHierarchy,
  removeMediaFromHierarchy,
  updateMediaInHierarchy,
  sliceMediaInHierarchy,
} = trackHierarchySlice.actions;

export default trackHierarchySlice.reducer;
