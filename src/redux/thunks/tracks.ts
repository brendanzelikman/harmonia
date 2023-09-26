import {
  selectSelectedTrackId,
  selectClip,
  selectPatternTrack,
  selectTrack,
  selectMixerById,
  selectScaleTrackMap,
  selectSessionMap,
  selectScaleTrack,
  selectClipsByIds,
} from "redux/selectors";
import {
  selectTransposition,
  selectTranspositionsByIds,
} from "redux/selectors/transpositions";
import { AppThunk } from "redux/store";
import { INSTRUMENTS, createInstrument } from "types/instrument";
import {
  initializePatternTrack,
  isPatternTrack,
  initializeScaleTrack,
  isScaleTrack,
  Track,
  TrackId,
  getScaleTrackScale,
  getChromaticallyTransposedScaleTrack,
  getChordallyTransposedScaleTrack,
  PatternTrack,
  ScaleTrack,
} from "types/tracks";
import { defaultScaleTrack } from "types/tracks";
import { defaultPatternTrack } from "types/tracks";
import { Mixers } from "redux/slices";
import * as Clips from "redux/slices/clips";
import * as PatternTracks from "redux/slices/patternTracks";
import { setSelectedTrack } from "redux/slices/root";
import * as ScaleTracks from "redux/slices/scaleTracks";
import * as Transpositions from "redux/slices/transpositions";
import { hideEditor } from "redux/slices/editor";
import {
  chromaticScale,
  initializeMixer,
  MIDI,
  Note,
  ScaleTrackNote,
} from "types";
import {
  muteMixers,
  unmuteMixers,
  soloMixers,
  unsoloMixers,
} from "redux/slices/mixers";
import { uniqBy } from "lodash";
import {
  addPatternTrackToSession,
  addScaleTrackToSession,
  clearTrackInSession,
  removePatternTrackFromSession,
  removeScaleTrackFromSession,
} from "redux/slices/sessionMap";

// Create a scale track
export const createScaleTrack =
  (initialTrack?: Partial<ScaleTrack>): AppThunk<Promise<TrackId>> =>
  (dispatch, getState) => {
    const state = getState();
    const parentTrack = selectScaleTrack(state, initialTrack?.parentId);
    const parentNotes = parentTrack?.scaleNotes ?? defaultScaleTrack.scaleNotes;
    const scaleNotes = parentNotes.map((_, i) => ({ degree: i, offset: 0 }));
    return new Promise(async (resolve) => {
      const scaleTrack = { ...defaultScaleTrack, scaleNotes, ...initialTrack };
      const track = initializeScaleTrack(scaleTrack);
      dispatch(ScaleTracks.addScaleTrack(track));
      dispatch(addScaleTrackToSession(track));
      resolve(track.id);
    });
  };

// Create a pattern track
export const createPatternTrack =
  (initialTrack?: Partial<PatternTrack>): AppThunk<Promise<TrackId>> =>
  (dispatch, getState) => {
    const state = getState();
    return new Promise(async (resolve) => {
      // Create track
      const mixer = initializeMixer();
      const patternTrack = {
        ...defaultPatternTrack,
        ...initialTrack,
        mixerId: mixer.id,
      };
      const track = initializePatternTrack(patternTrack);

      // Create an instrument for the track
      const oldMixer = initialTrack?.mixerId
        ? selectMixerById(state, initialTrack.mixerId)
        : undefined;
      dispatch(createInstrument(track, false, oldMixer));

      // Add track to store
      dispatch(PatternTracks.addPatternTrack(track));
      dispatch(addPatternTrackToSession(track));

      // Resolve
      resolve(track.id);
    });
  };

// Create a pattern track
export const createPatternTrackFromSelectedTrack =
  (): AppThunk<Promise<TrackId>> => (dispatch, getState) => {
    return new Promise(async (resolve) => {
      const state = getState();
      const selectedTrackId = selectSelectedTrackId(state);
      if (!selectedTrackId) return;

      const track = selectTrack(state, selectedTrackId);
      if (!track) return;

      const parentId = isScaleTrack(track) ? track.id : track.parentId;
      resolve(dispatch(createPatternTrack({ parentId })));
    });
  };

