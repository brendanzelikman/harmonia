import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { ClipId, getClipDuration, getClipStream } from "types/clips";
import { PatternStream } from "types/patterns";
import { ChromaticScale } from "types/presets/scales";

import { lastTransformAtTime } from "types/transform";
import { Time } from "types/units";
import { selectPatterns } from "./patterns";
import { selectPatternTracks } from "./patternTracks";
import { selectScales } from "./scales";
import { selectScaleTracks } from "./scaleTracks";
import { selectTransforms } from "./transforms";

// Select the ID of a clip
export const selectClipId = (state: RootState, id: ClipId) => id;
const selectTimeFromClip = (state: RootState, id: ClipId, time: Time) => time;

// Select all clips from the store.
export const selectClips = createSelector(
  [(state: RootState) => state.timeline.present.clips],
  (clips) => clips.allIds.map((id) => clips.byId[id])
);

// Select all clip IDs from the store.
export const selectClipIds = (state: RootState) => {
  return state.timeline.present.clips.allIds;
};

// Select all clips by ids from the store.
export const selectClipsByIds = (state: RootState, ids: ClipId[]) => {
  return ids.map((id) => state.timeline.present.clips.byId[id]);
};

// Select a specific clip from the store.
export const selectClip = createSelector(
  [selectClips, selectClipId],
  (clips, id) => clips.find((clip) => clip.id === id)
);

// Select the pattern of a clip
export const selectClipPattern = createSelector(
  [selectClip, selectPatterns],
  (clip, patterns) => patterns.find((pattern) => pattern.id === clip?.patternId)
);

// Select the scale of a clip from its track
export const selectClipScale = createSelector(
  [selectClip, selectPatternTracks, selectScaleTracks, selectScales],
  (clip, patternTracks, scaleTracks, scales) => {
    const defaultScale = ChromaticScale;
    if (!clip) return defaultScale;
    // Find the pattern track of the clip
    const patternTrack = patternTracks.find(
      (track) => track.id === clip.trackId
    );
    if (!patternTrack) return defaultScale;

    // Find the scale track of the pattern track
    const scaleTrack = scaleTracks.find(
      (scale) => scale.id === patternTrack.scaleTrackId
    );
    if (!scaleTrack) return defaultScale;

    // Find the scale of the scale track
    const scale = scales.find((scale) => scale.id === scaleTrack.scaleId);
    if (!scale) return defaultScale;

    return scale;
  }
);

// Select the transforms of a clip
export const selectClipTransforms = createSelector(
  [selectClip, selectTransforms],
  (clip, transforms) => {
    if (!clip) return [];
    return transforms.filter((transform) => transform.trackId === clip.trackId);
  }
);

// Select the transforms of the clip's scale track
export const selectClipScaleTransforms = createSelector(
  [selectClip, selectScaleTracks, selectPatternTracks, selectTransforms],
  (clip, scaleTracks, patternTracks, transforms) => {
    if (!clip) return [];
    // Find the pattern track of the clip
    const patternTrack = patternTracks.find(
      (track) => track.id === clip.trackId
    );
    if (!patternTrack) return [];

    // Find the scale track of the pattern track
    const scaleTrack = scaleTracks.find(
      (scale) => scale.id === patternTrack.scaleTrackId
    );
    if (!scaleTrack) return [];

    // Find the transforms of the scale track
    return transforms.filter(
      (transform) => transform.trackId === scaleTrack.id
    );
  }
);

// Select the transform of a clip at a specific time
export const selectClipTransformAtTime = createSelector(
  [selectClipTransforms, selectTimeFromClip],
  (transforms, time) => {
    return lastTransformAtTime(transforms, time);
  }
);

// Select the transform of a clip's scale track at a specific time
export const selectClipScaleTransformAtTime = createSelector(
  [selectClipScaleTransforms, selectTimeFromClip],
  (transforms, time) => {
    const orderedTransforms = transforms.sort((a, b) => a.time - b.time);
    return orderedTransforms
      .filter((transform) => transform.time <= time)
      .at(-1);
  }
);

// Select the transformed stream of a specific clip
export const selectClipStream = createSelector(
  [
    selectClip,
    selectClipPattern,
    selectClipScale,
    selectClipTransforms,
    selectClipScaleTransforms,
  ],
  (clip, pattern, scale, transforms, scaleTransforms): PatternStream => {
    if (!clip || !pattern || !scale) return [];
    return getClipStream(clip, pattern, scale, transforms, scaleTransforms);
  }
);

// Select the duration of a clip in beats
export const selectClipDuration = createSelector(
  [selectClip, selectClipPattern],
  getClipDuration
);

// Select the chord of the transformed clip stream at a specific time
export const selectClipChordAtTime = createSelector(
  [selectClip, selectClipStream, selectTimeFromClip],
  (clip, stream, time) => {
    if (!clip) return;
    const startTime = clip.startTime;
    const index = time - startTime;
    return stream[index];
  }
);

// Select all clips at the current time
const selectCurrentTime = (state: RootState, time: Time) => time;

export const selectClipsAtTime = createSelector(
  [selectClips, selectPatterns, selectCurrentTime],
  (clips, patterns, time) => {
    return clips.filter((clip) => {
      if (clip.startTime > time) return false;
      const pattern = patterns.find((pattern) => pattern.id === clip.patternId);
      if (!pattern) return false;

      const duration = getClipDuration(clip, pattern);
      if (clip.startTime + duration < time) return false;

      return true;
    });
  }
);

// Select all clips by track ids
export const selectClipsByTrackIds = createSelector(
  [selectClips, (state: RootState, trackIds: string[]) => trackIds],
  (clips, trackIds) => {
    return clips.filter((clip) => {
      return trackIds.includes(clip.trackId);
    });
  }
);
