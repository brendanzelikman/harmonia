import { createDeepSelector, createValueSelector } from "types/redux";
import { createSelector } from "reselect";
import {
  isPortaledPatternClip,
  isPortaledPoseClip,
  PortaledPatternClipId,
  PortaledPatternClipMap,
  PortaledPoseClipMap,
} from "types/Clip/ClipTypes";
import { TrackPoseClips } from "./ArrangementTypes";
import { InstrumentNotesByTicks } from "types/Instrument/InstrumentTypes";
import { applyPortalsToClips } from "types/Portal/PortalFunctions";
import { PortaledClipId, PortaledClipMap } from "types/Portal/PortalTypes";
import {
  selectClipDurationMap,
  selectClips,
  selectPatternClipMap,
  selectPoseClipMap,
} from "types/Clip/ClipSelectors";
import { selectPortals } from "types/Portal/PortalSelectors";
import { selectPatternClips } from "types/Clip/ClipSelectors";
import { selectTransportBPM } from "types/Transport/TransportSelectors";
import {
  selectScaleTrackChainIdsMap,
  selectTrackDescendantIdMap,
  selectTrackMap,
} from "types/Track/TrackSelectors";
import { selectPatternState } from "types/Pattern/PatternSelectors";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { mapValues } from "lodash";
import { ticksToSeconds } from "utils/duration";
import { selectScaleState } from "types/Scale/ScaleSelectors";
import { selectPoseState } from "types/Pose/PoseSelectors";
import { getPatternClipMidiStream } from "./ArrangementFunctions";
import { TrackArrangement } from "./ArrangementTypes";
import { Project } from "types/Project/ProjectTypes";

/** Select the map of all portaled clips. */
export const selectPortaledClipMap = createDeepSelector(
  [selectClips, selectPortals],
  (clips, portals) => {
    const portaledClips = applyPortalsToClips(clips, portals);
    return portaledClips.reduce(
      (acc, clip) => ({ ...acc, [clip.id]: clip }),
      {} as PortaledClipMap
    );
  }
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

/** Select a portaled clip by ID. */
export const selectPortaledClip = createValueSelector(selectPortaledClipMap);

/** Select the arrangement as a basic collection of dependencies (entities). */
export const selectTrackArrangement = createDeepSelector(
  [
    selectTrackMap,
    selectPatternClipMap,
    selectPoseClipMap,
    selectScaleState,
    selectPatternState,
    selectPoseState,
  ],
  (tracks, patternClips, poseClips, scales, patterns, poses) => ({
    tracks,
    patternClips,
    poseClips,
    scales,
    patterns,
    poses,
  })
);

/** Select the track arrangement after portals have been applied.  */
export const selectProcessedArrangement = createDeepSelector(
  [
    selectTrackArrangement,
    selectPortaledClips,
    selectTrackDescendantIdMap,
    selectScaleTrackChainIdsMap,
  ],
  (
    baseArrangement,
    portaledClips,
    descendantIdsByTrack,
    chainIdsByTrack
  ): TrackArrangement => {
    const patternClips: PortaledPatternClipMap = {};
    const poseClips: PortaledPoseClipMap = {};
    const trackPoseClips: TrackPoseClips = {};

    // Iterate over every portaled clip
    for (const clip of portaledClips) {
      const region = (trackPoseClips[clip.trackId] ??= []);

      // Store each pose clip to its track
      if (isPortaledPoseClip(clip)) {
        poseClips[clip.id] = clip;
        region.push(clip);
      }

      // Copy pattern clips to descendants if they are on a scale track
      else if (isPortaledPatternClip(clip)) {
        patternClips[clip.id] = clip;

        if (isScaleTrackId(clip.trackId)) {
          const trackIds = descendantIdsByTrack[clip.trackId];
          if (!trackIds?.length) continue;
          const ptIds = trackIds.filter(isPatternTrackId);
          for (const ptId of ptIds) {
            const newId = (clip.id + "-" + ptId) as PortaledPatternClipId;
            patternClips[newId] = { ...clip, trackId: ptId, id: newId };
          }
        }
      }
    }

    // Insert the new clips into the arrangement
    return {
      ...baseArrangement,
      patternClips,
      poseClips,
      trackPoseClips,
      chainIdsByTrack,
    };
  }
);

/** Select the last tick of the arrangement (based on pattern clips only). */
export const selectLastArrangementTick = createSelector(
  [selectPatternClips, selectClipDurationMap],
  (clips, durationMap) => {
    if (!clips.length) return 0;
    const lastTick = clips.reduce((last, clip) => {
      const endTick = clip.tick + (durationMap[clip.id] ?? 0);
      return Math.max(last, endTick);
    }, 0);
    return lastTick;
  }
);

/** Select the duration of a project (its last second) */
export const selectLastArrangementSecond = createSelector(
  [selectLastArrangementTick, selectTransportBPM],
  (lastTick, bpm) => ticksToSeconds(lastTick, bpm)
);

/** Select the fully transposed streams of all clips (after portaling). */
export const selectPortaledPatternClipStreamMap = createDeepSelector(
  [selectProcessedArrangement],
  (arrangement) =>
    mapValues(arrangement.patternClips, (clip) =>
      clip !== undefined
        ? getPatternClipMidiStream({ ...arrangement, clip })
        : []
    )
);
/** Select the fully transposed stream of a portaled clip. */
export const selectPortaledPatternClipStream = (
  project: Project,
  clipId: PortaledClipId
) => {
  return (
    selectPortaledPatternClipStreamMap(project)[
      clipId as PortaledPatternClipId
    ] ?? []
  );
};
/** Select all pattern chords to be played by each track at every tick. */
export const selectMidiChordsByTicks = createDeepSelector(
  [
    selectProcessedArrangement,
    selectPortaledPatternClipStreamMap,
    selectTrackDescendantIdMap,
  ],
  (arrangement, streamMap, descendantMap) => {
    const result = {} as InstrumentNotesByTicks;

    // Iterate through each clip stream
    const patternClips = Object.values(arrangement.patternClips);
    for (const clip of patternClips) {
      const id = clip?.id;
      if (!id) continue;
      const stream = streamMap[id];
      const streamLength = stream?.length;
      if (!streamLength) continue;

      // Skip if on a scale track scheduling for ancestors
      const trackId = arrangement.patternClips[id]?.trackId;
      if (descendantMap[trackId].some(isPatternTrackId)) continue;

      // Get the instrument (sampler or global for scales)
      const track = arrangement.tracks[trackId];
      const instrumentStateId = track.instrumentId ?? "global";

      // Add all notes to the stream
      for (let j = 0; j < streamLength; j++) {
        const { notes, startTick } = stream[j];
        const record = (result[startTick] ??= {});
        const state = (record[instrumentStateId] ??= []);
        state.push(...notes.filter((n) => "MIDI" in n));
      }
    }
    // Return the result
    return result;
  }
);
