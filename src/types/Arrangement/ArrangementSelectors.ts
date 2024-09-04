import {
  createDeepSelector,
  createArraySelector,
  createValueSelector,
} from "lib/redux";
import { createSelector } from "reselect";
import {
  ClipId,
  PatternClipMidiStream,
  ClipMap,
  PatternClipId,
  isPatternClipId,
  isPatternClip,
  PatternClip,
  isPoseClipId,
  PortaledPatternClipId,
  PortaledPatternClip,
} from "types/Clip/ClipTypes";
import { getClipMapsByType } from "types/Clip/ClipUtils";
import { InstrumentNotesByTicks } from "types/Instrument/InstrumentTypes";
import {
  PatternId,
  PatternMidiChord,
  PatternMidiStream,
} from "types/Pattern/PatternTypes";
import {
  applyPortalsToClips,
  getOriginalIdFromPortaledClip,
} from "types/Portal/PortalFunctions";
import { PortaledClipId, PortaledClipMap } from "types/Portal/PortalTypes";
import { Project } from "types/Project/ProjectTypes";
import { TrackId, isPatternTrack } from "types/Track/TrackTypes";
import { Tick } from "types/units";
import { getDictValues } from "utils/objects";
import {
  getPatternClipMidiStream,
  getMidiStreamAtTickInTrack,
  loopOverClipStream,
} from "./ArrangementFunctions";
import { TrackArrangement } from "./ArrangementTypes";
import {
  selectClipDurationMap,
  selectClips,
  selectPatternClipMap,
  selectPoseClipMap,
  selectScaleClipMap,
} from "types/Clip/ClipSelectors";
import { selectPortals } from "types/Portal/PortalSelectors";
import { selectPatternClips } from "types/Clip/ClipSelectors";
import { selectTransport } from "types/Transport/TransportSelectors";
import {
  selectTrackIds,
  selectTrackMap,
  selectTrackScaleChain,
} from "types/Track/TrackSelectors";
import { selectMotifState } from "types/Motif/MotifSelectors";
import { getMediaElementDuration } from "types/Media/MediaFunctions";
import { getClipDuration } from "types/Clip/ClipFunctions";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import {
  exportPatternStreamToXML,
  exportPatternToXML,
} from "types/Pattern/PatternExporters";
import { getPatternMidiChordNotes } from "types/Pattern/PatternUtils";
import { selectTrackScaleChainAtTick } from "./ArrangementTrackSelectors";
import { DemoXML } from "assets/demoXML";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import {
  getPoseVectorAtTick,
  getPoseClipsByTrackId,
} from "types/Clip/PoseClip/PoseClipFunctions";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import {
  getRotatedScale,
  getTransposedScale,
} from "types/Scale/ScaleTransformers";
import { getVector_T, getVector_O, getVector_t } from "utils/vector";
import {
  getPatternBlockAtIndex,
  getPatternBlockDuration,
} from "types/Pattern/PatternFunctions";
import {
  isPatternTrackId,
  PatternTrackId,
} from "types/Track/PatternTrack/PatternTrackTypes";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { inRange, mapValues } from "lodash";
import { isFiniteNumber } from "types/util";

/** Select the arrangement as a basic collection of dependencies (entities). */
export const selectTrackArrangement = createDeepSelector(
  [selectTrackMap, selectPatternClipMap, selectPoseClipMap, selectScaleClipMap],
  (tracks, pattern, pose, scale) => ({
    tracks,
    clips: {
      pattern,
      pose,
      scale,
    },
  })
);

/** Select whether the timeline is available. */
export const selectHasTracks = createSelector(
  [selectTrackIds],
  (ids) => !!ids.length
);

/** Select whether a track tree has been created. */
export const selectHasTrackTree = createDeepSelector(
  [selectTrackMap],
  (trackMap) =>
    Object.keys(trackMap).some(isPatternTrackId) &&
    Object.keys(trackMap).some(isScaleTrackId)
);

/** Select the portaled clip map. */
export const selectPortaledClipMap = createDeepSelector(
  [selectClips, selectPortals],
  (clips, portals) => {
    const portaledClips = applyPortalsToClips(clips, portals);
    const result = {} as PortaledClipMap;
    for (const clip of portaledClips.flat()) {
      result[clip.id] = clip;
    }
    return result;
  }
);

