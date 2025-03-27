import { nanoid } from "@reduxjs/toolkit";
import { Payload, createUndoType, unpackData, unpackUndoType } from "lib/redux";
import { difference, union } from "lodash";
import { selectClipsByTrackIds } from "types/Clip/ClipSelectors";
import { addClips, removeClips, updateClips } from "types/Clip/ClipSlice";
import { Clip, ClipType, initializeClip } from "types/Clip/ClipTypes";
import {
  LiveAudioInstance,
  LIVE_AUDIO_INSTANCES,
} from "types/Instrument/InstrumentClass";
import {
  addInstrument,
  removeInstrument,
} from "types/Instrument/InstrumentSlice";
import { initializeInstrument } from "types/Instrument/InstrumentTypes";
import { initializePattern, PatternStream } from "types/Pattern/PatternTypes";
import { selectPortalsByTrackIds } from "types/Portal/PortalSelectors";
import { removePortals } from "types/Portal/PortalSlice";
import { Thunk } from "types/Project/ProjectTypes";
import { addScale, removeScale, updateScale } from "types/Scale/ScaleSlice";
import { isNestedNote, initializeScale, ScaleId } from "types/Scale/ScaleTypes";
import {
  selectIsEditingTracks,
  selectSelectedTrackId,
  selectSubdivisionTicks,
} from "types/Timeline/TimelineSelectors";
import {
  clearTimelineState,
  setSelectedTrackId,
} from "types/Timeline/TimelineSlice";
import { createScaleTrack } from "./ScaleTrack/ScaleTrackThunks";
import {
  selectTrackById,
  selectTrackInstrument,
  selectTrackScale,
  selectTrackDescendants,
  selectTrackMidiScale,
  selectTrackAncestorIds,
  selectTrackDescendantIds,
  selectTopLevelTracks,
  selectTrackMap,
} from "./TrackSelectors";
import {
  TrackId,
  initializeTrack,
  isPatternTrack,
  isScaleTrack,
  Track,
  TrackUpdate,
} from "./TrackTypes";
import {
  selectCustomPatterns,
  selectPatternById,
} from "types/Pattern/PatternSelectors";
import { selectPoseById, selectPoses } from "types/Pose/PoseSelectors";
import { addPose, removePose } from "types/Pose/PoseSlice";
import {
  addPattern,
  removePattern,
  updatePatterns,
} from "types/Pattern/PatternSlice";
import { getPatternBlockWithNewNotes } from "types/Pattern/PatternUtils";
import { addClipIdsToSelection } from "types/Timeline/thunks/TimelineSelectionThunks";
import { selectTrackClipIds } from "types/Arrangement/ArrangementTrackSelectors";
import { initializePose } from "types/Pose/PoseTypes";
import { replaceVectorKeys } from "utils/vector";
import { trackActions } from "./TrackSlice";

// ------------------------------------------------------------
// Track - CRUD
// ------------------------------------------------------------

/** Add a track to its parent's track IDs */
export const addTrackToParent =
  (payload: Payload<{ id: TrackId; parentId?: TrackId }>): Thunk =>
  (dispatch, getProject) => {
    const { id, parentId } = unpackData(payload);
    if (!parentId) return;
    const undoType = unpackUndoType(payload, "addTrackToParent");
    const parent = selectTrackById(getProject(), parentId);
    if (!parent) return;
    const trackIds = union(parent.trackIds, [id]);
    dispatch(updateTrack({ data: { id: parent.id, trackIds }, undoType }));
  };

/** Remove a track from its parent's track IDs */
export const removeTrackFromParent =
  (payload: Payload<TrackId>): Thunk =>
  (dispatch, getProject) => {
    const trackId = unpackData(payload);
    const undoType = unpackUndoType(payload, "removeTrackFromParent");
    const track = selectTrackById(getProject(), trackId);
    if (!track?.parentId) return;
    const parent = selectTrackById(getProject(), track.parentId);
    if (!parent) return;
    const trackIds = difference(parent.trackIds, [trackId]);
    dispatch(updateTrack({ data: { id: parent.id, trackIds }, undoType }));
  };