// Add a note to a scale track
export const addNoteToScaleTrack =
  (scaleTrackId: TrackId, note: Note): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const scaleTracks = selectScaleTrackMap(state);
    const scaleTrack = scaleTracks[scaleTrackId];
    if (!scaleTrack || !isScaleTrack(scaleTrack)) return;

    // Get the scale of the parent track
    const parent = scaleTrack?.parentId
      ? scaleTracks[scaleTrack.parentId]
      : undefined;
    const scale = parent
      ? getScaleTrackScale(parent, scaleTracks)
      : chromaticScale;
    if (!scale) return;

    // Find the closest pitch to the scale notes
    const pitch = MIDI.toPitchClass(note);
    const closestPitch = MIDI.closestPitchClass(pitch, scale.notes);
    if (!closestPitch) return;

    // Get the degree of the closest pitch
    const degree = scale.notes.findIndex(
      (note) => MIDI.toPitchClass(note) === closestPitch
    );
    if (degree < 0) return;

    // Add the note to the scale track
    const scaleTrackNote: ScaleTrackNote = { degree, offset: 0 };
    const scaleNotes = uniqBy(
      [...scaleTrack.scaleNotes, scaleTrackNote],
      "degree"
    );

    // Sort the scale in ascending order
    const sortedScale = scaleNotes.sort((a, b) => a.degree - b.degree);

    // Dispatch the update
    dispatch(
      ScaleTracks.updateScaleTrack({
        id: scaleTrackId,
        scaleNotes: sortedScale,
      })
    );
  };

// Remove a note from a scale track
export const removeNoteFromScaleTrack =
  (scaleTrackId: TrackId, note: Note): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const scaleTracks = selectScaleTrackMap(state);
    const scaleTrack = scaleTracks[scaleTrackId];
    if (!scaleTrack || !isScaleTrack(scaleTrack)) return;

    // Get the scale track scale
    const scaleNotes = [...scaleTrack.scaleNotes];
    const scale = getScaleTrackScale(scaleTrack, scaleTracks);
    if (!scale?.notes?.length) return;

    // Find the index of the pitch in the scale
    const pitch = MIDI.toPitchClass(note);
    const index = scale.notes.findIndex((p) => MIDI.toPitchClass(p) === pitch);
    if (index < 0) return;

    // Splice the note from the scale track
    scaleNotes.splice(index, 1);

    // Dispatch the update
    dispatch(
      ScaleTracks.updateScaleTrack({
        id: scaleTrackId,
        scaleNotes,
      })
    );
  };

export const transposeScaleTrack =
  (id: TrackId, offset: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const scaleTrack = selectTrack(state, id);
    if (!scaleTrack || !isScaleTrack(scaleTrack)) return;
    const { scaleNotes } = getChromaticallyTransposedScaleTrack(
      scaleTrack,
      offset
    );
    if (!scaleNotes) return;
    dispatch(ScaleTracks.updateScaleTrack({ id, scaleNotes }));
  };

export const rotateScaleTrack =
  (scaleTrackId: TrackId, offset: number): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const scaleTrack = selectTrack(state, scaleTrackId);
    if (!scaleTrack || !isScaleTrack(scaleTrack)) return;
    const { scaleNotes } = getChordallyTransposedScaleTrack(scaleTrack, offset);
    if (!scaleNotes) return;
    dispatch(ScaleTracks.updateScaleTrack({ id: scaleTrackId, scaleNotes }));
  };

// Clear the notes from a scale track
export const clearNotesFromScaleTrack =
  (scaleTrackId: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const scaleTrack = selectTrack(state, scaleTrackId);
    if (!scaleTrack || !isScaleTrack(scaleTrack)) return;

    dispatch(
      ScaleTracks.updateScaleTrack({
        id: scaleTrackId,
        scaleNotes: [],
      })
    );
  };

export const muteTracks = (): AppThunk => (dispatch) => {
  dispatch(muteMixers());
};

export const unmuteTracks = (): AppThunk => (dispatch) => {
  dispatch(unmuteMixers());
};

export const soloTracks = (): AppThunk => (dispatch) => {
  dispatch(soloMixers());
};

export const unsoloTracks = (): AppThunk => (dispatch) => {
  dispatch(unsoloMixers());
};

export const updateTrack =
  (track: Partial<Track>): AppThunk =>
  (dispatch) => {
    if (isScaleTrack(track)) {
      dispatch(ScaleTracks.updateScaleTrack(track));
    } else if (isPatternTrack(track)) {
      dispatch(PatternTracks.updatePatternTrack(track));
    } else {
      throw new Error("Invalid track type");
    }
  };

