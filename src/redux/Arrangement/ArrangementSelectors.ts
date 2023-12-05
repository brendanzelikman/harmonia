import { selectClipMap } from "redux/Clip";
import { selectPatternMap } from "redux/Pattern";
import { selectPortals } from "redux/Portal/PortalSelectors";
import { selectScaleMap } from "redux/Scale";
import { selectTransport } from "redux/Transport";
import { createArraySelector, createDeepEqualSelector } from "redux/util";
import { createSelector } from "reselect";
import {
  TrackArrangement,
  LiveArrangement,
  getPatternClipStream,
} from "types/Arrangement";
import { ClipId, isPatternClip } from "types/Clip";
import { InstrumentNotesByTicks } from "types/Instrument";
import {
  getPatternBlockAtIndex,
  getPatternMidiChordNotes,
  isPatternMidiChord,
  PatternMidiStream,
} from "types/Pattern";
import { Project } from "types/Project";
import { Tick } from "types/units";
import { getValueByKey } from "utils/objects";
import {
  selectClipDurationMap,
  selectPatternClips,
  selectPoseMap,
  selectTrackMap,
} from "redux/selectors";
import { isPatternTrack } from "types/Track";
import { PortaledClipMap, applyPortalsToClips } from "types/Portal";

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
export const selectTrackArrangement = createDeepEqualSelector(
  selectLiveArrangement,
  (arrangement): TrackArrangement => ({
    tracks: arrangement.tracks.byId,
    clips: arrangement.clips.byId,
  })
);

/** Select the portaled clips. */
export const selectPortaledClipMap = createDeepEqualSelector(
  [selectClipMap, selectClipDurationMap, selectPortals],
  (clipMap, durationMap, portals) => {
    const clips = Object.values(clipMap);
    const durations = clips.map((clip) => durationMap[clip.id]);
    const portaledClips = applyPortalsToClips(clips, portals, durations);
    return portaledClips.flat().reduce((acc, clip) => {
      acc[clip.id] = clip;
      return acc;
    }, {} as PortaledClipMap);
  }
);

/** Select the track arrangement after portals have been applied.  */
export const selectPortaledArrangement = createDeepEqualSelector(
  [selectTrackArrangement, selectPortaledClipMap],
  (arrangement, clips): TrackArrangement => {
    return { ...arrangement, clips };
  }
);

/** Select the last tick of the arrangement (based on pattern clips only). */
export const selectLastArrangementTick = createSelector(
  [selectPatternClips, selectClipDurationMap, selectTransport],
  (clips, durationMap, transport) => {
    if (transport.loop) return transport.loopEnd;
    const lastTick = clips.reduce((last, clip) => {
      const endTick = clip.tick + durationMap[clip.id];
      return Math.max(last, endTick);
    }, 0);
    return lastTick;
  }
);

/** Select the fully transposed streams of all pattern clips (before portaling). */
export const selectPatternClipStreamMap = createDeepEqualSelector(
  [
    selectPatternClips,
    selectTrackArrangement,
    selectScaleMap,
    selectPatternMap,
    selectPoseMap,
  ],
  (clips, arrangement, scales, patterns, poses) => {
    const map = {} as Record<ClipId, PatternMidiStream>;

    for (const clip of clips) {
      const pattern = patterns[clip.patternId];
      const stream = getPatternClipStream(clip, {
        pattern,
        scales,
        poses,
        ...arrangement,
      });
      map[clip.id] = stream;
    }
    return map;
  }
);

/** Select the fully transposed stream of a clip. */
export const selectPatternClipStream = createArraySelector(
  selectPatternClipStreamMap
);

/** Select the fully transposed streams of all clips (after portaling). */
export const selectPortaledPatternClipStreamMap = createDeepEqualSelector(
  [selectPortaledArrangement, selectScaleMap, selectPatternMap, selectPoseMap],
  (arrangement, scales, patterns, poses) => {
    const map = {} as Record<ClipId, PatternMidiStream>;
    const patternClips = Object.values(arrangement.clips).filter(isPatternClip);

    // Iterate through each clip and get the stream
    for (const clip of patternClips) {
      const pattern = patterns[clip.patternId];
      const stream = getPatternClipStream(clip, {
        pattern,
        scales,
        poses,
        ...arrangement,
      });
      map[clip.id] = stream;
    }
    return map;
  }
);

/** Select the fully transposed stream of a portaled clip. */
export const selectPortaledPatternClipStream = (
  project: Project,
  id?: ClipId
) => {
  const streamMap = selectPortaledPatternClipStreamMap(project);
  return getValueByKey(streamMap, id) ?? [];
};

/** Select all pattern chords to be played by each track at every tick. */
export const selectChordsByTicks = createDeepEqualSelector(
  [
    selectPortaledArrangement,
    selectPortaledPatternClipStreamMap,
    selectTrackMap,
  ],
  (arrangement, streamMap, tracks) => {
    const result = {} as InstrumentNotesByTicks;
    const streamKeys = Object.keys(streamMap) as ClipId[];
    const clipMap = arrangement.clips ?? {};

    // Iterate through each clip stream
    for (const key of streamKeys) {
      const clip = clipMap[key];
      const stream = streamMap[key];
      const streamLength = stream.length;
      if (!clip) continue;

      // Get the pattern track
      const patternTrack = tracks[clip.trackId];
      if (!isPatternTrack(patternTrack)) continue;

      // Get the instrument ID
      const instrumentStateId = patternTrack.instrumentId;
      if (!instrumentStateId) continue;

      const baseTick = clip.tick;

      // Iterate through each chord in the stream
      for (let j = 0; j < streamLength; j++) {
        // Get the current chord
        const block = getPatternBlockAtIndex(stream, j);
        if (!block || !isPatternMidiChord(block)) continue;

        // Get the current tick within the clip
        const notes = getPatternMidiChordNotes(block);
        const tick = baseTick + j;

        // Add the chord to the map
        if (result[tick] === undefined) {
          result[tick] = {};
        }
        if (result[tick][instrumentStateId] === undefined) {
          result[tick][instrumentStateId] = [];
        }
        result[tick][instrumentStateId].push(...notes);
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