/** Add a track to the store. */
export const addTrack =
  (payload: Payload<Track>): Thunk =>
  (dispatch) => {
    const track = unpackData(payload);
    const undoType = unpackUndoType(payload, "createTracks");
    dispatch(addTrackToParent({ data: track, undoType }));
    dispatch(trackActions.addOne({ data: track, undoType }));
  };

/** Add a list of tracks to the store. */
export const addTracks =
  (payload: Payload<Track[]>): Thunk =>
  (dispatch) => {
    const tracks = unpackData(payload);
    const undoType = unpackUndoType(payload, "createTracks");
    for (const track of tracks) {
      dispatch(addTrack({ data: track, undoType }));
    }
  };

/** Update a track in the store. */
export const updateTrack =
  (payload: Payload<TrackUpdate>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = unpackData(payload);
    const undoType = unpackUndoType(payload, "updateTracks");

    // Update dependencies if the parent changes
    const originalTrack = selectTrackById(project, track.id);
    if (!originalTrack) return;
    const parentId = track.parentId;
    if (parentId !== undefined && parentId !== originalTrack.parentId) {
      const parent = selectTrackById(project, parentId);
      if (!parent) return;
      dispatch(removeTrackFromParent({ data: track.id, undoType }));
      dispatch(addTrackToParent({ data: track, undoType }));
      track.order = parent.trackIds.length;
    }

    // Update the track in the appropriate store
    dispatch(trackActions.updateOne({ data: track, undoType }));
  };

/** Update a list of tracks in the store. */
export const updateTracks =
  (payload: Payload<TrackUpdate[]>): Thunk =>
  (dispatch) => {
    const tracks = unpackData(payload);
    const undoType = unpackUndoType(payload, "updateTracks");
    for (const track of tracks) {
      dispatch(updateTrack({ data: track, undoType }));
    }
  };

/** Remove a track from the store. */
export const removeTrack =
  (payload: Payload<TrackId>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const trackId = unpackData(payload);
    const undoType = unpackUndoType(payload, "removeTrack");

    const track = selectTrackById(project, trackId);
    if (!track) return;

    // Remove the track from its parent
    dispatch(removeTrackFromParent({ data: trackId, undoType }));

    // Remove the track from any children if they exist
    const children = track?.trackIds ?? [];
    for (const id of children) {
      dispatch(updateTrack({ data: { id, parentId: undefined }, undoType }));
    }

    // Remove the track from the appropriate store
    dispatch(trackActions.removeOne({ data: trackId, undoType }));
  };

/** Remove tracks from the store. */
export const removeTracks =
  (payload: Payload<TrackId[]>): Thunk =>
  (dispatch) => {
    const trackIds = unpackData(payload);
    const undoType = unpackUndoType(payload, "removeTracks");
    for (const trackId of trackIds) {
      dispatch(removeTrack({ data: trackId, undoType }));
    }
  };

// ------------------------------------------------------------
// Track Properties
// ------------------------------------------------------------

/** Collapse tracks in the store. */
export const collapseTracks =
  (payload: Payload<{ trackIds: TrackId[]; value?: boolean }>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const { trackIds, value } = unpackData(payload);
    const undoType = unpackUndoType(payload, "collapseTracks");
    const trackMap = selectTrackMap(project);
    const data = trackIds.map((id) => ({
      id,
      collapsed: value === undefined ? !trackMap[id]?.collapsed : value,
    }));
    dispatch(updateTracks({ data, undoType }));
  };

/** Collapse all descendants of a track */
export const collapseTrackDescendants =
  (trackId: TrackId, collapsed = true): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const trackIds = selectTrackDescendantIds(project, trackId);
    dispatch(collapseTracks({ data: { trackIds, value: collapsed } }));
  };

