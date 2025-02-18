import { nanoid } from "@reduxjs/toolkit";
import { Payload, createUndoType, unpackUndoType } from "lib/redux";
import { union, difference, range, isString } from "lodash";
import { selectClipsByTrackIds } from "types/Clip/ClipSelectors";
import { addClips, removeClips, updateClips } from "types/Clip/ClipSlice";
import { Clip, ClipType, initializeClip } from "types/Clip/ClipTypes";
import { hideEditor } from "types/Editor/EditorSlice";
import {
  LiveAudioInstance,
  LIVE_AUDIO_INSTANCES,
} from "types/Instrument/InstrumentClass";
import { selectInstrumentById } from "types/Instrument/InstrumentSelectors";
import {
  addInstrument,
  removeInstrument,
  muteInstruments,
  unmuteInstruments,
  soloInstruments,
  unsoloInstruments,
  updateInstrument,
} from "types/Instrument/InstrumentSlice";
import {
  initializeInstrument,
  Instrument,
} from "types/Instrument/InstrumentTypes";
import { PatternNote } from "types/Pattern/PatternTypes";
import { selectPortalsByTrackIds } from "types/Portal/PortalSelectors";
import { removePortals } from "types/Portal/PortalSlice";
import { Thunk } from "types/Project/ProjectTypes";
import { addScale, removeScale, updateScale } from "types/Scale/ScaleSlice";
import {
  ScaleObject,
  isNestedNote,
  initializeScale,
  NestedNote,
  chromaticNotes,
} from "types/Scale/ScaleTypes";
import {
  selectSelectedTrackId,
  selectSubdivisionTicks,
} from "types/Timeline/TimelineSelectors";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import { isHoldingOption } from "utils/html";
import { getArrayByKey, getValueByKey, spliceOrPush } from "utils/objects";
import { createPatternTrack } from "./PatternTrack/PatternTrackThunks";
import { PatternTrack, PatternTrackId } from "./PatternTrack/PatternTrackTypes";
import { createScaleTrack } from "./ScaleTrack/ScaleTrackThunks";
import { isScaleTrackId } from "./ScaleTrack/ScaleTrackTypes";
import {
  selectTracks,
  selectTrackMap,
  selectTrackById,
  selectTrackInstrument,
  selectTrackScale,
  selectTrackDescendants,
  selectTrackMidiScale,
  selectScaleTrackByScaleId,
  selectPatternTrackById,
  selectScaleTrackMap,
  selectTrackScaleChain,
  selectTrackMidiScaleMap,
  selectTrackChainIds,
  selectTrackAncestorIds,
  selectTrackDescendantIds,
  selectTopLevelTracks,
} from "./TrackSelectors";
import { scaleTrackSlice, patternTrackSlice } from "./TrackSlice";
import {
  TrackId,
  initializeTrack,
  isPatternTrack,
  isScaleTrack,
  Track,
  TrackUpdate,
} from "./TrackTypes";
import { resolveScaleNoteToMidi } from "types/Scale/ScaleResolvers";
import { mod } from "utils/math";
import { getMidiOctaveDistance, MidiScale, MidiValue } from "utils/midi";
import { resolvePatternNoteToMidi } from "types/Pattern/PatternResolvers";
import { selectCustomPatterns } from "types/Pattern/PatternSelectors";
import { selectPoses } from "types/Pose/PoseSelectors";
import { removePose } from "types/Pose/PoseSlice";
import { removePattern, updatePatterns } from "types/Pattern/PatternSlice";
import { getPatternBlockWithNewNotes } from "types/Pattern/PatternUtils";
import { createMedia } from "types/Media/MediaThunks";
import { getTransport } from "tone";

/** Add an array of tracks to the store. */
export const addTracks =
  (payload: Payload<Track[]>): Thunk =>
  (dispatch, getProject) => {
    const tracks = payload.data;
    const undoType = unpackUndoType(payload, "addTracks");
    const project = getProject();

    // Iterate through each track
    for (const track of tracks) {
      const parent = track.parentId
        ? selectTrackById(project, track.parentId)
        : undefined;
      const parentId = parent?.id;

      // Add the track to its parent if it exists
      if (parent && isScaleTrackId(parentId)) {
        const parentTrackIds = union<TrackId>(parent.trackIds, [track.id]);
        const data = { id: parentId, trackIds: parentTrackIds };
        dispatch(scaleTrackSlice.actions.updateOne({ data, undoType }));
      }

      // Add the track to the store
      if (isScaleTrack(track)) {
        dispatch(scaleTrackSlice.actions.addOne({ data: track, undoType }));
      } else if (isPatternTrack(track)) {
        dispatch(patternTrackSlice.actions.addOne({ data: track, undoType }));
      }
    }
  };

