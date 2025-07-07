import { nanoid } from "@reduxjs/toolkit";
import {
  Payload,
  createUndoType,
  unpackData,
  unpackUndoType,
} from "types/redux";
import { difference, range, sample, union, uniq } from "lodash";
import {
  selectClipsByTrackIds,
  selectPatternClips,
  selectPoseClips,
} from "types/Clip/ClipSelectors";
import { addPatternClip, addPoseClip, updateClips } from "types/Clip/ClipSlice";
import {
  Clip,
  initializeClip,
  isPatternClip,
  isPoseClip,
} from "types/Clip/ClipTypes";
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
import { Thunk } from "types/Project/ProjectTypes";
import { addScale, removeScale, updateScale } from "types/Scale/ScaleSlice";
import {
  isNestedNote,
  initializeScale,
  ScaleId,
  chromaticNotes,
  ScaleObject,
} from "types/Scale/ScaleTypes";
import {
  selectIsEditingTracks,
  selectSelectedTrackId,
  selectSubdivisionTicks,
} from "types/Timeline/TimelineSelectors";
import {
  clearTimelineState,
  setSelectedTrackId,
} from "types/Timeline/TimelineSlice";
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
  selectTrackAncestors,
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
import { selectPoseById } from "types/Pose/PoseSelectors";
import { addPose, removePose } from "types/Pose/PoseSlice";
import {
  addPattern,
  removePattern,
  updatePattern,
} from "types/Pattern/PatternSlice";
import {
  getMidiStreamScale,
  getPatternBlockWithNewNotes,
} from "types/Pattern/PatternUtils";
import { addClipIdsToSelection } from "types/Timeline/thunks/TimelineSelectionThunks";
import { selectTrackClipIds } from "types/Arrangement/ArrangementTrackSelectors";
import { initializePose } from "types/Pose/PoseTypes";
import { remapVector } from "utils/vector";
import { trackActions } from "./TrackSlice";
import {
  selectPortaledClips,
  selectPortaledPatternClipStream,
} from "types/Arrangement/ArrangementSelectors";
import { ScaleTrack } from "./ScaleTrack/ScaleTrackTypes";
import { convertMidiToNestedNote } from "./TrackUtils";
import { MidiScale } from "utils/midi";
import { createScaleTrack } from "./ScaleTrack/ScaleTrackThunks";
import { deleteMedia } from "types/Media/MediaThunks";
import {
  createNewPatternClip,
  createNewPoseClip,
} from "./PatternTrack/PatternTrackThunks";

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
  (payload?: Payload<{ trackIds?: TrackId[]; value?: boolean }>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const payloadData = unpackData(payload);
    const { trackIds: ids, value } = payloadData ?? {};
    const selectedTrackId = selectSelectedTrackId(project);
    const trackIds = ids ?? (selectedTrackId ? [selectedTrackId] : []);
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
  (trackId?: TrackId, collapsed = true, includeSelf = false): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    if (trackId) {
      const trackIds = selectTrackDescendantIds(project, trackId);
      if (includeSelf) trackIds.push(trackId);
      dispatch(collapseTracks({ data: { trackIds, value: collapsed } }));
    } else {
      const trackId = selectSelectedTrackId(project);
      if (!trackId) return;
      const chain = selectTrackDescendants(project, trackId);
      const isChildCollapsed = chain.some((track) => track?.collapsed);
      dispatch(
        collapseTrackDescendants(trackId, !isChildCollapsed, includeSelf)
      );
    }
  };