/** Select all portaled clips. */
export const selectPortaledClips = createDeepSelector(
  [selectPortaledClipMap],
  (clipMap) =>
    Object.values(clipMap).sort((a, b) => {
      if (isPatternClipId(a.id)) return 1;
      if (isPatternClipId(b.id)) return -1;
      return 0;
    })
);

/** Select the track arrangement after portals have been applied.  */
export const selectProcessedArrangement = createDeepSelector(
  [selectTrackArrangement, selectPortaledClipMap],
  (arrangement, clipMap): TrackArrangement => {
    return { ...arrangement, clips: getClipMapsByType(clipMap) };
  }
);

/** Select the last tick of the arrangement (based on pattern clips only). */
export const selectLastArrangementTick = createSelector(
  [selectPatternClips, selectClipDurationMap, selectTransport],
  (clips, durationMap, transport) => {
    if (!clips.length) return 0;
    if (transport.loop) return transport.loopEnd;
    const lastTick = clips.reduce((last, clip) => {
      const endTick = clip.tick + (durationMap[clip.id] ?? 0);
      return Math.max(last, endTick);
    }, 0);
    return lastTick;
  }
);

/** Select the fully transposed streams of all clips (after portaling). */
export const selectPatternClipStreamMap = createDeepSelector(
  [selectProcessedArrangement, selectMotifState],
  (arrangement, motifs) => {
    const map = {} as Record<ClipId, PatternClipMidiStream>;
    const patternClips = getDictValues(arrangement.clips?.pattern);

    // Iterate through each clip and get the stream
    for (const clip of patternClips) {
      map[clip.id] = getPatternClipMidiStream({
        ...arrangement,
        clip,
        motifs,
      });
    }
    return map;
  }
);

/** Select the fully transposed stream of a portaled clip. */
export const selectPatternClipStream = createArraySelector(
  selectPatternClipStreamMap
);

