import * as Session from "../Session/SessionSlice";
import { AppThunk } from "redux/store";
import { setSelectedTrack } from "../Root/RootSlice";
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
  updateScaleTrack,
} from "redux/ScaleTrack";
import {
  createPatternTrack,
  removePatternTrack,
  selectPatternTrackById,
  updatePatternTrack,
} from "redux/PatternTrack";
import { createMedia } from "redux/thunks";
import { selectSelectedTrackId } from "redux/Root";
import { selectSessionMap } from "redux/Session";
import {
  selectTrackById,
  selectTrackMap,
  selectTrackChildren,
} from "./TrackSelectors";
import { MouseEvent } from "react";
import { isHoldingOption } from "utils";
import { getProperty } from "types/util";

/**
 * Create a track in the store.
 * @param track The track object.
 */
export const createTrack =
  (track: Track): AppThunk<Promise<TrackId>> =>
  (dispatch) => {
    return new Promise((resolve) => {
      if (isScaleTrack(track)) {
        resolve(dispatch(createScaleTrack(track)));
      } else {
        resolve(dispatch(createPatternTrack(track)));
      }
    });
  };

/**
 * Update multiple tracks in the store.
 * @param tracks The partial track objects.
 */
export const updateTracks =
  (tracks: Partial<Track>[]): AppThunk =>
  (dispatch) => {
    tracks.forEach((track) => {
      if (isScaleTrack(track)) {
        dispatch(updateScaleTrack(track));
      } else {
        dispatch(updatePatternTrack(track));
      }
    });
  };

/**
 * Clear a track of all media.
 * @param trackId The ID of the track.
 */
export const clearTrack =
  (trackId?: TrackId): AppThunk =>
  (dispatch) => {
    if (!trackId) return;
    dispatch(clearClipsByTrackId(trackId));
    dispatch(clearTranspositionsByTrackId(trackId));
    dispatch(Session.clearTrackInSession(trackId));
  };

/**
 * Delete a track from the store.
 * @param trackId The ID of the track.
 */
export const deleteTrack =
  (trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const track = selectTrackById(state, trackId);
    if (!track) return;

    // Remove the track
    if (isScaleTrack(track)) {
      dispatch(removeScaleTrack(track.id));
      dispatch(Session.removeScaleTrackFromSession(track.id));
    } else {
      dispatch(removePatternTrack(track.id));
      dispatch(
        removeInstrument({
          trackId: track.id,
          instrumentId: track.instrumentId,
        })
      );
      dispatch(Session.removePatternTrackFromSession(track.id));
    }

    // Remove all media
    dispatch(removeClipsByTrackId(track.id));
    dispatch(removeTranspositionsByTrackId(track.id));

    // Remove all child tracks
    const sessionMap = selectSessionMap(state);
    const children = sessionMap[track.id]?.trackIds ?? [];
    for (const id of children) {
      dispatch(deleteTrack(id));
    }

    // Clear the editor/selection if showing the deleted track
    const editorTrackId = selectSelectedTrackId(state);
    if (editorTrackId === trackId) {
      dispatch(setSelectedTrack(undefined));
      dispatch(hideEditor());
    }
  };

/**
 * Duplicate a track and all of its media/children.
 * @param id The ID of the track.
 */
export const duplicateTrack =
  (id?: TrackId): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const sessionMap = selectSessionMap(state);
    const track = selectTrackById(state, id);
    const entity = getProperty(sessionMap, id);
    if (!track || !entity) return;

    // Create the new track and get its ID
    const trackId = await dispatch(createTrack(track));
    if (!trackId) return;

    // Duplicate the original track's media
    const clips = selectClipsByIds(state, entity.clipIds);
    const transpositions = selectTranspositionsByIds(
      state,
      entity.transpositionIds
    );
    const newClips = clips.map((c) => ({ ...c, trackId }));
    const newTranspositions = transpositions.map((t) => ({ ...t, trackId }));
    dispatch(createMedia(newClips, newTranspositions));

    // Duplicate the original track's children if it has any
    if (!isScaleTrack(track)) return;
    const childTracks = entity.trackIds;
    const trackMap = selectTrackMap(state);

    // Recursively add the children of a track
    const addChildren = async (trackIds: TrackId[], parentId: TrackId) => {
      const children = trackIds.map((id) => trackMap[id]);
      children.forEach(async (child) => {
        // Create the child track
        const newParentId = await dispatch(createTrack({ ...child, parentId }));

        // Add the track's media
        const clipIds = sessionMap[child.id]?.clipIds;
        const transpositionIds = sessionMap[child.id]?.transpositionIds;
        if (!clipIds || !transpositionIds) return;
        const clips = selectClipsByIds(state, clipIds);
        const transpositions = selectTranspositionsByIds(
          state,
          transpositionIds
        );
        const newClips = clips.map((c) => ({ ...c, trackId: newParentId }));
        const newTranspositions = transpositions.map((t) => ({
          ...t,
          trackId: newParentId,
        }));
        dispatch(createMedia(newClips, newTranspositions));

        // Add the track's children
        const babies = sessionMap[child.id]?.trackIds;
        if (!babies) return;
        await addChildren(babies, newParentId);
      });
    };
    await addChildren(childTracks, trackId);
  };

