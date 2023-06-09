import {
  selectActiveTrackId,
  selectClip,
  selectClipMap,
  selectPatternTrack,
  selectScale,
  selectTrack,
  selectTrackMap,
  selectTransformMap,
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
import { Mixers } from ".";
import * as Clips from "./clips";
import * as ClipMap from "./maps/clipMap";
import * as TrackMap from "./maps/trackMap";
import * as TransformMap from "./maps/transformMap";
import * as PatternTracks from "./patternTracks";
import { hideEditor, setActiveTrack } from "./root";
import { createScale } from "./scales";
import * as ScaleTracks from "./scaleTracks";
import * as Transforms from "./transforms";

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
    for (const id of trackMap[trackId]?.patternTrackIds || []) {
      dispatch(deleteTrack(id));
    }

    // Clear the editor if showing the deleted track
    const editorTrackId = selectActiveTrackId(state);
    if (editorTrackId === trackId) {
      dispatch(setActiveTrack(undefined));
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
      const scaleId = await dispatch(createScale(scale));
      trackId = await dispatch(createScaleTrack({ ...track, scaleId }));
    } else if (isPatternTrack(track)) {
      trackId = await dispatch(createPatternTrack(track));
    } else {
      throw new Error("Invalid track type");
    }

    if (!trackId) return;

    // Add all clips
    const clipMap = selectClipMap(state);
    const clips = clipMap[id]?.clipIds;
    if (clips?.length) {
      clips.forEach((clipId) => {
        const clip = selectClip(state, clipId);
        dispatch(Clips.createClip({ ...clip, trackId }));
      });
    }

    // Add all transforms
    const transformMap = selectTransformMap(state);
    const transforms = transformMap[id]?.transformIds;
    if (transforms?.length) {
      transforms.forEach((transformId) => {
        const transform = selectTransform(state, transformId);
        dispatch(Transforms.createTransform({ ...transform, trackId }));
      });
    }

    // Add all pattern tracks if the track is a scale track
    if (isScaleTrack(track)) {
      const patternTracks = trackMap[id]?.patternTrackIds;
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
            const clips = clipMap[patternTrack.id]?.clipIds;
            if (clips?.length) {
              clips.forEach((clipId) => {
                const clip = selectClip(state, clipId);
                dispatch(
                  Clips.createClip({ ...clip, trackId: patternTrackId })
                );
              });
            }

            // Add all transforms of the pattern track
            const transforms = transformMap[patternTrack.id]?.transformIds;
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