/** Add a single track to the store. */
export const addTrack =
  (payload: Payload<Track>): Thunk =>
  (dispatch) => {
    dispatch(addTracks({ ...payload, data: [payload.data] }));
  };

/** Update a list of tracks in the store. */
export const updateTracks =
  (payload: Payload<TrackUpdate[]>): Thunk =>
  (dispatch) => {
    const tracks = payload.data;
    const undoType = unpackUndoType(payload, "updateTracks");
    for (const track of tracks) {
      if (isScaleTrack(track)) {
        dispatch(scaleTrackSlice.actions.updateOne({ data: track, undoType }));
      } else if (isPatternTrack(track)) {
        dispatch(
          patternTrackSlice.actions.updateOne({ data: track, undoType })
        );
      }
    }
  };

/** Update a single track in the store. */
export const updateTrack =
  (payload: Payload<TrackUpdate>): Thunk =>
  (dispatch) => {
    dispatch(updateTracks({ ...payload, data: [payload.data] }));
  };

/** Remove tracks from the store. */
export const removeTracks =
  (payload: Payload<TrackId[]>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const trackIds = payload.data;
    const undoType = unpackUndoType(payload, "removeTracks");

    // Iterate through each track in the store
    const tracks = selectTracks(project);
    for (const track of tracks) {
      // If the track includes any ID, remove it
      const filteredTrackIds = difference(track.trackIds, trackIds);
      if (filteredTrackIds.length === track.trackIds.length) continue;
      dispatch(
        updateTrack({
          data: { id: track.id, trackIds: filteredTrackIds },
          undoType,
        })
      );
    }

    // Remove the tracks from the store
    for (const trackId of trackIds) {
      if (isScaleTrackId(trackId)) {
        dispatch(
          scaleTrackSlice.actions.removeOne({ data: trackId, undoType })
        );
      } else {
        dispatch(
          patternTrackSlice.actions.removeOne({ data: trackId, undoType })
        );
      }
    }
    return trackIds;
  };
/** Remove a track from the store. */
export const removeTrack =
  (payload: Payload<TrackId>): Thunk =>
  (dispatch) =>
    dispatch(removeTracks({ ...payload, data: [payload.data] }));

/** Collapse tracks in the store. */
export const collapseTracks =
  (payload: Payload<TrackId[]>, collapsed = true): Thunk =>
  (dispatch) => {
    const trackIds = payload.data;
    dispatch(updateTracks({ data: trackIds.map((id) => ({ id, collapsed })) }));
  };

/** Move a track to a new index in its parent track. */
export const moveTrack =
  (payload: Payload<{ id: TrackId; index?: number }>): Thunk =>
  (dispatch, getProject) => {
    const undoType = createUndoType("moveTrack", payload);
    const project = getProject();
    const tracks = selectTracks(project);
    const trackMap = selectTrackMap(project);
    const track = trackMap[payload.data.id];
    if (!track) return;

    // Try to find a parent track
    const { id, index } = payload.data;
    const parent = tracks.find((_) => _.trackIds.includes(id));

    // Find the index and make sure it's valid within the parent
    const oldIndex = parent ? parent.trackIds.indexOf(id) : -1;
    if (oldIndex < 0 && !!parent) return;

    // If the track has a parent, splice accordingly
    if (parent) {
      const parentTrackIds = [...parent.trackIds];
      parentTrackIds.splice(oldIndex, 1);
      spliceOrPush(parentTrackIds, id, index);
      const data = { id: parent.id, trackIds: parentTrackIds };
      dispatch(updateTrack({ data, undoType }));
      return;
    }

    // Otherwise, swap the tracks by order
    const otherTrack = tracks.find((_, i) => i === index);
    if (otherTrack) {
      if (otherTrack.id === id) return;
      dispatch(
        updateTracks({
          data: [
            { id, order: index },
            { id: otherTrack.id, order: track.order },
          ],
          undoType,
        })
      );
    }
  };

