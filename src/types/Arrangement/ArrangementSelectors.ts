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
  PatternClip,
  isPoseClipId,
  PortaledPatternClipId,
  PortaledPatternClip,
  PortaledPoseClipId,
  ClipType,
  IClipId,
  PortaledClip,
  isPortaledPatternClipId,
  IClip,
  PortaledScaleClip,
  PortaledPoseClip,
} from "types/Clip/ClipTypes";
import { ClipMapsByType, ClipsByTrack } from "types/Clip/ClipUtils";
import {
  InstrumentId,
  InstrumentNotesByTicks,
} from "types/Instrument/InstrumentTypes";
import { PatternId, PatternMidiStream } from "types/Pattern/PatternTypes";
import { applyPortalsToClips } from "types/Portal/PortalFunctions";
import { PortaledClipId, PortaledClipMap } from "types/Portal/PortalTypes";
import { Project } from "types/Project/ProjectTypes";
import { TrackId, isPatternTrack } from "types/Track/TrackTypes";
import { Tick } from "types/units";
import { getArrayByKey } from "utils/objects";
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
  selectTrackChainIdsMap,
  selectTrackDescendantPatternTrackMap,
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
import {
  getMidiStreamMinMax,
  getPatternMidiChordNotes,
} from "types/Pattern/PatternUtils";
import { selectTrackMidiScaleAtTick } from "./ArrangementTrackSelectors";
import { DemoXML } from "assets/demoXML";
import {
  getPatternBlockDuration,
  getPatternMidiChordAtIndex,
} from "types/Pattern/PatternFunctions";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { mapValues } from "lodash";
import { isFiniteNumber } from "types/util";

