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
import { ClipId, PatternClipMidiStream, isPatternClip } from "types/Clip";
import { InstrumentNotesByTicks, LIVE_AUDIO_INSTANCES } from "types/Instrument";
import { Project } from "types/Project";
import { Tick } from "types/units";
import {
  selectClipDurationMap,
  selectPatternClips,
  selectPoseMap,
  selectTrackMap,
} from "redux/selectors";
import { TrackId, isPatternTrack } from "types/Track";
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
    const map = {} as Record<ClipId, PatternClipMidiStream>;

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
    const map = {} as Record<ClipId, PatternClipMidiStream>;
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
export const selectPortaledPatternClipStream = createArraySelector(
  selectPortaledPatternClipStreamMap
);

/** Select the map of tracks to their fully portaled pattern clips */
export const selectTrackPortaledPatternClipStreamMap = createDeepEqualSelector(
  [selectPortaledArrangement, selectPortaledPatternClipStreamMap],
  (arrangement, streamMap) => {
    const clipMap = arrangement.clips;
    const trackMap = arrangement.tracks;
    const trackIds = Object.keys(trackMap) as TrackId[];
    const clipIds = Object.keys(streamMap) as ClipId[];

    const result = {} as Record<TrackId, PatternClipMidiStream[]>;

    // Insert the initial tracks with empty arrays
    for (const trackId of trackIds) {
      if (result[trackId] === undefined) {
        result[trackId] = [];
      }
    }

    // Iterate through each portaled clip ID
    for (const clipId of clipIds) {
      const clip = clipMap[clipId];
      if (!clip) continue;

      // Get the pattern track
      const patternTrack = trackMap[clip.trackId];
      if (!isPatternTrack(patternTrack)) continue;

      // Get the stream
      const stream = streamMap[clipId];
      if (!stream) continue;

      // Add the stream to the result
      const trackId = patternTrack.id;
      result[trackId].push(stream);
    }

    // Return the result
    return result;
  }
);

/** Select the fully portaled clip streams of a track. */
export const selectTrackPortaledPatternClipStreams = createArraySelector(
  selectTrackPortaledPatternClipStreamMap
);

/** Select all pattern chords to be played by each track at every tick. */
export const selectChordsByTicks = createDeepEqualSelector(
  [
    selectPortaledArrangement,
    selectPortaledPatternClipStreamMap,
    selectTrackMap,
  ],
  (arrangement, streamMap, trackMap) => {
    const result = {} as InstrumentNotesByTicks;
    const clipIds = Object.keys(streamMap) as ClipId[];
    const clipMap = arrangement.clips ?? {};

    // Iterate through each clip stream
    for (const key of clipIds) {
      const clip = clipMap[key];
      const stream = streamMap[key];
      const streamLength = stream.length;
      if (!clip || !streamLength) continue;

      // Get the pattern track
      const patternTrack = trackMap[clip.trackId];
      if (!isPatternTrack(patternTrack)) continue;

      // Get the instrument ID
      const instrumentStateId = patternTrack.instrumentId;
      if (!instrumentStateId) continue;

      // Iterate through each chord in the stream
      for (let j = 0; j < streamLength; j++) {
        // Get the current chord
        const { notes, startTick } = stream[j];
        if (!notes.length) continue;

        // Add the chord to the map if it does not exist
        if (result[startTick] === undefined) {
          result[startTick] = {};
        }
        if (result[startTick][instrumentStateId] === undefined) {
          result[startTick][instrumentStateId] = [];
        }
        result[startTick][instrumentStateId].push(...notes);
      }
    }
    // Return the result
    return result;
  }
);

/** Select the chord record at the given tick. */
export const selectChordsAtTick = (project: Project, tick: Tick) => {
  const chordsByTicks = selectChordsByTicks(project);
  return chordsByTicks[tick];
};
