import { Thunk } from "types/Project";
import { hideEditor } from "../Editor/EditorSlice";
import { TrackId, initializeTrack, isPatternTrack } from "types/Track";
import { addClips, removeClips, selectClipsByTrackIds } from "redux/Clip";
import {
  muteInstruments,
  unmuteInstruments,
  soloInstruments,
  unsoloInstruments,
  removeInstrument,
  selectInstrumentById,
  updateInstrument,
  createInstrument,
  addInstrument,
} from "redux/Instrument";

import {
  selectTrackById,
  selectTrackDescendants,
  selectTrackMidiScale,
  selectPatternTrackById,
  selectScaleTrackByScaleId,
  selectTracksByIds,
  selectTrackInstrument,
} from "./TrackSelectors";
import { MouseEvent } from "react";
import { isHoldingOption } from "utils/html";
import { getValueByKey } from "utils/objects";
import { selectSelectedTrackId, setSelectedTrackId } from "redux/Timeline";
import { PatternNote } from "types/Pattern";
import { NestedNote, isNestedNote } from "types/Scale";
import { removePortals } from "redux/Portal";
import {
  addTrack,
  collapseTracks,
  expandTracks,
  removeTrack,
} from "./TrackSlice";
import { union } from "lodash";
import { selectPortalsByTrackIds } from "redux/selectors";
import { Instrument, initializeInstrument } from "types/Instrument";
import { initializeClip } from "types/Clip";

/** Duplicate a track and all of its media/children in the slice and hierarchy. */
export const duplicateTrack =
  (id?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, id);
    if (!track) return;

    // Create the new track and get the new clips
    const newTrack = initializeTrack({ ...track, trackIds: [] });
    const clips = selectClipsByTrackIds(project, [track.id]);
    const newClips = clips.map((c) =>
      initializeClip({ ...c, trackId: newTrack.id })
    );

    // Prepare all entities
    const allTracks = [newTrack];
    const allClips = [...newClips];
    const allInstruments = [] as Instrument[];

    // Add the track's instrument if it has one
    if (isPatternTrack(newTrack)) {
      const instrument = selectTrackInstrument(project, track.id);
      if (instrument) {
        const newInstrument = initializeInstrument(instrument);
        newTrack.instrumentId = newInstrument.id;
        allInstruments.push(newInstrument);
      }
    }

    // Duplicate the track's children
    const addChildren = (ids: TrackId[], parentId: TrackId) => {
      if (!ids.length) return;

      // Select the children and duplicate them
      const children = selectTracksByIds(project, ids);
      children.forEach((child) => {
        if (!child) return;

        // Add the track
        const newParent = initializeTrack({ ...child, parentId, trackIds: [] });
        if (isPatternTrack(newParent)) {
          const instrument = selectTrackInstrument(project, child.id);
          if (instrument) {
            const newInstrument = initializeInstrument(instrument);
            newParent.instrumentId = newInstrument.id;
            allInstruments.push(newInstrument);
          }
        }
        allTracks.push(newParent);

        // Update the track's parent
        const parentIndex = allTracks.findIndex((t) => t.id === parentId);
        const parent = allTracks[parentIndex];
        if (parent) {
          const update = { trackIds: union(parent.trackIds, newParent.id) };
          allTracks[parentIndex] = { ...parent, ...update };
        }

        // Add the track's clips
        const clips = selectClipsByTrackIds(project, [child.id]);
        const newClips = clips.map((c) =>
          initializeClip({ ...c, trackId: newParent.id })
        );
        allClips.push(...newClips);

        // Recursively add the children
        addChildren(child.trackIds, newParent.id);
      });
    };

    // Add the children
    addChildren(track.trackIds, newTrack.id);

    // Add all tracks
    const callerId = newTrack.id;
    allTracks.forEach((track) => {
      dispatch(addTrack({ track, callerId }));
      if (!isPatternTrack(track)) return;
      const instrument = allInstruments.find(
        (i) => i.id === track.instrumentId
      );
      if (instrument) dispatch(addInstrument({ instrument, track }));
    });
    dispatch(addClips({ clips: allClips, callerId }));
  };

