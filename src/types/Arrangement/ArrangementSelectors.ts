import {
  createArraySelector,
  createDeepSelector,
  createValueSelector,
} from "lib/redux";
import { createSelector } from "reselect";
import {
  isPortaledPatternClip,
  isPortaledPoseClip,
  PortaledPatternClipId,
  PortaledPatternClipMap,
  PortaledPoseClipMap,
} from "types/Clip/ClipTypes";
import { ClipsByTrack } from "types/Clip/ClipUtils";
import { InstrumentNotesByTicks } from "types/Instrument/InstrumentTypes";
import { applyPortalsToClips } from "types/Portal/PortalFunctions";
import { PortaledClipMap } from "types/Portal/PortalTypes";
import {
  selectClipDurationMap,
  selectClips,
  selectPatternClipMap,
  selectPoseClipMap,
} from "types/Clip/ClipSelectors";
import { selectPortals } from "types/Portal/PortalSelectors";
import { selectPatternClips } from "types/Clip/ClipSelectors";
import {
  selectTransport,
  selectTransportBPM,
} from "types/Transport/TransportSelectors";
import {
  selectScaleTrackChainIdsMap,
  selectTrackDescendantIdMap,
  selectTrackMap,
} from "types/Track/TrackSelectors";
import { selectPatternState } from "types/Pattern/PatternSelectors";
import { isPatternTrackId } from "types/Track/PatternTrack/PatternTrackTypes";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { mapValues } from "lodash";
import { ticksToSeconds } from "utils/durations";
import { selectScaleState } from "types/Scale/ScaleSelectors";
import { selectPoseState } from "types/Pose/PoseSelectors";
import { getPatternClipMidiStream } from "./ArrangementFunctions";
import { TrackArrangement } from "./ArrangementTypes";

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
    const clipsByTrack: ClipsByTrack = {};
    const patternClips: PortaledPatternClipMap = {};
    const poseClips: PortaledPoseClipMap = {};

    // Iterate over every portaled clip
    for (const clip of portaledClips) {
      const region = (clipsByTrack[clip.trackId] ??= { pattern: [], pose: [] });

      // Copy each clip to the corresponding maps
      if (isPortaledPoseClip(clip)) {
        poseClips[clip.id] = clip;
        region.pose.push(clip);
      } else if (isPortaledPatternClip(clip)) {
        patternClips[clip.id] = clip;

        // Copy pattern clips to descendants if they are on a scale track
        if (isScaleTrackId(clip.trackId)) {
          const trackIds = descendantIdsByTrack[clip.trackId];
          if (!trackIds?.length) continue;
          const ptIds = trackIds.filter(isPatternTrackId);
          for (const ptId of ptIds) {
            const newId = (clip.id + "-" + ptId) as PortaledPatternClipId;
            patternClips[newId] = { ...clip, trackId: ptId, id: newId };
          }
        }
        region.pattern.push(clip);
      }
    }

    // Insert the new clips into the arrangement
    return {
      ...baseArrangement,
      patternClips,
      poseClips,
      clipsByTrack,
      chainIdsByTrack,
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
export const selectPortaledPatternClipStream = createArraySelector(
  selectPortaledPatternClipStreamMap
);

/** Select all pattern chords to be played by each track at every tick. */
export const selectMidiChordsByTicks = createDeepSelector(
  [
    selectProcessedArrangement,
    selectPortaledPatternClipStreamMap,
    selectPortaledClipIds,
  ],
  (arrangement, streamMap, clipIds) => {
    const result = {} as InstrumentNotesByTicks;

    // Iterate through each clip stream
    for (const id of clipIds) {
      const stream = streamMap[id];
      const streamLength = stream?.length;
      if (!streamLength) continue;

      // Get the instrument of the pattern tracks
      const trackId = arrangement.patternClips[id]?.trackId;
      if (!trackId) continue;
      const track = arrangement.tracks[trackId];
      if (track?.type !== "pattern") continue;
      const instrumentStateId = track.instrumentId;

      // Add all notes to the stream
      for (let j = 0; j < streamLength; j++) {
        const { notes, startTick } = stream[j];
        const record = (result[startTick] ??= {});
        const state = (record[instrumentStateId] ??= []);
        state.push(...notes);
      }
    }
    // Return the result
    return result;
  }
);
