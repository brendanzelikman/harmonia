import { getValuesByKeys, getValueByKey } from "utils/objects";
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
import { isScaleObject } from "types/Scale/ScaleTypes";
import { TrackId } from "types/Track/TrackTypes";
import { convertTicksToSeconds } from "types/Transport/TransportFunctions";
import {
  ClipMap,
  ClipId,
  Clip,
  ClipState,
  PatternClipState,
  PoseClipState,
  ScaleClipState,
} from "./ClipTypes";
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
import { Timed } from "types/units";
import { selectMotifState } from "types/Motif/MotifSelectors";
import { getScaleName } from "utils/key";
import { mapValues } from "lodash";

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

/** Select the map of clips to their references. */
export const selectClipReferenceMap = createDeepSelector(
  [selectClipMap, selectMotifState],
  (clips, motifState) => {
    return mapValues(clips, (clip) => {
      if (clip === undefined) return;
      const refField = `${clip.type}Id` as keyof typeof clip;
      const refId = clip[refField];
      const motifMap = motifState[clip.type].entities;
      return motifMap[refId as string];
    });
  }
);

/** Select the durations of all clips. */
export const selectClipDurationMap = createDeepSelector(
  [selectClipMap, selectClipReferenceMap],
  (clipMap, referenceMap) =>
    mapValues(clipMap, (clip) => {
      const reference = getValueByKey(referenceMap, clip?.id);
      if (!clip || !reference) return Infinity;
      if (clip.duration !== undefined) return clip.duration;
      if (isPose(reference)) return getPoseDuration(reference);
      if (isPattern(reference)) return getPatternDuration(reference);
      return Infinity;
    })
);

/** Select all clips from the store. */
export const selectClips = createDeepSelector(
  [selectClipMap, selectClipIds, selectClipDurationMap],
  (clipMap, clipIds, durationMap) =>
    getValuesByKeys(clipMap, clipIds).map((clip) => ({
      ...clip,
      duration: durationMap[clip.id] ?? clip.duration,
    })) as Timed<Clip>[]
);

/** Select a specific clip from the store. */
export const selectClipById = (project: Project, id?: ClipId) => {
  if (!id) return undefined;
  const clipMap = selectClipMap(project);
  const durationMap = selectClipDurationMap(project);
  return { ...clipMap[id], duration: durationMap[id] } as Timed<Clip>;
};

/** Select a list of clips by their track IDs. */
export const selectClipsByTrackIds = (
  project: Project,
  trackIds: TrackId[]
) => {
  const clips = selectClips(project);
  return clips.filter((clip) => trackIds.includes(clip.trackId));
};

/** Select the map of clips to their names. */
export const selectClipNameMap = createSelector(
  [selectClipMap, selectClipReferenceMap],
  (clipMap, referenceMap) =>
    mapValues(clipMap, (clip) => {
      const reference = getValueByKey(referenceMap, clip?.id);
      if (isScaleObject(reference)) {
        return getScaleName(reference);
      } else {
        return reference?.name;
      }
    })
);

/** Select the name of a clip by using the name of its reference. */
export const selectClipName = createValueSelector(selectClipNameMap, "Clip");

/** Select the durations of a list of clips. */
export const selectClipDurations = createValueListSelector(
  selectClipDurationMap
);

/** Select the duration of a clip. */
export const selectClipDuration = createValueSelector(selectClipDurationMap, 0);

/** Select a clip with a definite duration by its ID. */
export const selectTimedClipById = (project: Project, id: ClipId) => {
  const clip = selectClipById(project, id);
  if (!clip) return undefined;
  const duration = selectClipDuration(project, id) ?? Infinity;
  return { ...clip, duration } as Timed<Clip>;
};

/** Select the start time of a clip in seconds. */
export const selectClipStartTime = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  const transport = selectTransport(project);
  if (!clip) return undefined;
  return convertTicksToSeconds(transport, clip.tick);
};