/** Collapse all ancestors of a track. */
export const collapseTrackAncestors =
  (trackId: TrackId, collapsed = true): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const trackIds = selectTrackAncestorIds(project, trackId);
    dispatch(collapseTracks({ data: { trackIds, value: collapsed } }));
  };

export const dragTrack =
  (dragId: TrackId, targetId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const undoType = createUndoType("dragTrack", nanoid());
    const drag = selectTrackById(project, dragId);
    const target = selectTrackById(project, targetId);
    if (!drag || !target) return;
    const isDraggingPT = isPatternTrack(drag);
    const isTargetingST = isScaleTrack(target);

    // Swap track positions if they are in the same parent
    if (drag.parentId && drag.parentId === target.parentId) {
      const update1 = { id: drag.id, order: target.order };
      const update2 = { id: target.id, order: drag.order };
      if (update1.order === update2.order) {
        const parent = selectTrackById(project, drag.parentId);
        update1.order = parent?.trackIds?.length ?? (drag.order ?? 0) + 1;
      }
      dispatch(updateTracks({ data: [update1, update2], undoType }));
      return;
    }

    // If dragging PT into ST, migrate the PT
    if (isDraggingPT && isTargetingST) {
      dispatch(updateTrack({ data: { id: dragId, parentId: targetId } }));
      return;
    }
  };

/** Duplicate a track and all of its media/children in the slice and hierarchy. */
export const duplicateTrack =
  (payload: Payload<Track>): Thunk<TrackId> =>
  (dispatch, getProject) => {
    const track = payload.data;
    const undoType = unpackUndoType(payload, "duplicateTrack");
    const project = getProject();

    // Prepare the tracks, clips, and instruments
    const newTrackMap: Record<TrackId, TrackId> = {};
    const newScaleMap: Record<ScaleId, ScaleId> = {};
    const allTracks = [] as Track[];
    const allClips = [] as Clip[];

    // A generic recursive function to add all children of a track
    const addChildren = (ids: TrackId[], parentId?: TrackId) => {
      if (!ids.length) return;

      // Duplicate every child track
      const parent = parentId ? selectTrackById(project, parentId) : undefined;
      const children = ids.map((id) => selectTrackById(project, id));
      children.forEach((child) => {
        if (!child) return;
        // Initialize a new track
        const newParent = initializeTrack({
          ...child,
          parentId,
          order: parent?.trackIds?.length ?? (child?.order ?? 0) + 1,
          trackIds: [],
        });
        newTrackMap[child.id] = newParent.id;

        // If the track is a Pattern Track, add the instrument
        if (isPatternTrack(newParent)) {
          const oldInstrument = selectTrackInstrument(project, child.id);
          if (oldInstrument) {
            const instrument = initializeInstrument(oldInstrument, false);
            const instance = new LiveAudioInstance(instrument);
            LIVE_AUDIO_INSTANCES[instrument.id] = instance;

            // Add the instrument to the store
            newParent.instrumentId = instrument.id;
            dispatch(addInstrument({ data: { instrument }, undoType }));
          }
        }

        // If the track is a Scale Track, add the scale
        if (isScaleTrack(newParent)) {
          const scale = selectTrackScale(project, child.id);
          if (scale) {
            const newScale = initializeScale({
              ...scale,
              trackId: newParent.id,
            });
            newScaleMap[scale.id] = newScale.id;

            // Update the new track's scale ID
            newParent.scaleId = newScale.id;
            dispatch(addScale({ data: newScale, undoType }));
          }
        }

        // Push the track to the list
        allTracks.push(newParent);

        // Initialize new clips pointing to the track
        const clips = selectClipsByTrackIds(project, [child.id]);
        const newClips = clips.map((c) =>
          initializeClip({ ...c, trackId: newParent.id })
        );

        // Add new motifs for each clip
        for (const clip of newClips) {
          if (clip.type === "pattern") {
            const oldPattern = selectPatternById(project, clip.patternId);
            let baseStream: PatternStream | undefined = oldPattern?.stream;
            if (oldPattern) {
              baseStream = oldPattern.stream.map((block) =>
                getPatternBlockWithNewNotes(block, (notes) =>
                  notes.map((note) => {
                    if (!isNestedNote(note)) return note;
                    const scaleId = note.scaleId
                      ? newScaleMap[note.scaleId] ?? note.scaleId
                      : undefined;
                    const offset = note.offset
                      ? replaceVectorKeys(note.offset, newTrackMap)
                      : undefined;
                    return { ...note, scaleId, offset };
                  })
                )
              );
            }
            const pattern = initializePattern({
              ...oldPattern,
              stream: baseStream,
              trackId: newParent.id,
            });
            dispatch(addPattern({ data: pattern, undoType }));
            allClips.push({ ...clip, patternId: pattern.id });
          } else if (clip.type === "pose") {
            const pose = initializePose({
              ...selectPoseById(project, clip.poseId),
              trackId: newParent.id,
            });
            dispatch(addPose({ data: pose, undoType }));
            allClips.push({ ...clip, poseId: pose.id });
          }
        }

        // Recur on the children
        addChildren(child.trackIds, newParent.id);
      });
    };

    // Recursively add all of the descendants of the track
    addChildren([track.id], track.parentId);
    for (const track of allTracks) {
      dispatch(addTrack({ data: track, undoType }));
    }

    // Add every new clip to the store
    dispatch(addClips({ data: allClips, undoType }));
    return newTrackMap[track.id];
  };

