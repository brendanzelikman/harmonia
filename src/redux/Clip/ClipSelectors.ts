import { Project } from "types/Project";
import {
  getValuesByKeys,
  getValueByKey,
  createMapWithFn,
  createMap,
  createMapByField,
  getArrayByKey,
} from "utils/objects";
import {
  getClipDuration,
  ClipId,
  isPatternClip,
  isPoseClip,
  Clip,
} from "types/Clip";
import { TrackId } from "types/Track";
import { doesMediaElementOverlapRange } from "types/Media";
import { selectPatternMap } from "redux/Pattern/PatternSelectors";
import { selectPoseMap } from "redux/Pose/PoseSelectors";
import { convertTicksToSeconds } from "types/Transport";
import { selectTransport } from "redux/Transport/TransportSelectors";
import { createSelector } from "reselect";
import {
  createArraySelector,
  createDeepEqualSelector,
  createValueListSelector,
  createValueSelector,
} from "redux/util";
import * as _ from "types/Track";

/** Select the clip map from the store. */
export const selectClipMap = (project: Project) =>
  project.arrangement.present.clips.byId;

/** Select all clip IDs from the store. */
export const selectClipIds = (project: Project) =>
  project.arrangement.present.clips.allIds as ClipId[];

/** Select all clips from the store. */
export const selectClips = createDeepEqualSelector(
  [selectClipMap, selectClipIds],
  getValuesByKeys
);

/** Select a specific clip from the store. */
export const selectClipById = createValueSelector(selectClipMap);

/** Select a list of clips by their IDs. */
export const selectClipsByIds = createValueListSelector(selectClipMap);

/** Select a list of clips by their track IDs. */
export const selectClipsByTrackIds = (
  project: Project,
  trackIds: TrackId[]
) => {
  const clips = selectClips(project);
  return clips.filter((clip) => trackIds.includes(clip.trackId));
};

/** Select the map of clips to their references. */
export const selectClipReferenceMap = createDeepEqualSelector(
  [selectClipMap, selectPatternMap, selectPoseMap],
  (clips, patterns, poses) => {
    return createMapWithFn(clips, (clip) => {
      if (isPatternClip(clip)) {
        return getValueByKey(patterns, clip.patternId);
      }
      if (isPoseClip(clip)) {
        return getValueByKey(poses, clip.poseId);
      }
      return undefined;
    });
  }
);

/** Select the map of clips to their names. */
export const selectClipNameMap = createSelector(
  [selectClipMap, selectClipReferenceMap],
  (clipMap, referenceMap) =>
    createMapWithFn(clipMap, (clip) => {
      const reference = getValueByKey(referenceMap, clip.id);
      return reference?.name;
    })
);

/** Select the durations of all clips. */
export const selectClipDurationMap = createSelector(
  [selectClipMap, selectClipReferenceMap],
  (clipMap, referenceMap) =>
    createMapWithFn(clipMap, (clip) => {
      const reference = getValueByKey(referenceMap, clip.id);
      return getClipDuration(clip, reference?.stream);
    })
);

/** Select the name of a clip by using the name of its reference. */
export const selectClipName = createValueSelector(selectClipNameMap, "Clip");

/** Select the duration of a clip. */
export const selectClipDuration = createValueSelector(selectClipDurationMap, 0);

/** Select the durations of a list of clips. */
export const selectClipDurations = createValueListSelector(
  selectClipDurationMap
);

/** Select the start time of a clip in seconds. */
export const selectClipStartTime = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  const transport = selectTransport(project);
  if (!clip) return undefined;
  return convertTicksToSeconds(transport, clip.tick);
};

// ------------------------------------------------------------
// Pattern Clips
// ------------------------------------------------------------

/** Select all pattern clips. */
export const selectPatternClips = createDeepEqualSelector(
  [selectClips],
  (clips) => clips.filter(isPatternClip)
);

/** Select the map of pattern clips. */
export const selectPatternClipMap = createDeepEqualSelector(
  [selectPatternClips],
  createMap
);