export const clearTrack =
  (trackId: TrackId): AppThunk =>
  (dispatch) => {
    dispatch(Clips.clearClipsByTrackId(trackId));
    dispatch(Transpositions.clearTranspositionsByTrackId(trackId));
    dispatch(clearTrackInSession(trackId));
  };

export const deleteTrack =
  (trackId: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const track = selectTrack(state, trackId);

    if (track && isScaleTrack(track)) {
      dispatch(ScaleTracks.removeScaleTrack(trackId));
      dispatch(removeScaleTrackFromSession(trackId));
    } else {
      dispatch(PatternTracks.removePatternTrack(trackId));
      dispatch(removePatternTrackFromSession(trackId));
      dispatch(Mixers.removeMixer({ mixerId: track.mixerId, trackId }));
      delete INSTRUMENTS[trackId];
    }

    dispatch(Clips.removeClipsByTrackId(trackId));
    dispatch(Transpositions.removeTranspositionsByTrackId(trackId));

    // Remove all child tracks
    const sessionMap = selectSessionMap(state);
    const children = sessionMap.byId[trackId]?.trackIds ?? [];
    for (const id of children) {
      dispatch(deleteTrack(id));
    }

    // Clear the editor if showing the deleted track
    const editorTrackId = selectSelectedTrackId(state);
    if (editorTrackId === trackId) {
      dispatch(setSelectedTrack(undefined));
      dispatch(hideEditor());
    }
  };

export const duplicateTrack =
  (id: TrackId): AppThunk =>
  async (dispatch, getState) => {
    const state = getState();
    const track = selectTrack(state, id);
    const sessionMap = selectSessionMap(state);
    const scaleTracks = selectScaleTrackMap(state);

    if (!track) return;

    // Add the new track as a promise and get the id
    let trackId: TrackId;
    if (isScaleTrack(track)) {
      const scale = getScaleTrackScale(track, scaleTracks);
      if (!scale) return;
      trackId = await dispatch(createScaleTrack({ ...track }));
    } else if (isPatternTrack(track)) {
      trackId = await dispatch(createPatternTrack(track));
    } else {
      throw new Error("Invalid track type");
    }

    if (!trackId) return;

    // Add all clips
    const clips = sessionMap.byId[id]?.clipIds;
    if (clips?.length) {
      clips.forEach((clipId) => {
        const clip = selectClip(state, clipId);
        dispatch(Clips.createClips([{ ...clip, trackId }]));
      });
    }

    // Add all transpositions
    const transpositions = sessionMap.byId[id]?.transpositionIds;
    if (transpositions?.length) {
      transpositions.forEach((transpositionId) => {
        const transposition = selectTransposition(state, transpositionId);
        dispatch(
          Transpositions.createTranspositions([{ ...transposition, trackId }])
        );
      });
    }

    // Add all child tracks if the track is a scale track
    if (isScaleTrack(track)) {
      const childTracks = sessionMap.byId[id]?.trackIds;
      if (childTracks?.length) {
        childTracks.forEach(async (trackId) => {
          // Determine track type by selecting from state
          const patternTrack = selectPatternTrack(state, trackId);
          const scaleTrack = selectScaleTrack(state, trackId);
          let newId: string;
          // Create the new trackId
          if (patternTrack) {
            newId = await dispatch(
              createPatternTrack({ ...patternTrack, parentId: trackId })
            );
            if (!newId) return;
          } else if (scaleTrack) {
            newId = await dispatch(
              createScaleTrack({ ...scaleTrack, parentId: trackId })
            );
            if (!newId) return;
          } else return;

          // Add all clips of the pattern track
          const clips = sessionMap.byId[trackId]?.clipIds;
          const oldClips = selectClipsByIds(state, clips);
          const newClips = oldClips.map((c) => ({ ...c, trackId: newId }));
          dispatch(Clips.createClips(newClips));

          // Add all transpositions of the pattern track
          const transpositions = sessionMap.byId[trackId]?.transpositionIds;
          const oldTranspositions = selectTranspositionsByIds(
            state,
            transpositions
          );
          const newTranspositions = oldTranspositions.map((t) => ({
            ...t,
            trackId: newId,
          }));
          dispatch(Transpositions.createTranspositions(newTranspositions));
        });
      }
    }
  };