/** Migrate a track to a new index in a new parent track. */
export const migrateTrack =
  (
    payload: Payload<{
      id: TrackId;
      parentId: TrackId;
      index?: number;
    }>
  ): Thunk =>
  (dispatch, getProject) => {
    const undoType = unpackUndoType(payload, "migrateTrack");
    const project = getProject();
    const tracks = selectTracks(project);
    const trackMap = selectTrackMap(project);
    const scaleTrackMap = selectScaleTrackMap(project);
    const { id, parentId, index } = payload.data;
    const track = trackMap[id];
    if (!track) return;
    if (track.parentId === parentId) return;

    // Find the old parent track
    const oldParent = tracks.find((_) => _.trackIds.includes(id));
    if (!oldParent) return;

    // Remove the track from the old parent
    const oldIndex = oldParent.trackIds.indexOf(id);
    const oldTrackIds = [...oldParent.trackIds].toSpliced(oldIndex, 1);

    // Insert the track into the new parent
    const newParent = scaleTrackMap[parentId];
    if (!newParent) return;
    const newTrackIds = [...newParent.trackIds];
    if (!newTrackIds.includes(id)) {
      spliceOrPush(newTrackIds, id, index);
    }
    dispatch(
      updateTracks({
        data: [
          { id: oldParent.id, trackIds: oldTrackIds },
          { id: newParent.id, trackIds: newTrackIds },
          { id, parentId: newParent.id },
        ],
        undoType,
      })
    );
  };

/** Bind a track to a port. */
export const bindTrackToPort =
  (payload: Payload<{ id: TrackId; port: number }>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const { id, port } = payload.data;
    const tracks = selectTracks(project);

    // Clear any tracks with the port
    for (const track of tracks) {
      if (track.port === port) {
        dispatch(
          updateTrack({ ...payload, data: { id: track.id, port: undefined } })
        );
      }
    }

    // Bind the track to the port
    dispatch(updateTrack({ ...payload, data: { id, port } }));
  };

/** Create a new Scale Track and Pattern Track. */
export const createTrackTree =
  (payload?: Payload<null, true>): Thunk<PatternTrack> =>
  (dispatch) => {
    const undoType = unpackUndoType(payload, "createTrackTree");
    const parentId = dispatch(createScaleTrack({}, undefined, undoType)).id;
    const { track } = dispatch(
      createPatternTrack({ parentId }, undefined, undoType)
    );
    return track;
  };

