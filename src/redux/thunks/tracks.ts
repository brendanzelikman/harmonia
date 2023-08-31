import {
  selectSelectedTrackId,
  selectClip,
  selectClipTrackMap,
  selectPatternTrack,
  selectPatternTracks,
  selectScale,
  selectTrack,
  selectTrackMap,
  selectTransformTrackMap,
} from "redux/selectors";
import { selectTransform } from "redux/selectors/transforms";
import { AppThunk } from "redux/store";
import { createInstrument } from "types/instrument";
import Scales, { defaultScale } from "types/scales";
import {
  initializeTrack,
  isPatternTrack,
  isScaleTrack,
  Track,
  TrackId,
} from "types/tracks";
import { defaultScaleTrack, ScaleTrackNoId } from "types/tracks";
import { defaultPatternTrack, PatternTrackNoId } from "types/tracks";
import { Mixers } from "redux/slices";
import * as Clips from "redux/slices/clips";
import * as ClipMap from "redux/slices/maps/clipMap";
import * as TrackMap from "redux/slices/maps/trackMap";
import * as TransformMap from "redux/slices/maps/transformMap";
import * as PatternTracks from "redux/slices/patternTracks";
import { hideEditor, setSelectedTrack } from "redux/slices/root";
import * as ScaleTracks from "redux/slices/scaleTracks";
import * as Transforms from "redux/slices/transforms";
import { createScale } from "redux/slices/scales";
import { setMixerMute, setMixerSolo } from "./mixers";

// Create a scale track
export const createScaleTrack =
  (initialTrack?: Partial<ScaleTrackNoId>): AppThunk<Promise<TrackId>> =>
  (dispatch) => {
    return new Promise(async (resolve) => {
      // Create scale bound to track
      const scaleId =
        initialTrack?.scaleId ||
        (await dispatch(
          createScale({
            name: Scales.TrackScaleName,
            notes: defaultScale.notes,
          })
        ));

      // Create track with scale id
      const scaleTrack = { ...defaultScaleTrack, ...initialTrack, scaleId };
      const track = initializeTrack(scaleTrack);

      // Add track to store
      dispatch(ScaleTracks.addScaleTrack(track));
      dispatch(TrackMap.addScaleTrackToTrackMap(track.id));
      dispatch(TransformMap.addScaleTrackToTransformMap(track.id));
      resolve(track.id);
    });
  };

// Create a pattern track
export const createPatternTrack =
  (initialTrack?: Partial<PatternTrackNoId>): AppThunk<Promise<TrackId>> =>
  (dispatch) => {
    return new Promise(async (resolve) => {
      // Create track
      const patternTrack = { ...defaultPatternTrack, ...initialTrack };
      const track = initializeTrack(patternTrack);

      // Create an instrument for the track
      dispatch(createInstrument(track));

      // Add track to store
      dispatch(PatternTracks.addPatternTrack(track));
      dispatch(
        TrackMap.addPatternTrackToTrackMap({
          scaleTrackId: track.scaleTrackId,
          patternTrackId: track.id,
        })
      );
      dispatch(ClipMap.addPatternTrackToClipMap(track.id));
      dispatch(TransformMap.addPatternTrackToTransformMap(track.id));

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

      const scaleTrackId = isScaleTrack(track) ? track.id : track.scaleTrackId;
      return dispatch(createPatternTrack({ scaleTrackId }));
    });
  };

export const muteTracks = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const patternTracks = selectPatternTracks(state);
  patternTracks.forEach((track) => {
    dispatch(setMixerMute(track.id, true));
  });
};

export const unmuteTracks = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const patternTracks = selectPatternTracks(state);
  patternTracks.forEach((track) => {
    dispatch(setMixerMute(track.id, false));
  });
};

export const soloTracks = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const patternTracks = selectPatternTracks(state);
  patternTracks.forEach((track) => {
    dispatch(setMixerSolo(track.id, true));
  });
};

export const unsoloTracks = (): AppThunk => (dispatch, getState) => {
  const state = getState();
  const patternTracks = selectPatternTracks(state);
  patternTracks.forEach((track) => {
    dispatch(setMixerSolo(track.id, false));
  });
};