/** Clear a track of all media and its children. */
export const clearTrack =
  (
    payload: Payload<{
      trackId: TrackId;
      type?: ClipType;
      cascade?: boolean;
    }>
  ): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const { trackId, type, cascade } = unpackData(payload);
    const track = selectTrackById(project, trackId);
    if (!track) return;
    const undoType = createUndoType("clearTrack", trackId);

    // Get all clip IDs matching the type if specified
    const clips = selectClipsByTrackIds(project, [track.id]);
    if (cascade) {
      const children = selectTrackDescendantIds(project, trackId);
      clips.push(...selectClipsByTrackIds(project, children));
    }
    const clipIds = clips
      .filter((c) => !type || c.type === type)
      .map((c) => c.id);

    // Remove all clips
    dispatch(removeClips({ data: clipIds, undoType }));

    // Remove all portals if no type is specified
    if (!type) {
      const portals = selectPortalsByTrackIds(project, [track.id]);
      const portalIds = portals.map((p) => p.id);
      dispatch(removePortals({ data: portalIds, undoType }));
    }
  };

/** Delete a track. */
export const deleteTrack =
  (payload: Payload<TrackId>): Thunk =>
  (dispatch, getProject) => {
    const trackId = payload.data;
    const undoType = unpackUndoType(payload, "deleteTrack");
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track) return;

    const patterns = selectCustomPatterns(project);
    const poses = selectPoses(project);
    const affectedTracks = selectTrackDescendants(project, trackId);
    const affectedTrackIds = affectedTracks.map((t) => t.id);

    // Clear the editor/selection if showing the deleted track
    const selectedTrackId = selectSelectedTrackId(project);
    const editingTracks = selectIsEditingTracks(project);
    if (trackId === selectedTrackId) {
      dispatch(setSelectedTrackId({ data: undefined, undoType }));
      if (editingTracks) {
        dispatch(clearTimelineState({ undoType }));
      }
    }

    // Remove all media elements
    for (const id of union(affectedTrackIds, [trackId])) {
      const clips = selectClipsByTrackIds(project, [id]);
      const clipIds = clips.map((c) => c.id);
      const portals = selectPortalsByTrackIds(project, [id]);
      const portalIds = portals.map((p) => p.id);
      if (clipIds.length) {
        dispatch(removeClips({ data: clipIds, undoType }));
      }
      if (portalIds.length) {
        dispatch(removePortals({ data: portalIds, undoType }));
      }

      const track = selectTrackById(project, id);

      // Remove the instrument or scale
      if (isPatternTrack(track)) {
        dispatch(
          removeInstrument({
            data: { trackId, id: track.instrumentId },
            undoType,
          })
        );
      } else if (isScaleTrack(track)) {
        dispatch(removeScale({ data: track.scaleId, undoType }));
      }

      // Remove the track
      dispatch(removeTrack({ data: id, undoType }));

      // Remove all empty patterns referencing the track
      for (const pattern of patterns) {
        if (pattern.trackId === id) {
          dispatch(removePattern({ data: pattern.id, undoType }));
        }
      }

      // Remove all empty poses referencing the track
      for (const pose of poses) {
        const vector = pose.vector ?? {};
        if (pose.trackId === id && !Object.values(vector).some((v) => v)) {
          dispatch(removePose({ data: pose.id, undoType }));
        }
      }
    }
  };

