import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { INSTRUMENTS } from "types/instrument";
import { rotateScale, transposeScale } from "types/scales";
import { TrackId } from "types/tracks";
import { lastTransformAtTime, Transform } from "types/transform";
import { Time } from "types/units";
import { selectClips } from "./clips";
import { selectPatternTrackIds, selectPatternTracks } from "./patternTracks";
import {
  selectScaleTrackIds,
  selectScaleTracks,
  selectScaleTrackScale,
} from "./scaleTracks";
import { selectTransforms } from "./transforms";

// Select the ID of a track
export const selectTrackId = (state: RootState, id: TrackId) => id;

// Select all tracks from the store.
export const selectTracks = createSelector(
  [selectScaleTracks, selectPatternTracks],
  (scaleTracks, patternTracks) => {
    return [...scaleTracks, ...patternTracks];
  }
);

// Select all track IDs from the store.
export const selectTrackIds = createSelector(
  [selectScaleTrackIds, selectPatternTrackIds],
  (scaleTrackIds, patternTrackIds) => {
    return [...scaleTrackIds, ...patternTrackIds];
  }
);

// Select a specific track from the store.
export const selectTrack = createSelector(
  [selectTracks, selectTrackId],
  (tracks, id) => {
    return tracks.find((track) => track.id === id);
  }
);

// Select the scale track to pattern track map
export const selectTrackMap = createSelector(
  (state: RootState) => state.timeline.present.trackMap,
  (trackMap) => trackMap.byId
);

// Select the track to clip map
export const selectClipMap = createSelector(
  (state: RootState) => state.timeline.present.clipMap,
  (clipMap) => clipMap.byId
);

// Select the track to transform map
export const selectTransformMap = createSelector(
  (state: RootState) => state.timeline.present.transformMap,
  (transformMap) => transformMap.byId
);

// Select the clips of a track
export const selectTrackClips = createSelector(
  [selectTrack, selectClips],
  (track, clips) => {
    if (!track) return;
    return clips.filter((clip) => clip.trackId === track.id);
  }
);

// Select the clips of a track at a given time
export const selectTrackClipAtTime = createSelector(
  [selectTrackClips, (_: RootState, __: TrackId, time: Time) => time],
  (clips, time) => {
    if (!clips) return undefined;
    const currentClips = clips.filter((clip) => clip.startTime === time);
    if (!currentClips.length) return undefined;
    return currentClips[0];
  }
);

// Select an instrument by track ID
export const selectInstrument = (state: RootState, trackId: TrackId) => {
  return INSTRUMENTS[trackId];
};

// Select the transforms of a track
export const selectTrackTransforms = createSelector(
  [selectTrack, selectTransforms, selectTransformMap],
  (track, transforms, transformMap) => {
    if (!track) return [];
    const transformIds = transformMap[track.id]?.transformIds;
    if (!transformIds) return [];

    return transformIds
      .map((id) => transforms.find((t) => t.id === id))
      .filter((t) => !!t) as Transform[];
  }
);

// Select the transform of a pattern track at a given time
export const selectTrackTransformAtTime = createSelector(
  [
    selectTrackTransforms,
    (state: RootState, id: TrackId, time: number) => time,
  ],
  (transforms, time) => {
    return transforms.find((t) => t.time === time);
  }
);

// Select the scale of a scale track at a certain time
export const selectScaleTrackScaleAtTime = createSelector(
  [
    selectScaleTrackScale,
    selectTrackTransforms,
    (state: RootState, trackId: string, time: number) => time,
  ],
  (scale, trackTransforms, time) => {
    if (!scale) return;
    const transform = lastTransformAtTime(trackTransforms, time);
    if (!transform) return scale;

    const onceTransposedScale = transposeScale(
      scale,
      transform.scalarTranspose ?? 0
    );
    const twiceTransposedScale = rotateScale(
      onceTransposedScale,
      transform.chordalTranspose ?? 0
    );
    const thriceTransposedScale = transposeScale(
      twiceTransposedScale,
      transform.chromaticTranspose ?? 0
    );

    return thriceTransposedScale;
  }
);