export const addTrack =
  (track: Track): AppThunk =>
  (dispatch) => {
    if (isScaleTrack(track)) {
      dispatch(ScaleTracks.addScaleTrack(track));
      dispatch(TrackMap.addScaleTrackToTrackMap(track.id));
    } else if (isPatternTrack(track)) {
      dispatch(PatternTracks.addPatternTrack(track));
      dispatch(
        TrackMap.addPatternTrackToTrackMap({
          scaleTrackId: track.scaleTrackId,
          patternTrackId: track.id,
        })
      );
    } else {
      throw new Error("Invalid track type");
    }
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
  (dispatch, getState) => {
    const state = getState();
    const track = selectTrack(state, trackId);

    if (track && isScaleTrack(track)) {
      dispatch(Transforms.clearTransformsByScaleTrackId(trackId));
      dispatch(TransformMap.clearScaleTrackFromTransformMap(trackId));
    }
    if (track && isPatternTrack(track)) {
      dispatch(Clips.clearClipsByPatternTrackId(trackId));
      dispatch(Transforms.clearTransformsByPatternTrackId(trackId));
      dispatch(ClipMap.clearPatternTrackFromClipMap(trackId));
      dispatch(TransformMap.clearPatternTrackFromTransformMap(trackId));
    }
  };

export const deleteTrack =
  (trackId: TrackId): AppThunk =>
  (dispatch, getState) => {
    const state = getState();
    const track = selectTrack(state, trackId);

    if (track && isScaleTrack(track)) {
      dispatch(ScaleTracks.removeScaleTrack(trackId));
      dispatch(TrackMap.removeScaleTrackFromTrackMap(trackId));

      // Remove transforms
      dispatch(Transforms.removeTransformsByScaleTrackId(trackId));
      dispatch(TransformMap.removeScaleTrackFromTransformMap(trackId));
    }
    if (track && isPatternTrack(track)) {
      dispatch(PatternTracks.removePatternTrack(trackId));
      dispatch(Mixers.removeMixer(trackId));
      dispatch(TrackMap.removePatternTrackFromTrackMap(trackId));
      // Remove clips
      dispatch(Clips.removeClipsByPatternTrackId(trackId));
      dispatch(ClipMap.removePatternTrackFromClipMap(trackId));
      // Remove transforms
      dispatch(Transforms.removeTransformsByPatternTrackId(trackId));
      dispatch(TransformMap.removePatternTrackFromTransformMap(trackId));
    }

    // Remove all child tracks
    const trackMap = selectTrackMap(state);
    for (const id of trackMap.byId[trackId]?.patternTrackIds || []) {
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
    const trackMap = selectTrackMap(state);

    if (!track) return;

    // Add the new track as a promise and get the id
    let trackId: TrackId;
    if (isScaleTrack(track)) {
      const scale = selectScale(state, track.scaleId);
      if (!scale) return;
      const scaleId = await dispatch(createScale(scale));
      trackId = await dispatch(createScaleTrack({ ...track, scaleId }));
    } else if (isPatternTrack(track)) {
      trackId = await dispatch(createPatternTrack(track));
    } else {
      throw new Error("Invalid track type");
    }

    if (!trackId) return;

    // Add all clips
    const clipMap = selectClipTrackMap(state);
    const clips = clipMap.byId[id]?.clipIds;
    if (clips?.length) {
      clips.forEach((clipId) => {
        const clip = selectClip(state, clipId);
        dispatch(Clips.createClip({ ...clip, trackId }));
      });
    }

    // Add all transforms
    const transformMap = selectTransformTrackMap(state);
    const transforms = transformMap.byId[id]?.transformIds;
    if (transforms?.length) {
      transforms.forEach((transformId) => {
        const transform = selectTransform(state, transformId);
        dispatch(Transforms.createTransform({ ...transform, trackId }));
      });
    }

    // Add all pattern tracks if the track is a scale track
    if (isScaleTrack(track)) {
      const patternTracks = trackMap.byId[id]?.patternTrackIds;
      if (patternTracks?.length) {
        patternTracks.forEach(async (patternTrackId) => {
          // Create a new pattern track
          const patternTrack = selectPatternTrack(state, patternTrackId);
          if (patternTrack) {
            const patternTrackId = await dispatch(
              createPatternTrack({ ...patternTrack, scaleTrackId: trackId })
            );
            if (!patternTrackId) return;

            // Add all clips of the pattern track
            const clips = clipMap.byId[patternTrack.id]?.clipIds;
            if (clips?.length) {
              clips.forEach((clipId) => {
                const clip = selectClip(state, clipId);
                dispatch(
                  Clips.createClip({ ...clip, trackId: patternTrackId })
                );
              });
            }

            // Add all transforms of the pattern track
            const transforms = transformMap.byId[patternTrack.id]?.transformIds;
            if (transforms?.length) {
              transforms.forEach((transformId) => {
                const transform = selectTransform(state, transformId);
                dispatch(
                  Transforms.createTransform({
                    ...transform,
                    trackId: patternTrackId,
                  })
                );
              });
            }
          }
        });
      }
    }
  };