/** Duplicate a track and all of its media/children in the slice and hierarchy. */
export const duplicateTrack =
  (id: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, id);
    if (!track) return;
    const undoType = createUndoType("duplicateTrack", id);

    // Create the new track and get the new clips
    const newTrack = initializeTrack({ ...track, trackIds: [] });
    const clips = selectClipsByTrackIds(project, [track.id]);
    const newClips = clips.map((c) =>
      initializeClip({ ...c, trackId: newTrack.id })
    );

    // Prepare the tracks, clips, and instruments
    const allTracks = [newTrack];
    const allClips = [...newClips];
    const allInstruments = [] as Instrument[];
    const allScales = [] as ScaleObject[];

    // If the track is a Pattern Track, add the instrument
    if (isPatternTrack(newTrack)) {
      const instrument = selectTrackInstrument(project, track.id);
      if (instrument) {
        const newInstrument = initializeInstrument(instrument, false);
        allInstruments.push(newInstrument);

        // Update the new track's instrument ID
        newTrack.instrumentId = newInstrument.id;
      }
    }

    // If the track is a Scale Track, add the scale
    if (isScaleTrack(newTrack)) {
      const scale = selectTrackScale(project, track.id);
      if (scale) {
        const newScale = initializeScale({
          ...scale,
          trackId: newTrack.id,
        });
        allScales.push(newScale);

        // Update the new track's scale ID
        newTrack.scaleId = newScale.id;
      }
    }

    // A generic recursive function to add all children of a track
    const addChildren = (ids: TrackId[], parentId: TrackId) => {
      if (!ids.length) return;

      // Duplicate every child track
      const children = ids.map((id) => selectTrackById(project, id));
      children.forEach((child) => {
        if (!child) return;
        // Initialize a new track
        const newParent = initializeTrack({ ...child, parentId, trackIds: [] });

        // If the track is a Pattern Track, add the instrument
        if (isPatternTrack(newParent)) {
          const instrument = selectTrackInstrument(project, child.id);
          if (instrument) {
            const newInstrument = initializeInstrument(instrument, false);
            allInstruments.push(newInstrument);

            // Update the new track's instrument ID
            newParent.instrumentId = newInstrument.id;
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
            allScales.push(newScale);

            // Update the new track's scale ID
            newParent.scaleId = newScale.id;
          }
        }

        // Push the track to the list
        allTracks.push(newParent);

        // Update the child track IDs of the parent track
        const parentIndex = allTracks.findIndex((t) => t.id === parentId);
        const parent = allTracks[parentIndex];
        if (parent) {
          const update = { trackIds: union(parent.trackIds, newParent.id) };
          allTracks[parentIndex] = { ...parent, ...update } as Track;
        }

        // Add all clips of the track
        const clips = selectClipsByTrackIds(project, [child.id]);
        const newClips = clips.map((c) =>
          initializeClip({ ...c, trackId: newParent.id })
        );
        allClips.push(...newClips);

        // Recur on the children
        addChildren(child.trackIds, newParent.id);
      });
    };

    // Recursively add all of the descendants of the track
    addChildren(track.trackIds, newTrack.id);

    // Add every new track to the store
    allTracks.forEach((track) => {
      dispatch(addTrack({ data: track, undoType }));

      if (isPatternTrack(track)) {
        // Get the instrument of the track if it exists
        const instrument = allInstruments.find(
          (i) => i.id === track.instrumentId
        );
        if (!instrument) return;

        // Add the instrument to the store
        dispatch(addInstrument({ data: { instrument }, undoType }));

        // Create and store the corresponding instance
        const instance = new LiveAudioInstance(instrument);
        LIVE_AUDIO_INSTANCES[instrument.id] = instance;
      }

      if (isScaleTrack(track)) {
        const scale = allScales.find((s) => s.id === track.scaleId);
        if (!scale) return;

        // Add the scale to the store
        dispatch(addScale({ data: scale, undoType }));
      }
    });

    // Add every new clip to the store
    dispatch(addClips({ data: allClips, undoType }));
  };

/** Clear a track of all media and its children. */
export const clearTrack =
  (trackId: TrackId, type?: ClipType, clearChildren = false): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track) return;
    const undoType = createUndoType("clearTrack", trackId);

    // Get all clip IDs matching the type if specified
    const clips = selectClipsByTrackIds(project, [track.id]);
    if (clearChildren) {
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
    if (selectedTrackId === trackId) {
      dispatch(setSelectedTrackId({ data: null, undoType }));
      dispatch(hideEditor({ data: null, undoType }));
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
        if (pattern.trackId === id && !pattern.stream.length) {
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

/** Quantize the clips of a track to the nearest ticks based on the current subdivision */
export const quantizeTrackClips =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const clips = selectClipsByTrackIds(project, [trackId]);
    const ticks = selectSubdivisionTicks(project);
    const undoType = createUndoType("quantizeTrackClips", trackId);
    const updatedClips = clips.map((clip) => {
      const tick = Math.round(clip.tick / ticks) * ticks;
      return { ...clip, tick };
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
    dispatch(
      updateTrack({
        data: { id, parentId: undefined, order: tracks.length },
        undoType,
      })
    );
  };

/** Insert a scale track in the place of a track and nest the original track. */
export const insertScaleTrack =
  (trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    if (!trackId) return;
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track) return;

    // Create a new scale track and migrate the original track if necessary
    const undoType = createUndoType("insertScaleTrack", nanoid());
    const newTrack = dispatch(
      createScaleTrack(
        { parentId: track.parentId, trackIds: [trackId] },
        undefined,
        undoType
      )
    );
    console.log(track, newTrack);

    // If the track has a parent, update its children
    if (track.parentId) {
      const parent = selectTrackById(project, track.parentId);
      if (!parent) return;
      const index = parent.trackIds.indexOf(trackId);
      const newTrackIds = parent.trackIds.map((_, i) =>
        i === index ? newTrack.id : _
      );
      dispatch(
        updateTrack({
          data: { id: track.parentId, trackIds: newTrackIds },
          undoType,
        })
      );

      // Update the original track's parent
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
                if (isNestedNote(note) && note.scaleId === parent.scaleId) {
                  return { ...note, scaleId: newTrack.scaleId };
                } else {
                  return note;
                }
              })
          );
        }
      }
      dispatch(updatePatterns({ data: customPatterns, undoType }));
    } else {
      // Otherwise, move the track to the new track
      dispatch(
        migrateTrack({ data: { id: trackId, parentId: newTrack.id }, undoType })
      );
    }
  };