/** Select the arrangement as a basic collection of dependencies (entities). */
export const selectTrackArrangement = createDeepSelector(
  [selectTrackMap, selectPatternClipMap, selectPoseClipMap, selectScaleClipMap],
  (tracks, pattern, pose, scale) => ({
    tracks,
    clips: { pattern, pose, scale },
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

export const selectFirstPortaledPatternClipId = createDeepSelector(
  [selectPortaledClipMap],
  (clipMap) => Object.keys(clipMap)[0] as PortaledPatternClipId | undefined
);

/** Select all portaled clips. */
export const selectPortaledClips = createDeepSelector(
  [selectPortaledClipMap],
  (clipMap) => Object.values(clipMap)
);

/** Select all portaled clip IDs. */
export const selectPortaledClipIds = createDeepSelector(
  [selectPortaledClips],
  (clips) => clips.map((clip) => clip.id)
);

/** Select the map of tracks to their clip IDs. */
export const selectTrackClipIdsMap = createDeepSelector(
  [selectClips],
  (clips) =>
    clips.reduce((acc, clip) => {
      const trackId = clip.trackId;
      if (!acc[trackId]) acc[trackId] = [];
      acc[trackId].push(clip.id);
      return acc;
    }, {} as Record<TrackId, ClipId[]>)
);

/** Select the map of tracks to their portaled clip IDs. */
export const selectTrackPortaledClipIdsMap = createDeepSelector(
  [selectPortaledClips],
  (clips) =>
    clips.reduce((acc, clip) => {
      const trackId = clip.trackId;
      if (!acc[trackId]) acc[trackId] = [];
      acc[trackId].push(clip.id);
      return acc;
    }, {} as Record<TrackId, PortaledClipId[]>)
);

export const selectTrackClipIds = (project: Project, id: TrackId) => {
  const map = selectTrackClipIdsMap(project);
  return map[id] ?? [];
};

export const selectPortaledPatternClipIds = createSelector(
  [selectPortaledClipIds],
  (ids) => ids.filter(isPortaledPatternClipId)
);

export const selectPortaledClipIdTickMap = createDeepSelector(
  [selectPortaledClipMap],
  (clipMap) =>
    mapValues(clipMap, (clip) => ({
      tick: clip.tick,
      duration: clip.duration,
    }))
);

const selectPortaledClipId = <T extends ClipType = ClipType>(
  _: Project,
  id: PortaledClipId<IClipId<T>>
) => id;

export const selectPortaledClipById = createDeepSelector(
  [selectPortaledClipMap, selectPortaledClipId],
  (clipMap, id) => clipMap[id]
);

export const createSelectedPortaledClipById = <T extends ClipType = ClipType>(
  id: PortaledClipId<IClipId<T>>
) => createDeepSelector([selectPortaledClipMap], (clipMap) => clipMap[id]);

/** Select the track arrangement after portals have been applied.  */
export const selectProcessedArrangement = createDeepSelector(
  [
    selectTrackArrangement,
    selectTrackChainIdsMap,
    selectTrackDescendantPatternTrackMap,
    selectPortaledClipMap,
  ],
  (arrangement, chainIdsByTrack, ptsByTrack, clipMap): TrackArrangement => {
    const clips = Object.values(clipMap);
    const clipsByTrack: ClipsByTrack = {};
    const clipMaps: ClipMapsByType = { pattern: {}, pose: {}, scale: {} };
    for (const clip of clips) {
      // Add the clip by type
      if (clip.type === "pattern") {
        clipMaps.pattern[clip.id] = clip;
        if (isScaleTrackId(clip.trackId)) {
          const newClips = ptsByTrack[clip.trackId].map((pt) => {
            return { ...clip, trackId: pt.id, id: clip.id + "-" + pt.id };
          });
          for (const newClip of newClips) {
            clipMaps.pattern[newClip.id] = newClip as PatternClip;
          }
        }
      } else if (clip.type === "pose") {
        clipMaps.pose[clip.id] = clip;
      } else if (clip.type === "scale") {
        clipMaps.scale[clip.id] = clip;
      }

      // Add the clip by track
      if (!clipsByTrack[clip.trackId]) {
        clipsByTrack[clip.trackId] = {
          pattern: [] as PortaledPatternClip[],
          pose: [] as PortaledPoseClip[],
          scale: [] as PortaledScaleClip[],
        };
      }

      const region = clipsByTrack[clip.trackId];
      const area = region[clip.type] as IClip<typeof clip.type>[];
      area.push(clip);
    }

    return {
      ...arrangement,
      clips: clipMaps,
      clipsByTrack,
      chainIdsByTrack,
      ptsByTrack,
    };
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
  (arrangement, motifs) =>
    mapValues(arrangement.clips.pattern, (clip) =>
      !!clip ? getPatternClipMidiStream({ ...arrangement, clip, motifs }) : []
    )
);

/** Select the fully transposed stream of a portaled clip. */
export const selectPatternClipStream = (project: Project, id: ClipId) => {
  const streamMap = selectPatternClipStreamMap(project);
  return streamMap[id];
};

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
    const clipIds = Object.keys(streamMap) as PortaledPatternClipId[];

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
      const track = tracks[clip.trackId];
      if (!track) continue;

      // Get the stream
      const stream = streamMap[clipId];
      if (!stream) continue;

      // Add the stream to the result
      const trackId = track.id;
      result[trackId].push(stream);
    }

    // Return the result
    return result;
  }
);

/** Select all pattern chords to be played by each track at every tick. */
export const selectMidiChordsByTicks = createDeepSelector(
  [
    selectProcessedArrangement,
    selectPatternClipStreamMap,
    selectPortaledClipIds,
  ],
  (arrangement, streamMap, clipIds) => {
    const result = {} as InstrumentNotesByTicks;
    const clips = arrangement.clips.pattern;

    // Iterate through each clip stream
    for (const clip of Object.values(clips)) {
      if (!clip) continue;
      const stream = streamMap[clip.id];
      const streamLength = stream?.length;
      if (!clip || !streamLength) continue;

      // Get the pattern track
      const track = arrangement.tracks[clip.trackId];
      if (track?.type !== "pattern") continue;
      const instrumentStateId = track.instrumentId;

      // Iterate through each chord in the stream
      for (let j = 0; j < streamLength; j++) {
        // Get the current chord
        const { notes, startTick } = stream[j];

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
  [selectPortaledClips],
  (clips) => {
    const allPatternClips: PortaledPatternClip[] = [];
    const allOtherClips: PortaledClip[] = [];
    for (const clip of clips) {
      if (isPortaledPatternClipId(clip.id))
        allPatternClips.push(clip as PortaledPatternClip);
      else allOtherClips.push(clip);
    }
    const result = {} as Record<PortaledPatternClipId, PortaledClipId[]>;
    if (!allPatternClips.length || !allOtherClips.length) return result;

    // Iterate over other clips and return true if any overlap
    for (const pc of allPatternClips) {
      // Find the closest overlapping clip
      const otherClips = allOtherClips
        .filter((oc) => oc.trackId === pc.trackId)
        .sort(
          (a, b) => Math.abs(a.tick - pc.tick) - Math.abs(b.tick - pc.tick)
        );

      const pcDuration = getMediaElementDuration(pc, pc.duration);
      const pcEndTick = pc.tick + pcDuration;

      // Check if the clip is in range
      for (const clip of otherClips) {
        const startTick = clip.tick;
        const clipDuration = getMediaElementDuration(clip, clip.duration);
        const endTick = startTick + (clipDuration ?? Infinity);
        if (
          (pc.tick < endTick && startTick < pcEndTick) ||
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

/** Select a pattern clip's overlapping portaled clips. */
export const selectOverlappingPortaledClips = (
  project: Project,
  id: PortaledClipId
) => {
  const ids = selectOverlappingPortaledClipIds(project, id);
  const clipMap = selectPortaledClipMap(project);
  return ids.map((id) => clipMap[id]);
};

/** Select a pattern clip's overlapping pose clip IDs */
export const selectClosestPoseClipId = (
  project: Project,
  id: PortaledClipId
) => {
  const ids = selectOverlappingPortaledClipIds(project, id);
  const poseClipIds = ids.filter(isPoseClipId);
  return poseClipIds.at(0) as PortaledPoseClipId | undefined;
};

export const selectPatternClipMidiStreamMap = createSelector(
  [selectProcessedArrangement, selectMotifState],
  (arrangement, motifs) =>
    mapValues(arrangement.clips.pattern, (clip) => {
      if (!clip) return [];
      const pattern = motifs?.pattern?.entities?.[clip.patternId];
      if (!pattern) return [];
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
        const midiChord = getPatternMidiChordAtIndex(midiStream, index);
        if (!midiChord) return;

        // If the block is not strummed, just push the chord to the stream
        const chordNotes = getPatternMidiChordNotes(midiChord);
        const newNotes = chordNotes.length
          ? chordNotes
          : { duration: getPatternBlockDuration(midiChord) };
        stream.push(newNotes);
      });
      return stream;
    })
);

export const selectPatternClipMidiStream = createArraySelector(
  selectPatternClipMidiStreamMap
);

export const selectPatternClipStreamLengthMap = createDeepSelector(
  [selectPatternClipMidiStreamMap],
  (streamMap) => mapValues(streamMap, (stream) => stream.length)
);

export const selectPatternClipStreamLength = createValueSelector(
  selectPatternClipStreamLengthMap,
  0
);

export const selectPatternClipStreamRangeMap = createSelector(
  [selectPatternClipMidiStreamMap],
  (streamMap) => mapValues(streamMap, getMidiStreamMinMax)
);

export const selectPatternClipMidiStreamMin = (
  project: Project,
  id: ClipId
) => {
  const rangeMap = selectPatternClipStreamRangeMap(project);
  return rangeMap[id]?.min;
};

export const selectPatternClipMidiStreamMax = (
  project: Project,
  id: ClipId
) => {
  const rangeMap = selectPatternClipStreamRangeMap(project);
  return rangeMap[id]?.max;
};

export const selectPatternXML = (project: Project, id?: PatternId) => {
  if (!id) return DemoXML;
  const pattern = selectPatternById(project, id);
  const scaleChain = selectTrackScaleChain(project, pattern?.trackId);
  return exportPatternToXML(pattern, scaleChain);
};

export const selectPatternClipXML = (project: Project, clip?: PatternClip) => {
  if (!clip) return DemoXML;
  const pattern = selectPatternById(project, clip?.patternId);
  const trackId = pattern?.trackId;

  // Get the current scale chain
  const stream = selectPatternClipMidiStream(project, clip.id);
  const scale = selectTrackMidiScaleAtTick(project, trackId, clip?.tick);
  return exportPatternStreamToXML(stream, scale);
};

/** Select the durations of all portaled clips. */
export const selectPortaledClipDurationMap = createDeepSelector(
  [selectPortaledClipMap, selectPatternClipStreamMap],
  (clipMap, streamMap) =>
    mapValues(clipMap, (clip) => {
      const stream = getArrayByKey(streamMap, clip.id as PortaledPatternClipId);
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
