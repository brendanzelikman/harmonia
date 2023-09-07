import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { ClipId, getClipStream, getClipTicks } from "types/clip";
import { Pattern, PatternChord, PatternStream } from "types/pattern";
import { Transform, lastTransformAtTick } from "types/transform";
import { Tick } from "types/units";
import { selectPatternMap } from "./patterns";
import { selectPatternTrackMap } from "./patternTracks";
import { selectScaleMap } from "./scales";
import { selectScaleTrackMap } from "./scaleTracks";
import { selectTransforms } from "./transforms";
import { PatternTrack, ScaleTrack, TrackId } from "types/tracks";
import { Scale, chromaticScale } from "types/scale";
import { selectCellWidth, selectTimeline } from "./timeline";
import { ticksToColumns } from "utils";

export const selectClipId = (state: RootState, id: ClipId) => {
  return id;
};
export const selectClipTick = (state: RootState, id: ClipId, tick: Tick) => {
  return tick;
};
export const selectClipIds = (state: RootState) => {
  return state.session.present.clips.allIds;
};
export const selectClipMap = (state: RootState) => {
  return state.session.present.clips.byId;
};

// Select all clips from the store.
export const selectClips = createSelector(
  [selectClipIds, selectClipMap],
  (ids, clipMap) => ids.map((id) => clipMap[id])
);

// Select all clips by ids from the store.
export const selectClipsByIds = createSelector(
  [(state: RootState, ids: ClipId[]) => ids, selectClipMap],
  (ids, clips) => ids.map((id) => clips[id])
);

// Select a specific clip from the store.
export const selectClip = createSelector(
  [selectClipMap, selectClipId],
  (clips, id) => clips[id]
);

// Select the pattern of a clip
export const selectClipPattern = createSelector(
  [selectClip, selectPatternMap],
  (clip, patterns): Pattern | undefined => {
    return patterns[clip?.patternId];
  }
);

// Select the pattern track of a clip
export const selectClipPatternTrack = createSelector(
  [selectClip, selectPatternTrackMap],
  (clip, patternTracks): PatternTrack | undefined => {
    return patternTracks[clip?.trackId];
  }
);

// Select the scale track of a clip
export const selectClipScaleTrack = createSelector(
  [selectClipPatternTrack, selectScaleTrackMap],
  (patternTrack, scaleTracks): ScaleTrack | undefined => {
    if (!patternTrack) return;
    return scaleTracks[patternTrack?.scaleTrackId];
  }
);

// Select the scale of a clip from its track
export const selectClipScale = createSelector(
  [selectClipScaleTrack, selectScaleMap],
  (scaleTrack, scales): Scale => {
    if (!scaleTrack) return chromaticScale;
    return scales[scaleTrack?.scaleId] ?? chromaticScale;
  }
);

// Select the transforms of a clip
export const selectClipTransforms = createSelector(
  [selectClip, selectTransforms],
  (clip, transforms): Transform[] => {
    if (!clip || !transforms) return [];
    return transforms.filter((transform) => transform.trackId === clip.trackId);
  }
);

// Select the transforms of the clip's scale track
export const selectClipScaleTransforms = createSelector(
  [selectClip, selectClipScaleTrack, selectClipPatternTrack, selectTransforms],
  (clip, scaleTrack, patternTrack, transforms): Transform[] => {
    if (!clip || !patternTrack || !scaleTrack) return [];
    return transforms
      .filter((transform) => transform.trackId === scaleTrack.id)
      .sort((a, b) => a.tick - b.tick);
  }
);

// Select the transform of a clip at a specific tick
export const selectClipTransformAtTick = createSelector(
  [selectClipTransforms, selectClipTick],
  (transforms, tick) => {
    return lastTransformAtTick(transforms, tick);
  }
);

// Select the transform of a clip's scale track at a specific tick
export const selectClipScaleTransformAtTick = createSelector(
  [selectClipScaleTransforms, selectClipTick],
  (transforms, tick) => {
    return transforms.filter((transform) => transform.tick > tick)[0];
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
  (clip, pattern, scale, transforms, scaleTransforms) => {
    if (!clip || !pattern || !scale) return [] as PatternStream;
    return getClipStream(clip, pattern, scale, transforms, scaleTransforms);
  }
);

// Select all clip streams
export const selectClipStreams = createSelector(
  [
    selectClips,
    selectPatternMap,
    selectScaleMap,
    selectTransforms,
    selectPatternTrackMap,
    selectScaleTrackMap,
  ],
  (clips, patterns, scales, transforms, patternTracks, scaleTracks) => {
    return clips.map((clip) => {
      const pattern = patterns[clip.patternId];
      if (!pattern) return [] as PatternStream;
      const patternTrack = patternTracks[clip.trackId];
      if (!patternTrack) return [] as PatternStream;
      const scaleTrack = scaleTracks[patternTrack.scaleTrackId];
      if (!scaleTrack) return [] as PatternStream;
      const scale = scales[scaleTrack.scaleId];
      if (!scale) return [] as PatternStream;
      const clipTransforms = transforms.filter(
        (transform) => transform.trackId === clip.trackId
      );
      const scaleTransforms = transforms.filter(
        (transform) => transform.trackId === scaleTrack.id
      );
      return getClipStream(
        clip,
        pattern,
        scale,
        clipTransforms,
        scaleTransforms
      );
    });
  }
);

export const selectClipWidth = createSelector(
  [selectClip, selectClipPattern, selectTimeline, selectCellWidth],
  (clip, pattern, timeline, cellWidth) => {
    if (!clip || !pattern) return 0;
    const duration = getClipTicks(clip, pattern);
    const columns = ticksToColumns(duration, timeline.subdivision);
    return Math.max(cellWidth * columns, 1);
  }
);

interface StreamInfo {
  trackId: TrackId;
  chord: PatternChord;
}

export const selectChordsByTicks = createSelector(
  [selectClips, selectClipStreams],
  (clips, streams) => {
    return clips.reduce((acc, clip, i) => {
      const stream = streams[i];
      if (!stream) return acc;

      const length = stream.length;
      let newAcc = acc;
      for (let i = 0; i < length; i++) {
        const tick = clip.tick + i;
        const chord = getClipChordAtTick(stream, i);
        if (!chord?.length) continue;

        const block = { trackId: clip.trackId, chord };
        if (!newAcc[tick]) newAcc[tick] = [];
        newAcc[tick].push(block);
      }
      return acc;
    }, {} as Record<Tick, StreamInfo[]>);
  }
);

// Select the duration of a clip in beats
export const selectClipTicks = createSelector(
  [selectClip, selectClipPattern],
  getClipTicks
);

export const getClipChordAtTick = (
  stream: PatternStream,
  tick: Tick
): PatternChord => {
  const emptyChord = [] as PatternChord;
  if (!stream) return emptyChord;
  const index = tick;
  if (index < 0 || index >= stream.length) return emptyChord;
  return stream[index];
};

// Select all clips by track ids
export const selectClipsByTrackIds = createSelector(
  [selectClips, (state: RootState, trackIds: string[]) => trackIds],
  (clips, trackIds) => {
    return clips.filter((clip) => {
      return trackIds.includes(clip.trackId);
    });
  }
);

// Select all clips by pattern id
export const selectClipsByPatternId = createSelector(
  [selectClips, (state: RootState, patternId: string) => patternId],
  (clips, patternId) => {
    return clips.filter((clip) => {
      return clip.patternId === patternId;
    });
  }
);
