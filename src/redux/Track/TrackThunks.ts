import * as Hierarchy from "../TrackHierarchy/TrackHierarchySlice";
import { Thunk } from "types/Project";
import { hideEditor } from "../Editor/EditorSlice";
import { isPatternTrack } from "types/PatternTrack";
import { isScaleTrack } from "types/ScaleTrack";
import { Track, TrackId } from "types/Track";
import {
  clearClipsByTrackId,
  removeClipsByTrackId,
  selectClipsByIds,
} from "redux/Clip";
import {
  muteInstruments,
  unmuteInstruments,
  soloInstruments,
  unsoloInstruments,
  removeInstrument,
  selectInstrumentById,
  updateInstrument,
} from "redux/Instrument";
import {
  clearTranspositionsByTrackId,
  removeTranspositionsByTrackId,
  selectTranspositionsByIds,
} from "redux/Transposition";
import {
  createScaleTrack,
  removeScaleTrack,
  selectScaleTrackByScaleId,
  updateScaleTrack,
} from "redux/ScaleTrack";
import {
  createPatternTrack,
  removePatternTrack,
  selectPatternTrackById,
  updatePatternTrack,
} from "redux/PatternTrack";
import { selectTrackNodeMap } from "redux/TrackHierarchy";
import {
  selectTrackById,
  selectTrackMap,
  selectTrackChildren,
  selectTrackMidiScale,
} from "./TrackSelectors";
import { MouseEvent } from "react";
import { isHoldingOption } from "utils/html";
import { getValueByKey } from "utils/objects";
import { selectSelectedTrackId, setSelectedTrackId } from "redux/Timeline";
import { createMedia } from "redux/Media";
import { PatternNote } from "types/Pattern";
import { NestedNote, isNestedNote } from "types/Scale";

/** Add and create a new track.. */
export const createTrack =
  (track: Track): Thunk<TrackId> =>
  (dispatch) => {
    if (isScaleTrack(track)) {
      return dispatch(createScaleTrack(track));
    } else {
      return dispatch(createPatternTrack(track));
    }
  };

/** Update a list of tracks. */
export const updateTracks =
  (tracks: Partial<Track>[]): Thunk =>
  (dispatch) => {
    tracks.forEach((track) => {
      if (isScaleTrack(track)) {
        dispatch(updateScaleTrack(track));
      } else {
        dispatch(updatePatternTrack(track));
      }
    });
  };

/** Clear a track of all media. */
export const clearTrack =
  (trackId?: TrackId): Thunk =>
  (dispatch) => {
    if (!trackId) return;
    dispatch(clearClipsByTrackId(trackId));
    dispatch(clearTranspositionsByTrackId(trackId));
    dispatch(Hierarchy.clearTrackInHierarchy(trackId));
  };

/** Delete a track. */
export const deleteTrack =
  (trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track) return;

    // Remove the track
    if (isScaleTrack(track)) {
      dispatch(removeScaleTrack(track.id));
      dispatch(Hierarchy.removeScaleTrackFromHierarchy(track.id));
    } else {
      dispatch(removePatternTrack(track.id));
      dispatch(
        removeInstrument({
          trackId: track.id,
          id: track.instrumentId,
        })
      );
      dispatch(Hierarchy.removePatternTrackFromHierarchy(track.id));
    }

    // Remove all media
    dispatch(removeClipsByTrackId(track.id));
    dispatch(removeTranspositionsByTrackId(track.id));

    // Remove all child tracks
    const trackNodeMap = selectTrackNodeMap(project);
    const children = trackNodeMap[track.id]?.trackIds ?? [];
    for (const id of children) {
      dispatch(deleteTrack(id));
    }

    // Clear the editor/selection if showing the deleted track
    const editorTrackId = selectSelectedTrackId(project);
    if (editorTrackId === trackId) {
      dispatch(setSelectedTrackId(undefined));
      dispatch(hideEditor());
    }
  };

/** Collapse a track in the slice and hierarchy. */
export const collapseTrack =
  (trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    if (!trackId) return;
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track) return;
    dispatch(updateTracks([{ ...track, collapsed: true }]));
    dispatch(Hierarchy.collapseTracksInHierarchy([track.id]));
  };

/** Collapse all children of a track in the slice and hierarchy. */
export const collapseTrackChildren =
  (trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track || isPatternTrack(track)) return;
    const children = selectTrackChildren(project, track.id);
    dispatch(updateTracks(children.map((c) => ({ ...c, collapsed: true }))));
    dispatch(Hierarchy.collapseTracksInHierarchy(children.map((c) => c.id)));
  };

/** Expand a track in the slice and hierarchy. */
export const expandTrack =
  (trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track) return;
    dispatch(updateTracks([{ ...track, collapsed: false }]));
    dispatch(Hierarchy.expandTracksInHierarchy([track.id]));
  };

/** Expand all children of a track in the slice and hierarchy. */
export const expandTrackChildren =
  (trackId?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const track = selectTrackById(project, trackId);
    if (!track || isPatternTrack(track)) return;
    const children = selectTrackChildren(project, track.id);
    dispatch(updateTracks(children.map((c) => ({ ...c, collapsed: false }))));
    dispatch(Hierarchy.expandTracksInHierarchy(children.map((c) => c.id)));
    return;
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

/** Duplicate a track and all of its media/children in the slice and hierarchy. */
export const duplicateTrack =
  (id?: TrackId): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const trackNodeMap = selectTrackNodeMap(project);
    const track = selectTrackById(project, id);
    const trackNode = getValueByKey(trackNodeMap, id);
    if (!track || !trackNode) return;

    // Create the new track and get its ID
    const trackId = dispatch(createTrack(track));
    if (!trackId) return;

    // Duplicate the original track's media
    const clips = selectClipsByIds(project, trackNode.clipIds);
    const transpositions = selectTranspositionsByIds(
      project,
      trackNode.transpositionIds
    );
    const newClips = clips.map((c) => ({ ...c, trackId }));
    const newTranspositions = transpositions.map((t) => ({ ...t, trackId }));
    const payload = { clips: newClips, transpositions: newTranspositions };
    dispatch(createMedia(payload));

    // Duplicate the original track's children if it has any
    if (!isScaleTrack(track)) return;
    const childTracks = trackNode.trackIds;
    const trackMap = selectTrackMap(project);

    // Recursively add the children of a track
    const addChildren = async (trackIds: TrackId[], parentId: TrackId) => {
      const children = trackIds.map((id) => trackMap[id]);
      children.forEach(async (child) => {
        // Create the child track
        const newParentId = dispatch(createTrack({ ...child, parentId }));

        // Add the track's media
        const clipIds = trackNodeMap[child.id]?.clipIds;
        const transpositionIds = trackNodeMap[child.id]?.transpositionIds;
        if (!clipIds || !transpositionIds) return;
        const clips = selectClipsByIds(project, clipIds);
        const transpositions = selectTranspositionsByIds(
          project,
          transpositionIds
        );
        const newClips = clips.map((c) => ({ ...c, trackId: newParentId }));
        const newTranspositions = transpositions.map((t) => ({
          ...t,
          trackId: newParentId,
        }));
        const payload = { clips: newClips, transpositions: newTranspositions };
        dispatch(createMedia(payload));

        // Add the track's children
        const babies = trackNodeMap[child.id]?.trackIds;
        if (!babies) return;
        addChildren(babies, newParentId);
      });
    };
    addChildren(childTracks, trackId);
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
