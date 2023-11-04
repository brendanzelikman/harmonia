import { selectClipMap, selectClips } from "redux/Clip";
import { selectPatternMap } from "redux/Pattern";
import { selectPatternTrackMap } from "redux/PatternTrack";
import { selectPortals } from "redux/Portal/PortalSelectors";
import { selectScaleMap } from "redux/Scale";
import { selectTransport } from "redux/Transport";
import {
  selectTranspositionMap,
  selectTranspositions,
} from "redux/Transposition";
import { createDeepEqualSelector } from "redux/util";
import { createSelector } from "reselect";
import { TrackArrangement, LiveArrangement } from "types/Arrangement";
import {
  Clip,
  ClipId,
  ClipMap,
  getClipDuration,
  getClipStream,
} from "types/Clip";
import { InstrumentChordsByTicks } from "types/Instrument";
import {
  getPatternBlockAtIndex,
  isPatternRest,
  PatternMidiChord,
  PatternMidiStream,
} from "types/Pattern";
import {
  applyPortalsToClip,
  applyPortalsToClips,
  applyPortalsToTranspositions,
} from "types/Portal";
import { Project } from "types/Project";
import { TranspositionMap } from "types/Transposition";
import { Tick } from "types/units";
import { getValueByKey } from "utils/objects";

/** Select the length of the arrangement past. */
export const selectArrangementPastLength = (project: Project) =>
  project.arrangement.past.length;

/** Select the length of the arrangement future. */
export const selectArrangementFutureLength = (project: Project) =>
  project.arrangement.future.length;

/** Select the entire arrangement (allIds/byId, loaded with live instruments). */
export const selectLiveArrangement = (project: Project): LiveArrangement =>
  project.arrangement.present;

/** Select the arrangement as a basic collection of dependencies (byId). */
export const selectTrackArrangement = createSelector(
  selectLiveArrangement,
  (arrangement): TrackArrangement => ({
    tracks: arrangement.hierarchy.byId,
    scaleTracks: arrangement.scaleTracks.byId,
    patternTracks: arrangement.patternTracks.byId,
    clips: arrangement.clips.byId,
    transpositions: arrangement.transpositions.byId,
  })
);

/** Select the portaled clips. */
export const selectPortaledClipMap = createSelector(
  [selectClipMap, selectPortals, selectPatternMap],
  (clipMap, portals, patterns) => {
    // Portal the clips
    const clips = Object.values(clipMap);
    const durations = clips.map((clip) =>
      getClipDuration(clip, patterns[clip.patternId])
    );
    const portaledClips = applyPortalsToClips(clips, portals, durations);

    // Return the new clip map
    return portaledClips.reduce((acc, clip) => {
      acc[clip.id] = clip;
      return acc;
    }, {} as ClipMap);
  }
);

/** Select the portaled transpositions. */
export const selectPortaledTranspositionMap = createSelector(
  [selectTranspositionMap, selectPortals],
  (transpositionMap, portals) => {
    // Portal the transpositions
    const poses = Object.values(transpositionMap);
    const portaledPoses = applyPortalsToTranspositions(poses, portals);

    // Return the new transposition map
    return portaledPoses.reduce((acc, pose) => {
      acc[pose.id] = pose;
      return acc;
    }, {} as TranspositionMap);
  }
);

/** Select the track arrangement after portals have been applied.  */
export const selectPortaledArrangement = createSelector(
  [
    selectTrackArrangement,
    selectPortaledClipMap,
    selectPortaledTranspositionMap,
  ],
  (arrangement, clips, transpositions): TrackArrangement => {
    return { ...arrangement, clips, transpositions };
  }
);

/** Select the last tick of the arrangement (based on clips only). */
export const selectLastArrangementTick = createSelector(
  [selectClips, selectPatternMap, selectTransport],
  (clips, patternMap, transport) => {
    if (transport.loop) return transport.loopEnd;
    const lastTick = clips.reduce((last, clip) => {
      const pattern = patternMap[clip.patternId];
      if (!pattern) return last;
      const endTick = clip.tick + getClipDuration(clip, pattern);
      return Math.max(last, endTick);
    }, 0);
    return lastTick;
  }
);

/** Select the fully transposed streams of all clips (before portaling). */
export const selectClipStreamMap = createDeepEqualSelector(
  [selectClips, selectTrackArrangement, selectScaleMap, selectPatternMap],
  (clips, arrangement, scales, patterns) => {
    const map = {} as Record<ClipId, PatternMidiStream>;

    for (const clip of clips) {
      const pattern = patterns[clip.patternId];
      const stream = getClipStream(clip, { pattern, scales, ...arrangement });
      map[clip.id] = stream;
    }
    return map;
  }
);

/** Select the fully transposed stream of a clip. */
export const selectClipStream = (project: Project, id?: ClipId) => {
  const streamMap = selectClipStreamMap(project);
  return getValueByKey(streamMap, id) ?? [];
};

/** Select the fully transposed streams of all clips (after portaling). */
export const selectPortaledStreamMap = createDeepEqualSelector(
  [selectPortaledArrangement, selectScaleMap, selectPatternMap],
  (arrangement, scales, patterns) => {
    const map = {} as Record<ClipId, PatternMidiStream>;
    const allClips = Object.values(arrangement.clips);

    // Iterate through each clip and get the stream
    for (const clip of allClips) {
      const pattern = patterns[clip.patternId];
      const stream = getClipStream(clip, { pattern, scales, ...arrangement });
      map[clip.id] = stream;
    }
    return map;
  }
);

/** Select the fully transposed stream of a portaled clip. */
export const selectPortaledClipStream = (project: Project, id?: ClipId) => {
  const streamMap = selectPortaledStreamMap(project);
  return getValueByKey(streamMap, id) ?? [];
};

/** Select all pattern chords to be played by each track at every tick. */
export const selectChordsByTicks = createDeepEqualSelector(
  [selectPortaledArrangement, selectPortaledStreamMap, selectPatternTrackMap],
  (arrangement, streamMap, patternTracks) => {
    const result = {} as InstrumentChordsByTicks;
    const streamKeys = Object.keys(streamMap);
    const clipMap = arrangement.clips;

    // Iterate through each clip stream
    for (const key of streamKeys) {
      const clip = clipMap[key];
      const stream = streamMap[key];
      const streamLength = stream.length;
      if (!clip) continue;

      // Get the pattern track
      const patternTrack = patternTracks[clip.trackId];
      if (!patternTrack) continue;

      // Get the instrument ID
      const instrumentStateId = patternTrack.instrumentId;
      if (!instrumentStateId) continue;

      const baseTick = clip.tick;

      // Iterate through each chord in the stream
      for (let j = 0; j < streamLength; j++) {
        // Get the current chord
        const block = getPatternBlockAtIndex(stream, j);
        if (!block || isPatternRest(block)) continue;

        // Get the current tick within the clip
        const chord = block as PatternMidiChord;
        const tick = baseTick + j;

        // Add the chord to the map
        if (result[tick] === undefined) {
          result[tick] = {};
        }
        if (result[tick][instrumentStateId] === undefined) {
          result[tick][instrumentStateId] = [];
        }
        result[tick][instrumentStateId].push(...chord);
      }
    }

    return result;
  }
);
/** Select the chord record at the given tick. */
export const selectChordsAtTick = (project: Project, tick: Tick) => {
  const chordsByTicks = selectChordsByTicks(project);
  return chordsByTicks[tick];
};