/** Collapse all children of a track. */
export const collapseTrackChildren =
  (trackId: TrackId, collapsed = true): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const children = selectTrackDescendants(project, trackId);
    dispatch(collapseTracks({ data: children.map((c) => c.id) }, collapsed));
  };

/** Collapse all parents of a track. */
export const collapseTrackParents =
  (trackId: TrackId, collapsed = true): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const parentIds = selectTrackAncestorIds(project, trackId);
    dispatch(collapseTracks({ data: parentIds }, collapsed));
  };

/** Convert a midi into a nested note */
export const convertMidiToNestedNote =
  (midi: MidiValue, parent?: TrackId | MidiScale): Thunk<NestedNote> =>
  (dispatch, getProject) => {
    const parentScale = isString(parent)
      ? selectTrackMidiScale(getProject(), parent)
      : parent ?? chromaticNotes;
    let degree = parentScale.findIndex((s) => s % 12 === midi % 12);
    const octave = getMidiOctaveDistance(parentScale[degree], midi);
    return { degree, offset: { octave } };
  };

/** Get the degree of the pattern note in the given track's scale.  */
export const getDegreeOfNoteInTrack =
  (trackId?: TrackId, patternNote?: PatternNote): Thunk<number> =>
  (dispatch, getProject) => {
    if (!trackId || !patternNote) return -1;
    const project = getProject();
    const trackMidiScale = selectTrackMidiScale(project, trackId);
    const isNested = !("MIDI" in patternNote);

    // Get the MIDI of the note, realizing if necessary
    let MIDI: number;
    if (!isNested) MIDI = patternNote.MIDI;
    else {
      // Chain the note through its scales
      const track = selectScaleTrackByScaleId(project, patternNote?.scaleId);
      const chain = selectTrackScaleChain(project, track?.id);
      MIDI = resolveScaleNoteToMidi(patternNote, chain);
    }

    // Index the MIDI scale and return the degree
    if (MIDI < 0) return -1;
    return trackMidiScale.findIndex((s) => s % 12 === MIDI % 12);
  };