/** Collapse all ancestors of a track. */
export const collapseTrackAncestors =
  (trackId?: TrackId, collapsed = true): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    if (trackId) {
      const ancestorIds = selectTrackAncestorIds(project, trackId);
      const trackIds = [...ancestorIds, trackId];
      dispatch(collapseTracks({ data: { trackIds, value: collapsed } }));
    } else {
      const trackId = selectSelectedTrackId(project);
      if (!trackId) return;
      const parents = selectTrackAncestors(project, trackId);
      const isParentCollapsed = parents.some((track) => track?.collapsed);
      dispatch(collapseTrackAncestors(trackId, !isParentCollapsed));
    }
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
            const newScale = initializeScale({ ...scale });
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
          if (isPatternClip(clip)) {
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
                      ? remapVector(note.offset, newTrackMap)
                      : undefined;
                    return { ...note, scaleId, offset };
                  })
                )
              );
            }
            const pattern = initializePattern({
              ...oldPattern,
              stream: baseStream,
            });
            dispatch(addPattern({ data: pattern, undoType }));
            dispatch(addPatternClip({ ...clip, patternId: pattern.id }));
          } else if (isPoseClip(clip)) {
            const pose = initializePose({
              ...selectPoseById(project, clip.poseId),
            });
            dispatch(addPose({ data: pose, undoType }));
            dispatch(addPoseClip({ ...clip, poseId: pose.id }));
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
    return newTrackMap[track.id];
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
        dispatch(deleteMedia({ data: { clipIds }, undoType }));
      }
      if (portalIds.length) {
        dispatch(deleteMedia({ data: { portalIds }, undoType }));
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

      for (const clip of clips) {
        if (isPatternClip(clip)) {
          const clips = selectPatternClips(getProject()).filter(
            (c) => c.patternId === clip.patternId
          );
          if (clips.length === 0) {
            dispatch(removePattern({ data: clip.patternId, undoType }));
          }
        } else if (isPoseClip(clip)) {
          const clips = selectPoseClips(getProject()).filter(
            (c) => c.poseId === clip.poseId
          );
          if (clips.length === 0) {
            dispatch(removePose({ data: clip.poseId, undoType }));
          }
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
  (
    payload: Payload<{
      trackId: TrackId;
      initialTrack?: Partial<ScaleTrack>;
      initialScale?: ScaleObject;
    }>
  ): Thunk<ScaleTrack | undefined> =>
  (dispatch, getProject) => {
    const { initialTrack, initialScale, trackId } = unpackData(payload);
    const project = getProject();
    const undoType = unpackUndoType(payload, "insertScaleTrack");
    const track = selectTrackById(project, trackId);
    if (!trackId || !track) return;

    // Create a new scale track and migrate the original track if necessary
    const newTrack = dispatch(
      createScaleTrack({
        data: {
          scale: initialScale,
          track: {
            ...initialTrack,
            parentId: track.parentId,
            trackIds: [trackId],
          },
        },
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
    const customPatterns = selectCustomPatterns(project);
    for (const p in customPatterns) {
      const customPattern = customPatterns[p];
      const stream = customPattern.stream;
      dispatch(
        updatePattern({
          data: {
            id: customPattern.id,
            stream: stream.map((b) =>
              getPatternBlockWithNewNotes(b, (notes) =>
                notes.map((note) =>
                  isNestedNote(note)
                    ? { ...note, scaleId: newTrack.scaleId }
                    : note
                )
              )
            ),
          },
          undoType,
        })
      );
    }

    return newTrack;
  };

/** Insert a random parent based on the pattern clip/scale notes of a track. */
export const insertRandomParent =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const undoType = createUndoType("insertRandomParent", nanoid());
    const track = selectTrackById(project, trackId);
    if (!track) return;
    const trackScale = selectTrackMidiScale(project, track.id);
    let scale: MidiScale = chromaticNotes;

    // If the track is a scale track, try adding a note to its scale
    if (isScaleTrack(track)) {
      if (trackScale.length >= 11) {
        scale = trackScale;
      } else {
        const min = Math.min(...trackScale);
        const max = min + 12;
        // Sample a missing class in between the min and max
        const missing = range(min, max).filter((i) => !trackScale.includes(i));
        const value = sample(missing);
        if (value !== undefined) {
          scale = trackScale
            .toSpliced(trackScale.indexOf(value), 0, value)
            .sort();
        }
      }
    }

    // Otherwise, use the notes of the pattern clips
    else if (isPatternTrack(track)) {
      const clips = selectPortaledClips(project);
      const patternClips = clips.filter(
        (c) => isPatternClip(c) && c.trackId === track.id
      );
      const streams = patternClips.map((clip) =>
        selectPortaledPatternClipStream(project, clip.id)
      );
      const notes = streams.flatMap((stream) =>
        stream.flatMap((block) => block.notes.filter((n) => "MIDI" in n))
      );
      if (!notes.length) return;
      const streamScale = uniq(getMidiStreamScale(notes));
      scale = streamScale as MidiScale;
    }

    const nestedScale = scale.map((midi) =>
      dispatch(convertMidiToNestedNote(midi, track.parentId))
    );

    const newScale = initializeScale({
      notes: nestedScale,
    });
    if (track.scaleId) {
      dispatch(
        updateScale({
          data: {
            id: track.scaleId,
            notes: trackScale.map((_, i) => ({ degree: i })),
          },
          undoType,
        })
      );
    }

    // Create a new scale track and migrate the original track
    const newTrack = dispatch(
      insertScaleTrack({
        data: { trackId, initialScale: newScale },
        undoType,
      })
    );
    if (newTrack && track.scaleId) {
      const newOldScale = trackScale.map((midi) =>
        dispatch(convertMidiToNestedNote(midi, newTrack.id))
      );
      dispatch(
        updateScale({
          data: { id: track.scaleId, notes: newOldScale },
          undoType,
        })
      );
    }
  };

export const createTrackPair =
  (data: Payload<TrackId>): Thunk =>
  (dispatch) => {
    const trackId = unpackData(data);
    const undoType = unpackUndoType(data, "createTrackPair");
    dispatch(
      createNewPatternClip({
        data: { clip: { trackId }, randomize: true, autobind: true },
        undoType,
      })
    );
    dispatch(createNewPoseClip({ data: { clip: { trackId } }, undoType }));
  };