/** Select a pattern clip by ID. */
export const selectPatternClipById = createValueSelector(selectPatternClipMap);

/** Select the map of pattern clips to patterns. */
export const selectPatternClipPatternMap = createDeepEqualSelector(
  [selectPatternClipMap, selectPatternMap],
  (patternClipMap, patternMap) =>
    createMapWithFn(patternClipMap, (patternClip) =>
      getValueByKey(patternMap, patternClip?.patternId)
    )
);

/** Select the pattern of a pattern clip. */
export const selectPatternClipPattern = createValueSelector(
  selectPatternClipPatternMap
);

// ------------------------------------------------------------
// Pose Clips
// ------------------------------------------------------------

/** Select all pose clips. */
export const selectPoseClips = createDeepEqualSelector([selectClips], (clips) =>
  clips.filter(isPoseClip)
);

/** Select the map of pose clips. */
export const selectPoseClipMap = createDeepEqualSelector(
  [selectPoseClips],
  createMap
);

/** Select a pose clip by ID. */
export const selectPoseClipById = createValueSelector(selectPoseClipMap);

/** Select the map of pose clips to poses. */
export const selectPoseClipPoseMap = createDeepEqualSelector(
  [selectPoseClipMap, selectPoseMap],
  (poseClipMap, poseMap) =>
    createMapWithFn(poseClipMap, (poseClip) =>
      getValueByKey(poseMap, poseClip?.poseId)
    )
);

/** Select the pose of a pose clip. */
export const selectPoseClipPose = createValueSelector(selectPoseClipPoseMap);

// ------------------------------------------------------------
// Track Clip Selectors
// ------------------------------------------------------------

/** Select the track clip map. */
export const selectTrackClipMap = createDeepEqualSelector(
  [selectClips],
  (clips): Record<TrackId, Clip[]> => createMapByField(clips, "trackId")
);

/** Select the track pattern clip map. */
export const selectTrackPatternClipMap = createDeepEqualSelector(
  [selectTrackClipMap],
  (clipMap) => createMapWithFn(clipMap, (clips) => clips.filter(isPatternClip))
);

/** Select the track pose clip map. */
export const selectTrackPoseClipMap = createDeepEqualSelector(
  [selectTrackClipMap],
  (clipMap) => createMapWithFn(clipMap, (clips) => clips.filter(isPoseClip))
);

/** Select the clips of a track by ID. */
export const selectTrackClips = (project: Project, id: _.TrackId) => {
  const clipMap = selectTrackClipMap(project);
  return getArrayByKey(clipMap, id);
};

/** Select the pattern clips of a track by ID. */
export const selectTrackPatternClips = (project: Project, id: _.TrackId) => {
  const patternClipMap = selectTrackPatternClipMap(project);
  return getArrayByKey(patternClipMap, id);
};

/** Select the pose clips of a track by ID. */
export const selectTrackPoseClips = (project: Project, id: _.TrackId) => {
  const poseClipMap = selectTrackPoseClipMap(project);
  return getArrayByKey(poseClipMap, id);
};

/** Select the map of pattern clips to overlapping pose clips. */
export const selectPatternClipPoseClipMap = createDeepEqualSelector(
  [selectPatternClipMap, selectTrackPoseClipMap, selectClipDurationMap],
  (patternClipMap, trackPoseClipMap, durationMap) =>
    createMapWithFn(patternClipMap, (patternClip) => {
      const duration = durationMap[patternClip.id];
      const trackId = patternClip.trackId;
      const poseClips = trackPoseClipMap[trackId];
      return poseClips.filter((clip) => {
        return doesMediaElementOverlapRange(patternClip, duration, [
          clip.tick,
          clip.tick + durationMap[clip.id],
        ]);
      });
    })
);

/** Select a pattern clip's overlapping pose clips */
export const selectPatternClipPoseClips = createArraySelector(
  selectPatternClipPoseClipMap
);