/** Select the map of tracks to their fully portaled pattern clips */
export const selectTrackPatternClipStreamMap = createSelector(
  [selectProcessedArrangement, selectTrackIds, selectPatternClipStreamMap],
  (arrangement, trackIds, streamMap) => {
    const clipMap: ClipMap = {
      ...arrangement.clips.pattern,
      ...arrangement.clips.pose,
      ...arrangement.clips.scale,
    };
    const { tracks } = arrangement;
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
      const patternTrack = tracks[clip.trackId as PatternTrackId];
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
export const selectTrackPatternClipStreams = createArraySelector(
  selectTrackPatternClipStreamMap
);

/** Select all pattern chords to be played by each track at every tick. */
export const selectMidiChordsByTicks = createSelector(
  [selectProcessedArrangement, selectPatternClipStreamMap, selectTrackMap],
  (arrangement, streamMap, trackMap) => {
    const result = {} as InstrumentNotesByTicks;
    const clipIds = Object.keys(streamMap) as PatternClipId[];
    const clips = arrangement.clips.pattern;

    // Iterate through each clip stream
    for (const key of clipIds) {
      const clip = isPatternClipId(key) ? clips[key] : undefined;
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
  const chordsByTicks = selectMidiChordsByTicks(project);
  return chordsByTicks[tick];
};

/** Select the map of pattern clips to overlapping pose clips. */
export const selectOverlappingPortaledClipIdMap = createDeepSelector(
  [selectPortaledClipMap],
  (clipMap) => {
    const clips = Object.values(clipMap);
    const allPatternClips = clips.filter(
      isPatternClip
    ) as PortaledPatternClip[];
    const allOtherClips = clips.filter((clip) => !isPatternClip(clip));
    const result = {} as Record<PortaledPatternClipId, PortaledClipId[]>;
    if (!allPatternClips.length || !allOtherClips.length) return result;

    // Iterate over other clips and return true if any overlap
    for (const pc of allPatternClips) {
      const otherClips = allOtherClips
        .filter((oc) => oc.trackId === pc.trackId)
        .sort(
          (a, b) => Math.abs(a.tick - pc.tick) - Math.abs(b.tick - pc.tick)
        );
      for (const clip of otherClips) {
        const startTick = clip.tick;
        const endTick = startTick + (clip.duration ?? Infinity);
        if (
          inRange(
            getMediaElementDuration(pc, pc.duration),
            startTick,
            endTick
          ) ||
          !isFiniteNumber(clip.duration)
        ) {
          result[pc.id] = (result[pc.id] ?? []).concat(clip.id);
          break;
        }
      }
      if (result[pc.id] === undefined) {
        result[pc.id] = [];
      }
    }
    return result;
  }
);

/** Select a pattern clip's overlapping portaled clip IDs */
export const selectOverlappingPortaledClipIds = createArraySelector(
  selectOverlappingPortaledClipIdMap
);

/** Select a pattern clip's overlapping pose clip IDs */
export const selectClosestPoseClipId = (
  project: Project,
  id: PortaledClipId
) => {
  const ids = selectOverlappingPortaledClipIds(project, id);
  const originalIds = ids.map(getOriginalIdFromPortaledClip);
  const poseClipIds = originalIds.filter(isPoseClipId);
  return poseClipIds.at(0);
};

export const selectPatternClipMidiStreamMap = createDeepSelector(
  [selectProcessedArrangement, selectMotifState],
  (arrangement, motifs) => {
    const map = {} as Record<ClipId, PatternMidiStream>;
    const patternClips = getDictValues(arrangement.clips.pattern);

    // Iterate through each clip and get the stream
    for (const clip of patternClips) {
      const pattern = motifs?.pattern?.entities[clip.patternId];
      if (!pattern) continue;

      // 1. Iterate over each tick of the pattern clip:
      const stream: PatternMidiStream = [];
      loopOverClipStream(clip, pattern, (_, tick, index) => {
        // 2 + 3. Process the scale chain and find the MIDI stream
        const midiStream = getMidiStreamAtTickInTrack(pattern.stream, {
          ...arrangement,
          clip,
          motifs,
          tick,
        });

        // 4. Obtain the MIDI notes at the current tick
        const midiChord = getPatternBlockAtIndex(
          midiStream,
          index
        ) as PatternMidiChord;

        // If the block is not strummed, just push the chord to the stream
        const chordNotes = getPatternMidiChordNotes(midiChord);
        const newNotes = chordNotes.length
          ? chordNotes
          : { duration: getPatternBlockDuration(midiChord) };
        stream.push(newNotes);
      });

      map[clip.id] = stream;
    }
    return map;
  }
);

export const selectPatternClipMidiStream = createArraySelector(
  selectPatternClipMidiStreamMap
);

export const selectPatternXML = (project: Project, id?: PatternId) => {
  if (!id) return DemoXML;
  const pattern = selectPatternById(project, id);
  const scaleChain = selectTrackScaleChain(project, pattern?.patternTrackId);
  return exportPatternToXML(pattern, scaleChain);
};

export const selectPatternClipXML = (project: Project, clip?: PatternClip) => {
  if (!clip) return DemoXML;
  const pattern = selectPatternById(project, clip?.patternId);
  const trackId = pattern?.patternTrackId;

  // Get the current scale chain
  const stream = selectPatternClipMidiStream(project, clip.id);
  const scaleChain = selectTrackScaleChainAtTick(project, trackId, clip?.tick);

  // Apply the track's current chromatic/chordal/octave offsets to the scale
  const poseMap = selectPoseMap(project);
  const poseClipMap = selectPoseClipMap(project);
  const poseClips = getPoseClipsByTrackId(poseClipMap, trackId);
  const vector = getPoseVectorAtTick(poseClips, poseMap, clip.tick);
  const scale = resolveScaleChainToMidi(
    scaleChain.map((scale, i) => {
      if (i === scaleChain.length - 1) {
        const scale1 = getTransposedScale(scale, getVector_T(vector));
        const scale2 = getRotatedScale(scale1, getVector_t(vector));
        const scale3 = getTransposedScale(scale2, 12 * getVector_O(vector));
        return scale3;
      }
      return scale;
    })
  );

  return exportPatternStreamToXML(stream, scale);
};

/** Select the durations of all portaled clips. */
export const selectPortaledClipDurationMap = createDeepSelector(
  [selectPortaledClipMap, selectPatternClipStreamMap],
  (clipMap, streamMap) =>
    mapValues(clipMap, (clip) => {
      const stream = streamMap[clip.id];
      return getClipDuration({
        ...clip,
        duration: clip.duration ?? stream.length,
      });
    })
);

export const selectPortaledClipDuration = createValueSelector(
  selectPortaledClipDurationMap,
  0
);