/**
 *  Collapse a track.
 * @param track The track to collapse.
 */
export const collapseTrack =
  (trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    if (!trackId) return;
    const state = getState();
    const track = selectTrackById(state, trackId);
    if (!track) return;
    dispatch(updateTracks([{ ...track, collapsed: true }]));
    dispatch(Session.collapseTracksInSession([track.id]));
  };

/**
 * Collapse all children of a track.
 * @param track The track whose children to collapse.
 */
export const collapseTrackChildren =
  (trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const track = selectTrackById(state, trackId);
    if (!track || isPatternTrack(track)) return;
    const children = selectTrackChildren(state, track.id);
    dispatch(updateTracks(children.map((c) => ({ ...c, collapsed: true }))));
    dispatch(Session.collapseTracksInSession(children.map((c) => c.id)));
  };

/**
 * Expand a track.
 * @param track The track to expand.
 */
export const expandTrack =
  (trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const track = selectTrackById(state, trackId);
    if (!track) return;
    dispatch(updateTracks([{ ...track, collapsed: false }]));
    dispatch(Session.expandTracksInSession([track.id]));
  };

/**
 * Expand all children of a track.
 * @param track The track whose children to expand.
 */
export const expandTrackChildren =
  (trackId?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const track = selectTrackById(state, trackId);
    if (!track || isPatternTrack(track)) return;
    const children = selectTrackChildren(state, track.id);
    dispatch(updateTracks(children.map((c) => ({ ...c, collapsed: false }))));
    dispatch(Session.expandTracksInSession(children.map((c) => c.id)));
    return;
  };

/**
 * Mute all tracks.
 */
export const muteTracks = (): AppThunk => (dispatch) => {
  dispatch(muteInstruments());
};

/**
 * Unmute all tracks.
 */
export const unmuteTracks = (): AppThunk => (dispatch) => {
  dispatch(unmuteInstruments());
};

/**
 * Solo all tracks.
 */
export const soloTracks = (): AppThunk => (dispatch) => {
  dispatch(soloInstruments());
};

/**
 * Unsolo all tracks.
 */
export const unsoloTracks = (): AppThunk => (dispatch) => {
  dispatch(unsoloInstruments());
};

/**
 * Toggle the mute state of a track.
 */
export const toggleTrackMute =
  (e: MouseEvent, id?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const track = selectPatternTrackById(state, id);
    if (!track) return;

    // Get the track's instrument
    const { instrumentId } = track;
    const instrument = selectInstrumentById(state, instrumentId);
    if (!instrument) return;

    // If not holding option, toggle the track mute
    if (!e || isHoldingOption(e.nativeEvent)) {
      const update = { mute: !instrument.mute };
      dispatch(updateInstrument({ instrumentId, update }));
    }

    // Otherwise, toggle all tracks
    dispatch(instrument.mute ? unmuteTracks() : muteTracks());
  };

/**
 * Toggle the solo state of a track.
 */
export const toggleTrackSolo =
  (e: MouseEvent, id?: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const track = selectPatternTrackById(state, id);
    if (!track) return;

    // Get the track's instrument
    const { instrumentId } = track;
    const instrument = selectInstrumentById(state, instrumentId);
    if (!instrument) return;

    // If not holding option, toggle the track solo
    if (!e || isHoldingOption(e.nativeEvent)) {
      const update = { solo: !instrument.solo };
      dispatch(updateInstrument({ instrumentId, update }));
    }

    // Otherwise, toggle all tracks
    dispatch(instrument.solo ? unsoloTracks() : soloTracks());
  };