/** Select the clips of a track */
export const selectTrackClips =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const clipIds = selectTrackClipIds(project, trackId);
    dispatch(addClipIdsToSelection({ data: clipIds }));
  };

/** Quantize the clips of a track to the nearest ticks based on the current subdivision */
export const quantizeTrackClips =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const undoType = createUndoType("quantizeTrackClips", trackId);
    const clips = selectClipsByTrackIds(project, [trackId]);
    const ticks = selectSubdivisionTicks(project);
    const updatedClips = clips.map((clip) => {
      return { ...clip, tick: Math.round(clip.tick / ticks) * ticks };
    });
    dispatch(updateClips({ data: updatedClips, undoType }));
  };

/** Migrate a track, changing its scale to MIDI if necessary */
export const popTrack =
  (id: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, id);
    if (!track) return;
    const undoType = createUndoType("popTrack", id);

    // If the track is a Scale Track, change it to MIDI
    if (isScaleTrack(track)) {
      const midi = selectTrackMidiScale(project, id);
      dispatch(updateScale({ id: track.scaleId, notes: midi, undoType }));
    }

    // Remove the track's parent and update the order
    const tracks = selectTopLevelTracks(project);
    const data = { id, parentId: undefined, order: tracks.length };
    dispatch(updateTrack({ data, undoType }));
  };

/** Insert a scale track in the place of a track and nest the original track. */
export const insertScaleTrack =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const undoType = createUndoType("insertScaleTrack", nanoid());
    const track = selectTrackById(project, trackId);
    if (!trackId || !track) return;

    // Create a new scale track and migrate the original track if necessary
    const newTrack = dispatch(
      createScaleTrack({
        data: { track: { parentId: track.parentId, trackIds: [trackId] } },
        undoType,
      })
    );

    // Update the track with the new parent
    dispatch(
      updateTrack({
        data: { id: trackId, parentId: newTrack.id },
        undoType,
      })
    );

    // Update all patterns with notes using the parent's scale ID
    if (!isScaleTrack(parent)) return;
    let customPatterns = selectCustomPatterns(project);
    for (const p in customPatterns) {
      let customPattern = customPatterns[p];
      const stream = customPattern.stream;
      for (let i = 0; i < stream.length; i++) {
        customPatterns[p].stream[i] = getPatternBlockWithNewNotes(
          stream[i],
          (notes) =>
            notes.map((note) => {
              if (isNestedNote(note) && note.scaleId === newTrack.scaleId) {
                return { ...note, scaleId: newTrack.scaleId };
              } else {
                return note;
              }
            })
        );
      }
    }
    dispatch(updatePatterns({ data: customPatterns, undoType }));
  };
