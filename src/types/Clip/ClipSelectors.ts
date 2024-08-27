import { getValuesByKeys, getValueByKey, createMapWithFn } from "utils/objects";
import { createSelector } from "reselect";
import {
  createDeepSelector,
  createValueSelector,
  createValueListSelector,
} from "lib/redux";
import { getPatternDuration } from "types/Pattern/PatternFunctions";
import { isPattern } from "types/Pattern/PatternTypes";
import { isPose } from "types/Pose/PoseTypes";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import { getScaleName } from "types/Scale/ScaleFunctions";
import { isScaleObject } from "types/Scale/ScaleTypes";
import { TrackId } from "types/Track/TrackTypes";
import { convertTicksToSeconds } from "types/Transport/TransportFunctions";
import {
  isIPatternClip,
  ClipMap,
  ClipId,
  isIPoseClip,
  isIScaleClip,
  Clip,
  ClipState,
  PatternClipState,
  PoseClipState,
  ScaleClipState,
} from "./ClipTypes";
import { selectPatternMap } from "types/Pattern/PatternSelectors";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import { selectScaleMap } from "types/Scale/ScaleSelectors";
import { selectTransport } from "types/Transport/TransportSelectors";
import { getPoseDuration } from "types/Pose/PoseFunctions";
import {
  defaultPatternClipState,
  defaultPoseClipState,
  defaultScaleClipState,
  patternClipAdapter,
  poseClipAdapter,
  scaleClipAdapter,
} from "./ClipSlice";

// ------------------------------------------------------------
// Pattern Clip Selectors
// ------------------------------------------------------------

// Create a safe selector for the pattern clip state.
const selectPatternClipState = (project: SafeProject) =>
  (project?.present?.clips?.pattern ??
    defaultPatternClipState) as PatternClipState;

// Use the memoized selectors from the entity adapter.
const patternClipSelectors = patternClipAdapter.getSelectors<Project>(
  selectPatternClipState
);

export const selectPatternClipMap = patternClipSelectors.selectEntities;
export const selectPatternClipIds = patternClipSelectors.selectIds;
export const selectPatternClipTotal = patternClipSelectors.selectTotal;
export const selectPatternClipById = patternClipSelectors.selectById;
export const selectPatternClips = patternClipSelectors.selectAll;

// ------------------------------------------------------------
// Pose Clip Selectors
// ------------------------------------------------------------

// Create a safe selector for the pose clip state.
const selectPoseClipState = (project: SafeProject) =>
  (project?.present?.clips?.pose ?? defaultPoseClipState) as PoseClipState;

// Use the memoized selectors from the entity adapter.
const poseClipSelectors =
  poseClipAdapter.getSelectors<Project>(selectPoseClipState);

export const selectPoseClipMap = poseClipSelectors.selectEntities;
export const selectPoseClipIds = poseClipSelectors.selectIds;
export const selectPoseClipTotal = poseClipSelectors.selectTotal;
export const selectPoseClipById = poseClipSelectors.selectById;
export const selectPoseClips = poseClipSelectors.selectAll;

// ------------------------------------------------------------
// Scale Clip Selectors
// ------------------------------------------------------------

// Create a safe selector for the scale clip state.
const selectScaleClipState = (project: SafeProject) =>
  (project?.present?.clips?.scale ?? defaultScaleClipState) as ScaleClipState;

// Use the memoized selectors from the entity adapter.
const scaleClipSelectors =
  scaleClipAdapter.getSelectors<Project>(selectScaleClipState);

export const selectScaleClipMap = scaleClipSelectors.selectEntities;
export const selectScaleClipIds = scaleClipSelectors.selectIds;
export const selectScaleClipTotal = scaleClipSelectors.selectTotal;
export const selectScaleClipById = scaleClipSelectors.selectById;
export const selectScaleClips = scaleClipSelectors.selectAll;

// ------------------------------------------------------------
// Combined Clip Selectors
// ------------------------------------------------------------

export const defaultClipState: ClipState = {
  pattern: defaultPatternClipState,
  pose: defaultPoseClipState,
  scale: defaultScaleClipState,
};

// Create a safe selector for the clip state.
export const selectClipState = (project: SafeProject) =>
  (project?.present?.clips ?? defaultClipState) as ClipState;

/** Select the clip map from the store. */
export const selectClipMap = createDeepSelector(
  [selectPatternClipMap, selectPoseClipMap, selectScaleClipMap],
  (pattern, pose, scale) =>
    ({
      ...pattern,
      ...pose,
      ...scale,
    } as ClipMap)
);

/** Select all clip IDs from the store. */
export const selectClipIds = createDeepSelector(
  [selectPatternClipIds, selectPoseClipIds, selectScaleClipIds],
  (patternIds, poseIds, scaleIds) =>
    [...patternIds, ...poseIds, ...scaleIds] as ClipId[]
);

/** Select all clips from the store. */
export const selectClips = createDeepSelector(
  [selectClipMap, selectClipIds],
  (clipMap, clipIds) => getValuesByKeys(clipMap, clipIds) as Clip[]
);

/** Select a specific clip from the store. */
export const selectClipById = createValueSelector(selectClipMap);

/** Select a list of clips by their track IDs. */
export const selectClipsByTrackIds = (
  project: Project,
  trackIds: TrackId[]
) => {
  const clips = selectClips(project);
  return clips.filter((clip) => trackIds.includes(clip.trackId));
};

/** Select the map of clips to their references. */
export const selectClipReferenceMap = createDeepSelector(
  [selectClipMap, selectPatternMap, selectPoseMap, selectScaleMap],
  (clips, patterns, poses, scales) => {
    return createMapWithFn(clips, (clip) => {
      if (isIPatternClip(clip)) {
        return getValueByKey(patterns, clip.patternId);
      }
      if (isIPoseClip(clip)) {
        return getValueByKey(poses, clip.poseId);
      }
      if (isIScaleClip(clip)) {
        return getValueByKey(scales, clip.scaleId);
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
      if (isScaleObject(reference)) {
        return getScaleName(reference);
      } else {
        return reference?.name;
      }
    })
);

/** Select the name of a clip by using the name of its reference. */
export const selectClipName = createValueSelector(selectClipNameMap, "Clip");

/** Select the durations of all clips. */
export const selectClipDurationMap = createDeepSelector(
  [selectClipMap, selectClipReferenceMap],
  (clipMap, referenceMap) =>
    createMapWithFn(clipMap, (clip) => {
      const reference = getValueByKey(referenceMap, clip.id);
      if (!reference) return 0;
      if (isPose(reference)) {
        return clip.duration !== undefined
          ? clip.duration
          : getPoseDuration(reference);
      }
      if (isPattern(reference)) {
        return clip.duration !== undefined
          ? clip.duration
          : getPatternDuration(reference);
      }
      return clip.duration ?? Infinity;
    })
);

/** Select the durations of a list of clips. */
export const selectClipDurations = createValueListSelector(
  selectClipDurationMap
);

/** Select the duration of a clip. */
export const selectClipDuration = createValueSelector(selectClipDurationMap, 0);

/** Select the start time of a clip in seconds. */
export const selectClipStartTime = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  const transport = selectTransport(project);
  if (!clip) return undefined;
  return convertTicksToSeconds(transport, clip.tick);
};