/** Clear a track of all media. */
export const clearTrack =
  (trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track) return;

    // Get all media IDs
    const clips = selectClipsByTrackIds(project, [track.id]);
    const clipIds = clips.map((c) => c.id);
    const portals = selectPortalsByTrackIds(project, [track.id]);
    const portalIds = portals.map((p) => p.id);

    // Remove all media
    dispatch(removeClips({ clipIds, callerId: trackId, tag: "CLEAR" }));
    dispatch(removePortals({ portalIds, callerId: trackId, tag: "CLEAR" }));
  };

/** Delete a track. */
export const deleteTrack =
  (trackId: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track) return;

    const affectedTracks = selectTrackDescendants(project, trackId);
    const affectedTrackIds = affectedTracks.map((t) => t.id);

    // Remove all media elements
    for (const id of [...affectedTrackIds, trackId]) {
      const clips = selectClipsByTrackIds(project, [id]);
      const clipIds = clips.map((c) => c.id);
      const portals = selectPortalsByTrackIds(project, [id]);
      const portalIds = portals.map((p) => p.id);
      dispatch(removeClips({ clipIds, callerId: trackId, tag: "REMOVE" }));
      dispatch(removePortals({ portalIds, callerId: trackId, tag: "REMOVE" }));
    }

    // Remove the affected tracks and instruments
    for (const t of [track, ...affectedTracks]) {
      dispatch(removeTrack(t.id));
      if (isPatternTrack(t)) {
        dispatch(removeInstrument({ trackId, id: t.instrumentId }));
      }
    }

    // Clear the editor/selection if showing the deleted track
    const editorTrackId = selectSelectedTrackId(project);
    if (editorTrackId === trackId) {
      dispatch(setSelectedTrackId(undefined));
      dispatch(hideEditor());
    }
  };

/** Collapse all children of a track in the slice and hierarchy. */
export const collapseTrackChildren =
  (trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track || isPatternTrack(track)) return;
    const children = selectTrackDescendants(project, track.id);
    dispatch(collapseTracks(children.map((c) => c.id)));
  };

/** Expand all children of a track in the slice and hierarchy. */
export const expandTrackChildren =
  (trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track || isPatternTrack(track)) return;
    const children = selectTrackDescendants(project, track.id);
    dispatch(expandTracks(children.map((c) => c.id)));
  };

/** Get the degree of the pattern note in the given track's scale.  */
export const getDegreeOfNoteInTrack =
  (trackId: TrackId, patternNote?: PatternNote): Thunk<number> =>
  (dispatch, getProject) => {
    if (!patternNote) return -1;
    const project = getProject();
    const trackMidiScale = selectTrackMidiScale(project, trackId);
    const isNested = isNestedNote(patternNote);

    // Get the MIDI of the note, realizing if necessary
    let MIDI: number;
    if (!isNested) MIDI = patternNote.MIDI;
    else {
      const note = patternNote as NestedNote;
      const track = selectScaleTrackByScaleId(project, note?.scaleId);
      const midiScale = selectTrackMidiScale(project, track?.id);
      const midi = getValueByKey(midiScale, note?.degree);
      MIDI = midi ?? -1;
    }

    // Index the MIDI scale and return the degree
    if (MIDI < 0) return -1;
    return trackMidiScale.findIndex((s) => s % 12 === MIDI % 12);
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
  (e: MouseEvent, id?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectPatternTrackById(project, id);
    if (!track) return;

    // Get the track's instrument
    const { instrumentId } = track;
    const instrument = selectInstrumentById(project, instrumentId);
    if (!instrument) return;

    // If not holding option, toggle the track mute
    if (!e || !isHoldingOption(e.nativeEvent)) {
      const update = { mute: !instrument.mute };
      dispatch(updateInstrument({ id: instrumentId, update }));
      return;
    }

    // Otherwise, toggle all tracks
    dispatch(instrument.mute ? unmuteTracks() : muteTracks());
  };

/** Toggle the solo state of a track. */
export const toggleTrackSolo =
  (e: MouseEvent, id?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectPatternTrackById(project, id);
    if (!track) return;

    // Get the track's instrument
    const { instrumentId } = track;
    const instrument = selectInstrumentById(project, instrumentId);
    if (!instrument) return;

    // If not holding option, toggle the track solo
    if (!e || !isHoldingOption(e.nativeEvent)) {
      const update = { solo: !instrument.solo };
      dispatch(updateInstrument({ id: instrumentId, update }));
      return;
    }

    // Otherwise, toggle all tracks
    dispatch(instrument.solo ? unsoloTracks() : soloTracks());
  };
