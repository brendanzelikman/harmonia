import { nanoid } from "@reduxjs/toolkit";
import { Action, Payload, createUndoType, unpackUndoType } from "lib/redux";
import { union, difference } from "lodash";
import { selectClipsByTrackIds } from "types/Clip/ClipSelectors";
import { addClips, removeClips } from "types/Clip/ClipSlice";
import { initializeClip } from "types/Clip/ClipTypes";
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
import { addScale, removeScale } from "types/Scale/ScaleSlice";
import {
  ScaleObject,
  isNestedNote,
  initializeScale,
  chromaticNotes,
} from "types/Scale/ScaleTypes";
import { selectSelectedTrackId } from "types/Timeline/TimelineSelectors";
import { setSelectedTrackId } from "types/Timeline/TimelineSlice";
import { isHoldingOption } from "utils/html";
import { getArrayByKey, getValueByKey, spliceOrPush } from "utils/objects";
import { createPatternTrack } from "./PatternTrack/PatternTrackThunks";
import { PatternTrackId } from "./PatternTrack/PatternTrackTypes";
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
import { getMidiOctaveDistance } from "utils/midi";
import { resolvePatternNoteToMidi } from "types/Pattern/PatternResolvers";

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
  (payload: Payload<TrackId[]>): Thunk =>
  (dispatch) => {
    const trackIds = payload.data;
    dispatch(
      updateTracks({
        ...payload,
        data: trackIds.map((id) => ({ id, collapsed: true })),
      })
    );
  };

/** Expand tracks in the store. */
export const expandTracks =
  (payload: Payload<TrackId[]>): Thunk =>
  (dispatch) => {
    const trackIds = payload.data;
    dispatch(
      updateTracks({
        ...payload,
        data: trackIds.map((id) => ({ id, collapsed: false })),
      })
    );
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
  (action?: Payload<{}, true>): Thunk<PatternTrackId> =>
  (dispatch) => {
    const undoType = createUndoType("createTrackTree", nanoid());
    const parentId = dispatch(createScaleTrack({}, undefined, undoType));
    return dispatch(createPatternTrack({ parentId }, undefined, undoType));
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
          scaleTrackId: newTrack.id,
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
              scaleTrackId: newParent.id,
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

/** Clear a track of all media. */
export const clearTrack =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track) return;
    const undoType = createUndoType("clearTrack", trackId);

    // Get all media IDs
    const clips = selectClipsByTrackIds(project, [track.id]);
    const clipIds = clips.map((c) => c.id);
    const portals = selectPortalsByTrackIds(project, [track.id]);
    const portalIds = portals.map((p) => p.id);

    // Remove all media
    dispatch(removeClips({ data: clipIds, undoType }));
    dispatch(removePortals({ data: portalIds, undoType }));
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
      if (!track) continue;

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
    }
  };

/** Insert a scale track in the place of a track and nest the original test. */
export const insertScaleTrack =
  (trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    if (!trackId) return;
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track) return;

    // Create a new scale track and migrate the original track if necessary
    const undoType = createUndoType("insertScaleTrack", nanoid());
    const newTrackId = dispatch(
      createScaleTrack(
        { parentId: track.parentId, trackIds: [trackId] },
        undefined,
        undoType
      )
    );

    // If the track has a parent, update its children
    if (track.parentId) {
      const parent = selectTrackById(project, track.parentId);
      if (!parent) return;
      const index = parent.trackIds.indexOf(trackId);
      const newTrackIds = parent.trackIds.map((_, i) =>
        i === index ? newTrackId : _
      );
      dispatch(
        updateTrack({
          data: { id: track.parentId, trackIds: newTrackIds },
          undoType,
        })
      );
    }

    // Update the original track's parent
    dispatch(
      updateTrack({
        data: { id: trackId, parentId: newTrackId },
        undoType,
      })
    );
  };

