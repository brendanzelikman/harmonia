import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { INSTRUMENTS } from "types/instrument";
import { rotateScale, transposeScale } from "types/scale";
import { Track, TrackId } from "types/tracks";
import { lastTransformAtTick, Transform } from "types/transform";
import { Tick } from "types/units";
import { selectClips } from "./clips";
import {
  selectPatternTrack,
  selectPatternTrackIds,
  selectPatternTracks,
} from "./patternTracks";
import {
  selectScaleTrack,
  selectScaleTrackIds,
  selectScaleTracks,
  selectScaleTrackScale,
} from "./scaleTracks";
import { selectTransformMap, selectTransforms } from "./transforms";

// Select the ID of a track
export const selectTrackId = (state: RootState, id: TrackId) => id;

// Select all tracks from the store.
export const selectTracks = createSelector(
  [selectScaleTracks, selectPatternTracks],
  (scaleTracks, patternTracks) => [...scaleTracks, ...patternTracks]
);

// Select all track IDs from the store.
export const selectTrackIds = createSelector(
  [selectScaleTrackIds, selectPatternTrackIds],
  (scaleTrackIds, patternTrackIds) => [...scaleTrackIds, ...patternTrackIds]
);

// Select a specific track from the store.
export const selectTrack = createSelector(
  [selectScaleTrack, selectPatternTrack],
  (scaleTrack, patternTrack) => (scaleTrack || patternTrack) as Track
);

// Select the scale track to pattern track map
export const selectTrackMap = (state: RootState) =>
  state.session.present.trackMap;

// Select the track to clip map
export const selectClipTrackMap = (state: RootState) =>
  state.session.present.clipMap;

// Select the track to transform map
export const selectTransformTrackMap = (state: RootState) =>
  state.session.present.transformMap;

// Select the clips of a track
export const selectTrackClips = createSelector(
  [selectTrack, selectClips],
  (track, clips) => {
    if (!track) return;
    return clips.filter((clip) => clip.trackId === track.id);
  }
);

// Select the clips of a track at a given tick
export const selectTrackClipAtTick = createSelector(
  [selectTrackClips, (_: RootState, __: TrackId, tick: Tick) => tick],
  (clips, tick) => {
    if (!clips) return undefined;
    const currentClips = clips.filter((clip) => clip.tick === tick);
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
  [selectTrack, selectTransformMap, selectTransformTrackMap],
  (track, transforms, transformMap) => {
    const emptyTransforms: Transform[] = [];
    if (!track) return emptyTransforms;

    const transformIds = transformMap.byId[track.id]?.transformIds;
    if (!transformIds) return emptyTransforms;

    return transformIds
      .map((id) => transforms[id])
      .filter(Boolean) as Transform[];
  }
);

// Select the scale of a scale track at a given tick
export const selectScaleTrackScaleAtTick = createSelector(
  [
    selectScaleTrackScale,
    selectTrackTransforms,
    (state: RootState, trackId: string, tick: Tick) => tick,
  ],
  (scale, trackTransforms, tick) => {
    if (!scale) return;
    const transform = lastTransformAtTick(trackTransforms, tick);
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
