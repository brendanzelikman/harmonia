import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { union, without } from "lodash";
import { SliceClipPayload } from "../Clip/ClipSlice";
import { defaultSession, SessionEntity } from "types/Session";
import { MediaPayload, PartialMediaPayload } from "types/Media";
import { TrackId, TrackInterface } from "types/Track";
import { isTransposition } from "types/Transposition";

/**
 * A track can be added by ID with an optional parent ID at an optional index.
 */
export type AddTrackToSessionPayload = TrackInterface;
/**
 * A track can be removed by ID.
 */
export type RemoveTrackFromSessionPayload = TrackId;
/**
 * A track can be moved to a new index in its parent track.
 */
export type MoveTrackInSessionPayload = {
  id: TrackId;
  index: number;
};
/**
 * A track can be moved to a new index in a new parent track
 */
export type MigrateTrackInSessionPayload = {
  id: TrackId;
  parentId?: TrackId;
  index?: number;
};
/**
 * Tracks can be collapsed by ID.
 */
export type CollapseTracksInSessionPayload = TrackId[];

/**
 * Tracks can be expanded by ID.
 */
export type ExpandTracksInSessionPayload = TrackId[];

/**
 * A track can be cleared of all media.
 */
export type ClearTrackInSessionPayload = TrackId;

/**
 * A clip can be sliced into two new clips.
 */
export type SliceMediaInSessionPayload = {
  oldId: string;
  newIds: string[];
};

/**
 * Media can be added to the session within a bundle.
 */
export type AddMediaToSessionPayload = MediaPayload;

/**
 * Media can be removed from the session within a bundle.
 */
export type RemoveMediaFromSessionPayload = MediaPayload;

/**
 * Media can be updated in the session within a bundle.
 */
export type UpdateMediaInSessionPayload = PartialMediaPayload;

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
 * The session slice contains all of the tracks, clips, and transpositions in the session.
 *
 * @property `addScaleTrackToSession` - Add a scale track to the session.
 * @property `removeScaleTrackFromSession` - Remove a scale track from the session.
 * @property `addPatternTrackToSession` - Add a pattern track to the session.
 * @property `removePatternTrackFromSession` - Remove a pattern track from the session.
 * @property `moveTrackInSession` - Move a track to a new index in its parent track.
 * @property `migrateTrackInSession` - Move a track to a new index in a new parent track.
 * @property `collapseTracksInSession` - Collapse tracks in the session.
 * @property `expandTracksInSession` - Expand tracks in the session.
 * @property `clearTrackInSession` - Clear a track of all media.
 * @property `addMediaToSession` - Add media to the session.
 * @property `removeMediaFromSession` - Remove media from the session.
 * @property `updateMediaInSession` - Update media in the session.
 * @property `sliceMediaInSession` - Slice media into two.
 *
 */
export const sessionSlice = createSlice({
  name: "session",
  initialState: defaultSession,
  reducers: {
    /**
     * Add a scale track to the session.
     * @param state The session state.
     * @param action The payload action.
     */
    addScaleTrackToSession: (
      state,
      action: PayloadAction<AddTrackToSessionPayload>
    ) => {
      const { id, parentId, type } = action.payload;
      if (!id || state.byId[id]) return;

      // Create a new scale track entity
      const newScaleTrack: SessionEntity = {
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

      // Add the scale track to the session
      state.byId[id] = newScaleTrack;
      state.allIds.push(id);
    },
    /**
     * Remove a scale track from the session.
     * @param state The session state.
     * @param action The payload action.
     */
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
    /**
     * Add a pattern track to the session.
     * @param state The session state.
     * @param action The payload action.
     */
    addPatternTrackToSession: (
      state,
      action: PayloadAction<AddTrackToSessionPayload>
    ) => {
      const { id, parentId, type } = action.payload;
      if (!id || state.byId[id]) return;

      // Create a new pattern track entity
      const newPatternTrack: SessionEntity = {
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
      // Add the pattern track to the session
      state.byId[id] = newPatternTrack;
      state.allIds.push(id);
    },
    /**
     * Remove a pattern track from the session.
     * @param state The session state.
     * @param action The payload action.
     */
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
    /**
     * Move a track to a new index in its parent track.
     * @param state The session state.
     * @param action The payload action.
     * @returns The new session state.
     */
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
    /**
     * Move a track to a new index in a new parent track.
     * @param state The session state.
     * @param action The payload action.
     */
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
    /**
     * Collapse the tracks in the session.
     * @param state The session state.
     * @param action The payload action.
     */
    collapseTracksInSession: (
      state,
      action: PayloadAction<CollapseTracksInSessionPayload>
    ) => {
      const ids = action.payload;
      ids.forEach((id) => {
        const track = state.byId[id];
        if (!track) return;
        track.collapsed = true;
      });
    },
    /**
     * Expand the tracks in the session.
     * @param state The session state.
     * @param action The payload action.
     * @returns The new session state.
     */
    expandTracksInSession: (
      state,
      action: PayloadAction<ExpandTracksInSessionPayload>
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
     * @param state The session state.
     * @param action The payload action.
     * @returns The new session state.
     */
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
    /**
     * Add media to the session.
     * @param state The session state.
     * @param action The payload action.
     */
    addMediaToSession: (
      state,
      action: PayloadAction<AddMediaToSessionPayload>
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
     * Remove media from the session.
     * @param state The session state.
     * @param action The payload action.
     */
    removeMediaFromSession: (
      state,
      action: PayloadAction<RemoveMediaFromSessionPayload>
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
     * Update media in the session, changing track IDs where necessary.
     * @param state The session state.
     * @param action The payload action.
     */
    updateMediaInSession: (
      state,
      action: PayloadAction<UpdateMediaInSessionPayload>
    ) => {
      const { clips, transpositions } = action.payload;

      const media = [...(clips || []), ...(transpositions || [])];
      // Move media if their track IDs have changed
      for (const item of media) {
        const { id, trackId } = item;
        if (!id || !trackId) continue;
        const entity = state.byId[trackId];
        if (!entity) continue;
        const field = isTransposition(item) ? "transpositionIds" : "clipIds";
        if (entity[field].includes(id)) continue;

        // Remove the clip from its old track
        const oldTrackId = state.allIds.find((someId) =>
          state.byId[someId][field].includes(id)
        );
        if (!oldTrackId) continue;
        const oldEntity = state.byId[oldTrackId];
        if (!oldEntity) continue;
        oldEntity[field] = without(oldEntity[field], id);

        // Add the clip to its new track
        entity[field].push(id);
      }
    },
    /**
     * Slice a media clip into two new clips.
     * @param state The session state.
     * @param action The payload action.
     */
    sliceMediaInSession: (
      state,
      action: PayloadAction<SliceMediaInSessionPayload>
    ) => {
      const { oldId, newIds } = action.payload;
      // Find the track that contains the old clip
      let isClip, trackId;
      for (const id of state.allIds) {
        const entity = state.byId[id];
        if (!entity) continue;
        if (entity.clipIds.includes(oldId)) {
          isClip = true;
          trackId = id;
          break;
        }
        if (entity.transpositionIds.includes(oldId)) {
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
  addScaleTrackToSession,
  removeScaleTrackFromSession,
  addPatternTrackToSession,
  removePatternTrackFromSession,
  moveTrackInSession,
  migrateTrackInSession,
  collapseTracksInSession,
  expandTracksInSession,
  clearTrackInSession,
  addMediaToSession,
  removeMediaFromSession,
  updateMediaInSession,
  sliceMediaInSession,
} = sessionSlice.actions;

export default sessionSlice.reducer;