/** Collapse all children of a track in the slice and hierarchy. */
export const collapseTrackChildren =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track || isPatternTrack(track)) return;
    const children = selectTrackDescendants(project, track.id);
    dispatch(collapseTracks({ data: children.map((c) => c.id) }));
  };

/** Expand all children of a track in the slice and hierarchy. */
export const expandTrackChildren =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track || isPatternTrack(track)) return;
    const children = selectTrackDescendants(project, track.id);
    dispatch(expandTracks({ data: children.map((c) => c.id) }));
  };

/** Get the degree of the pattern note in the given track's scale.  */
export const getDegreeOfNoteInTrack =
  (trackId?: TrackId, patternNote?: PatternNote): Thunk<number> =>
  (dispatch, getProject) => {
    if (!trackId || !patternNote) return -1;
    const project = getProject();
    const trackMidiScale = selectTrackMidiScale(project, trackId);
    const isNested = isNestedNote(patternNote);

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
  (trackId: TrackId, note: PatternNote): Thunk<PatternNote | undefined> =>
  (dispatch, getProject) => {
    const project = getProject();
    const midi = resolvePatternNoteToMidi(note);
    const scaleTrackMap = selectScaleTrackMap(project);
    const trackScaleMap = selectTrackMidiScaleMap(project);
    const chainIds = selectTrackChainIds(project, trackId);
    const idCount = chainIds.length;

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
        break;
      }

      // Otherwise, check parent scales for neighbors, preferring deep matches first
      const parentIds = chainIds.slice(0, i).toReversed();
      const trackIds: (TrackId | "T")[] = [...parentIds, "T"];
      let found = false;

      // Iterate over all scale offsets
      for (let i = 0; i < trackIds.length; i++) {
        const id = trackIds[i];
        const parentTrack = getValueByKey(scaleTrackMap, id);
        const parentScaleId = id === "T" ? "chromatic" : parentTrack?.scaleId;
        if (!parentScaleId) continue;

        // Check the parent scale (or chromatic scale at the end)
        const parentScale = id === "T" ? chromaticNotes : trackScaleMap[id];
        const parentSize = parentScale.length;
        const degree =
          id === "T"
            ? chromaticNotes.findIndex((n) => n % 12 === midi % 12)
            : dispatch(getDegreeOfNoteInTrack(id, scaleNote));
        if (degree === -1) continue;

        // Check if the note can be lowered to fit in the scale
        const lower = mod(degree - 1, parentSize);
        const lowerOctave = Math.floor((degree - 1) / parentSize);
        const lowerMIDI = parentScale?.[lower] ?? 0;
        const lowerNote = { ...scaleNote, MIDI: lowerMIDI };
        const lowerDegree = dispatch(
          getDegreeOfNoteInTrack(trackId, lowerNote)
        );

        // If the lowered note exists in the current scale, add the note as an upper neighbor
        if (lowerDegree > -1) {
          const octave = getMidiOctaveDistance(lowerMIDI, midi) + lowerOctave;
          const offset = { [parentScaleId]: 1, octave };
          note = { ...scaleNote, degree: lowerDegree, offset };
          if ("MIDI" in note) delete note.MIDI;
          found = true;
          break;
        }

        // Check if the note can be raised to fit in the scale
        const upper = mod(degree + 1, parentSize);
        const upperMIDI = parentScale?.[upper] ?? 0;
        const upperNote = { ...scaleNote, MIDI: upperMIDI };
        const upperOctave = Math.floor((degree + 1) / parentSize);
        const upperDegree = dispatch(
          getDegreeOfNoteInTrack(trackId, upperNote)
        );

        // If the raised note exists in the current scale, add the note as a lower neighbor
        if (upperDegree > -1) {
          const octave = getMidiOctaveDistance(upperMIDI, midi) + upperOctave;
          const offset = { [parentScaleId]: -1, octave };
          note = { ...scaleNote, degree: upperDegree, offset };
          if ("MIDI" in note) delete note.MIDI;
          found = true;
          break;
        }
      }

      if (found) break;
    }
    return note;
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