/** Get the best matching note based on the given track. */
export const autoBindNoteToTrack =
  (trackId: TrackId, note: PatternNote): Thunk<PatternNote> =>
  (dispatch, getProject) => {
    const project = getProject();
    const midi = resolvePatternNoteToMidi(note);
    const scaleTrackMap = selectScaleTrackMap(project);
    const trackScaleMap = selectTrackMidiScaleMap(project);
    const chainIds = selectTrackChainIds(project, trackId);
    const idCount = chainIds.length;
    if (!idCount) return note;

    const trackScaleId = scaleTrackMap[chainIds[0]]?.scaleId;
    const tonicScale = selectTrackMidiScale(project, trackId);
    const chromaticScale = range(tonicScale[0], tonicScale[0] + 12);

    // Get the current track and scale
    for (let i = idCount - 1; i >= 0; i--) {
      const trackId = chainIds[i];
      const track = getValueByKey(scaleTrackMap, trackId);
      const scaleId = track?.scaleId;
      const scale = getArrayByKey(trackScaleMap, trackId);
      const scaleNote: PatternNote = { ...note, scaleId };

      // Check for an exact match with the current scale
      const degree = dispatch(getDegreeOfNoteInTrack(trackId, note));
      if (degree > -1) {
        const octave = getMidiOctaveDistance(scale[degree], midi);
        note = { ...scaleNote, degree, offset: { octave } };
        if ("MIDI" in note) delete note.MIDI;
        return note;
      }

      // Otherwise, check parent scales for neighbors, preferring deep matches first
      const parentIds = chainIds.slice(0, i).toReversed();
      const trackIds: (TrackId | "T")[] = [...parentIds, "T"];

      // Iterate over all scale offsets
      for (let i = 0; i < trackIds.length; i++) {
        const id = trackIds[i];
        const parentTrack = getValueByKey(scaleTrackMap, id);
        const parentScaleId = id === "T" ? "chromatic" : parentTrack?.scaleId;
        if (!parentScaleId) continue;

        // Check the parent scale (or chromatic scale at the end)
        const parentScale = id === "T" ? chromaticScale : trackScaleMap[id];
        const parentSize = parentScale.length;
        const degree =
          id === "T"
            ? chromaticScale.findIndex((n) => n % 12 === midi % 12)
            : dispatch(getDegreeOfNoteInTrack(id, scaleNote));
        if (degree === -1) continue;

        // Check if the note can be lowered to fit in the scale
        const lower = mod(degree - 1, parentSize);
        const lowerWrap = Math.floor((degree - 1) / parentSize);
        const lowerMIDI = parentScale?.[lower] ?? 0;
        const lowerNote = { ...scaleNote, MIDI: lowerMIDI };
        const lowerDegree = dispatch(
          getDegreeOfNoteInTrack(trackId, lowerNote)
        );

        // If the lowered note exists in the current scale, add the note as an upper neighbor
        if (lowerDegree > -1) {
          const octave =
            getMidiOctaveDistance(parentScale[degree], midi) + lowerWrap;

          const offset = { [parentScaleId]: 1, octave };
          note = { ...scaleNote, degree: lowerDegree, offset };
          if ("MIDI" in note) delete note.MIDI;
          return note;
        }

        // Check if the note can be raised to fit in the scale
        const upper = mod(degree + 1, parentSize);
        const upperMIDI = parentScale?.[upper] ?? 0;
        const upperNote = { ...scaleNote, MIDI: upperMIDI };
        const upperWrap = Math.floor((degree + 1) / parentSize);
        const upperDegree = dispatch(
          getDegreeOfNoteInTrack(trackId, upperNote)
        );

        // If the raised note exists in the current scale, add the note as a lower neighbor
        if (upperDegree > -1) {
          const octave =
            getMidiOctaveDistance(parentScale[degree], midi) + upperWrap;
          const offset = { [parentScaleId]: -1, octave };
          note = { ...scaleNote, degree: upperDegree, offset };
          if ("MIDI" in note) delete note.MIDI;
          return note;
        }
      }
    }

    // If no match has been found, manually set the note as a neighbor of the tonic
    const offset = { chromatic: midi - tonicScale[0] };
    const updatedNote: PatternNote = {
      ...note,
      degree: 0,
      offset,
      scaleId: trackScaleId,
    };
    if ("MIDI" in updatedNote) delete updatedNote.MIDI;
    return updatedNote;
  };

/** Mute all tracks. */
export const muteTracks = (): Thunk => (dispatch) => {
  dispatch(muteInstruments());
};

/** Unmute all tracks. */
export const unmuteTracks = (): Thunk => (dispatch) => {
  dispatch(unmuteInstruments());
};

/** Solo all tracks. */
export const soloTracks = (): Thunk => (dispatch) => {
  dispatch(soloInstruments());
};

/** Unsolo all tracks. */
export const unsoloTracks = (): Thunk => (dispatch) => {
  dispatch(unsoloInstruments());
};

/** Toggle the mute state of a track. */
export const toggleTrackMute =
  (e: MouseEvent, id: PatternTrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectPatternTrackById(project, id);
    if (!track) return;

    // Get the track's instrument
    const { instrumentId } = track;
    const instrument = selectInstrumentById(project, instrumentId);
    if (!instrument) return;

    // If not holding option, toggle the track mute
    if (!e || !isHoldingOption(e)) {
      const update = { mute: !instrument.mute };
      dispatch(updateInstrument({ data: { id: instrumentId, update } }));
      return;
    }

    // Otherwise, toggle all tracks
    dispatch(instrument.mute ? unmuteTracks() : muteTracks());
  };

/** Toggle the solo state of a track. */
export const toggleTrackSolo =
  (e: MouseEvent, id: PatternTrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectPatternTrackById(project, id);
    if (!track) return;

    // Get the track's instrument
    const { instrumentId } = track;
    const instrument = selectInstrumentById(project, instrumentId);
    if (!instrument) return;

    // If not holding option, toggle the track solo
    if (!e || !isHoldingOption(e)) {
      const update = { solo: !instrument.solo };
      dispatch(updateInstrument({ data: { id: instrumentId, update } }));
      return;
    }

    // Otherwise, toggle all tracks
    dispatch(instrument.solo ? unsoloTracks() : soloTracks());
  };
