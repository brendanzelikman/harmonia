import { PayloadAction, createSlice } from "@reduxjs/toolkit";
import { union, without } from "lodash";
import { Track, defaultTrackState } from "types/Track";
import { TrackId } from "types/Track/TrackTypes";
import { createMap, getValueByKey, spliceOrPush } from "utils/objects";

// ------------------------------------------------------------
// Track Payload Types
// ------------------------------------------------------------

/** A Track can be added to the store. */
export type AddTrackPayload = {
  track: Track;
  callerId?: TrackId;
};

/** A Track can be removed from the store. */
export type RemoveTrackPayload = TrackId;

/** A Track can be renamed. */
export type RenameTrackPayload = { id: TrackId; name: string };

/** A Track can be moved to a new index in its parent track. */
export type MoveTrackPayload = { id: TrackId; index?: number };

/** A Track can be moved to a new index in a new parent track. */
export type MigrateTrackPayload = {
  id: TrackId;
  parentId: TrackId;
  index?: number;
};

/** A list of tracks can be collapsed by ID. */
export type CollapseTracksPayload = TrackId[];

/** A list of tracks can be expanded by ID. */
export type ExpandTracksPayload = TrackId[];

/** A track can be bound to a port number. */
export type BindTrackToPortPayload = { id: TrackId; port: number };

// ------------------------------------------------------------
// Track Slice Definition
// ------------------------------------------------------------

export const tracksSlice = createSlice({
  name: "tracks",
  initialState: defaultTrackState,
  reducers: {
    /** Add a track to the slice. */
    addTrack: (state, action: PayloadAction<AddTrackPayload>) => {
      let { track } = action.payload;

      // Update the parent's track list if necessary.
      if (track.parentId) {
        const parent = state.byId[track.parentId];
        if (parent) parent.trackIds = union(parent.trackIds, [track.id]);
      }

      // Add the entry
      state.allIds = union(state.allIds, [track.id]);
      state.byId[track.id] = track;
    },
    /** Remove a track from the slice. */
    removeTrack: (state, action: PayloadAction<RemoveTrackPayload>) => {
      const id = action.payload;
      const track = state.byId[action.payload];
      if (!track) return;

      // Recursively remove all of the track's children if they exist
      const removeChildren = (children: TrackId[]) => {
        children.forEach((childId) => {
          const child = state.byId[childId];
          if (!child) return;
          removeChildren(child.trackIds);
          delete state.byId[childId];
          state.allIds = without(state.allIds, childId);
        });
      };
      removeChildren(track.trackIds);

      // Remove the track from its parent's track list if necessary.
      if (track.parentId) {
        const parent = state.byId[track.parentId];
        if (parent) {
          parent.trackIds = without(parent.trackIds, id);
        }
      }

      // Remove the track from the slice
      delete state.byId[id];
      const index = state.allIds.findIndex((tId) => tId === id);
      if (index === -1) return;
      state.allIds.splice(index, 1);
    },
    /** Rename a track. */
    renameTrack: (state, action: PayloadAction<RenameTrackPayload>) => {
      const { id, name } = action.payload;
      const track = state.byId[id];
      if (!track) return;
      track.name = name;
    },
    /** Move a track to a new index in its parent track. */
    moveTrack: (state, action: PayloadAction<MoveTrackPayload>) => {
      const { id, index } = action.payload;
      const { byId, allIds } = state;
      if (!id) return;

      // Find the track
      const track = byId[id];
      if (!track) return;

      // Try to find a parent track
      const parentId = allIds.find((_) => byId[_].trackIds.includes(id));
      const parent = getValueByKey(state.byId, parentId);

      // Find the index and make sure it's valid within the parent
      const oldIndex = parent ? parent.trackIds.indexOf(id) : -1;
      if (oldIndex === -1 && !!parent) return;

      // If the track has a parent, splice accordingly
      if (parent) {
        parent.trackIds.splice(oldIndex, 1);
        spliceOrPush(parent.trackIds, id, index);
        return;
      }

      // Otherwise, rearrange the state
      spliceOrPush(state.allIds, id, index);
      state.byId = createMap(allIds.map((_) => byId[_]));
    },
    /** Move a track to a new index in a new parent track. */
    migrateTrack: (state, action: PayloadAction<MigrateTrackPayload>) => {
      const { id, parentId, index } = action.payload;

      // Find the track
      const track = getValueByKey(state.byId, id);
      if (!track) return;

      // Find the old parent
      const oldParentId = state.allIds.find((someId) =>
        state.byId[someId].trackIds.includes(id)
      );
      const oldParent = getValueByKey(state.byId, oldParentId);
      if (!oldParent) return;

      // Find the new parent
      const newParent = getValueByKey(state.byId, parentId);
      if (!newParent) return;

      // Remove the track from its old parent
      const oldIndex = oldParent.trackIds.indexOf(id);
      if (oldIndex === -1) return;
      oldParent.trackIds.splice(oldIndex, 1);

      // Add the track to its new parent at the new index or end
      spliceOrPush(newParent.trackIds, id, index);

      // Update the track's parent ID
      track.parentId = newParent.id;
    },
    /** Collapse a list of tracks by ID. */
    collapseTracks: (state, action: PayloadAction<CollapseTracksPayload>) => {
      const ids = action.payload;
      ids.forEach((id) => {
        const track = state.byId[id];
        if (!track) return;
        track.collapsed = true;
      });
    },
    /** Expand a list of tracks by ID. */
    expandTracks: (state, action: PayloadAction<ExpandTracksPayload>) => {
      const ids = action.payload;
      ids.forEach((id) => {
        const track = state.byId[id];
        if (!track) return;
        track.collapsed = false;
      });
    },
    /** Bind a track to a port number. */
    bindTrackToPort: (state, action: PayloadAction<BindTrackToPortPayload>) => {
      const { id, port } = action.payload;

      // Bind the track to the port
      const track = state.byId[id];
      if (!track) return;
      track.port = port;

      // Remove any other tracks with the same port number
      const otherTrackIds = state.allIds.filter((_) => _ !== id);
      otherTrackIds.forEach((trackId) => {
        const track = state.byId[trackId];
        if (!track) return;
        if (track.port === port) track.port = undefined;
      });
    },
    /** Clear the port binding of a track. */
    clearTrackPort: (state, action: PayloadAction<TrackId>) => {
      const track = state.byId[action.payload];
      if (!track) return;
      track.port = undefined;
    },
  },
});

export const {
  addTrack,
  removeTrack,
  renameTrack,
  moveTrack,
  migrateTrack,
  collapseTracks,
  expandTracks,
  bindTrackToPort,
  clearTrackPort,
} = tracksSlice.actions;

export default tracksSlice.reducer;
