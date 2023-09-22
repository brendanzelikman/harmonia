import { RootState } from "redux/store";
import { createSelector } from "reselect";
import { ClipId, getClipTicks } from "types/clip";
import { Pattern, PatternChord, PatternStream } from "types/pattern";
import { Transposition } from "types/transposition";
import { Tick } from "types/units";
import { selectPatternMap } from "./patterns";
import { selectPatternTrackMap } from "./patternTracks";
import { selectScaleTrackMap } from "./scaleTracks";
import { selectTranspositionMap } from "./transpositions";
import {
  PatternTrack,
  ScaleTrack,
  TrackId,
  getScaleTrackScale,
} from "types/tracks";
import { chromaticScale } from "types/scale";
import { selectCellWidth, selectTimeline } from "./timeline";
import { ticksToColumns } from "utils";
import { GenericScale, getClipStream } from "types";
import { selectSessionMap } from "./tracks";

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

// Select the name of a clip
export const selectClipName = createSelector(
  [selectClip, selectClipPattern],
  (clip, pattern): string => {
    if (!clip || !pattern) return "";
    return pattern.name;
  }
);

// Select the duration of a clip in ticks
export const selectClipDuration = createSelector(
  [selectClip, selectClipPattern],
  (clip, pattern) => {
    if (!clip || !pattern) return 0;
    return getClipTicks(clip, pattern);
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
    if (!patternTrack?.parentId) return;
    return scaleTracks[patternTrack.parentId];
  }
);

// Select the scale of a clip from its track
export const selectClipScale = createSelector(
  [selectClipScaleTrack, selectScaleTrackMap],
  (scaleTrack, scaleTracks): GenericScale => {
    if (!scaleTrack) return chromaticScale;
    return getScaleTrackScale(scaleTrack, { scaleTracks });
  }
);

// Select the transpositions of a clip
export const selectClipTranspositions = createSelector(
  [selectClip, selectTranspositionMap, selectSessionMap],
  (clip, transpositionMap, sessionMap): Transposition[] => {
    if (!clip) return [];
    return sessionMap.byId[clip.trackId]?.transpositionIds
      .map((id) => transpositionMap[id])
      .filter(Boolean);
  }
);

// Select the transposed stream of a specific clip
export const selectClipStream = createSelector(
  [
    selectClip,
    selectPatternMap,
    selectPatternTrackMap,
    selectScaleTrackMap,
    selectTranspositionMap,
    selectSessionMap,
  ],
  (clip, patterns, patternTracks, scaleTracks, transpositions, sessionMap) => {
    return getClipStream(clip, {
      patterns,
      patternTracks,
      scaleTracks,
      transpositions,
      sessionMap,
    });
  }
);

// Select the width of a clip
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
  [
    selectClips,
    selectPatternMap,
    selectPatternTrackMap,
    selectScaleTrackMap,
    selectTranspositionMap,
    selectSessionMap,
  ],
  (clips, patterns, patternTracks, scaleTracks, transpositions, sessionMap) => {
    const clipStreams = clips.map((clip) => {
      return getClipStream(clip, {
        patterns,
        patternTracks,
        scaleTracks,
        transpositions,
        sessionMap,
      });
    });
    return clips.reduce((acc, clip, i) => {
      const patternTrack = patternTracks[clip.trackId];
      if (!patternTrack?.parentId) return acc;
      const scaleTrack = scaleTracks[patternTrack.parentId];
      if (!scaleTrack) return acc;

      const stream = clipStreams[i];
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

// Select transport end tick
export const selectTransportEndTick = createSelector(
  [selectClips, selectPatternMap],
  (clips, patternMap) => {
    const lastTick = clips.reduce((last, clip) => {
      const pattern = patternMap[clip.patternId];
      if (!pattern) return last;
      const endTick = clip.tick + getClipTicks(clip, pattern);
      return Math.max(last, endTick);
    }, 0);
    return lastTick;
  }
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
