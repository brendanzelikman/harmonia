import { selectClips } from "redux/Clip";
import { selectPatternMap } from "redux/Pattern";
import { selectPatternTrackMap } from "redux/PatternTrack";
import { selectTransport } from "redux/Transport";
import { selectScaleMap } from "redux/selectors";
import { createDeepEqualSelector } from "redux/util";
import { createSelector } from "reselect";
import { Arrangement, NormalLiveArrangement } from "types/Arrangement";
import { ClipId, getClipDuration, getClipStream } from "types/Clip";
import { InstrumentChordsByTicks } from "types/Instrument";
import {
  getPatternBlockAtIndex,
  isPatternRest,
  PatternMidiChord,
  PatternMidiStream,
} from "types/Pattern";
import { Project } from "types/Project";
import { Tick } from "types/units";
import { getValueByKey } from "utils/objects";

/** Select the length of the arrangement past. */
export const selectArrangementPastLength = (project: Project) =>
  project.arrangement.past.length;

/** Select the length of the arrangement future. */
export const selectArrangementFutureLength = (project: Project) =>
  project.arrangement.future.length;

/** Select the entire arrangement (allIds/byId, loaded with live instruments). */
export const selectLiveArrangement = (
  project: Project
): NormalLiveArrangement => project.arrangement.present;

/** Select the arrangement as a basic collection of dependencies (byId). */
export const selectBasicArrangement = createSelector(
  selectLiveArrangement,
  (arrangement): Arrangement => ({
    scaleTracks: arrangement.scaleTracks.byId,
    patternTracks: arrangement.patternTracks.byId,
    clips: arrangement.clips.byId,
    transpositions: arrangement.transpositions.byId,
    tracks: arrangement.hierarchy.byId,
  })
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

/** Select the fully transposed streams of all clips. */
export const selectClipStreamMap = createDeepEqualSelector(
  [selectClips, selectBasicArrangement, selectScaleMap, selectPatternMap],
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

/** Select all pattern chords to be played by each track at every tick. */
export const selectChordsByTicks = createDeepEqualSelector(
  [selectClips, selectClipStreamMap, selectPatternTrackMap],
  (clips, clipStreams, patternTrackMap) => {
    const result = {} as InstrumentChordsByTicks;
    const length = clips.length;

    // Iterate through each clip stream
    for (let i = 0; i < length; i++) {
      const clip = clips[i];
      const stream = clipStreams[clip.id];
      const streamLength = stream.length;
      if (!clip) continue;

      // Get the pattern track
      const patternTrack = patternTrackMap[clip.trackId];
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
        if (result[tick] === undefined) result[tick] = {};
        result[tick][instrumentStateId] = chord;
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
