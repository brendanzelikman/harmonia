import { getValuesByKeys, getValueByKey } from "utils/objects";
import { createSelector } from "reselect";
import {
  createDeepSelector,
  createValueSelector,
  createValueListSelector,
} from "lib/redux";
import { getPatternDuration } from "types/Pattern/PatternFunctions";
import { isPattern, PatternId } from "types/Pattern/PatternTypes";
import { isPose } from "types/Pose/PoseTypes";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import { isScaleObject } from "types/Scale/ScaleTypes";
import { TrackId } from "types/Track/TrackTypes";
import {
  ClipMap,
  ClipId,
  Clip,
  ClipState,
  PatternClipState,
  PoseClipState,
  ScaleClipState,
  PatternClipId,
  PoseClipId,
  ScaleClipId,
  PoseClip,
} from "./ClipTypes";
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
import { getScaleName } from "utils/scale";
import { mapValues } from "lodash";
import { getClipMotifId } from "./ClipFunctions";

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
export const selectPatternClipIds = patternClipSelectors.selectIds as (
  project: Project
) => PatternClipId[];
export const selectPatternClipTotal = patternClipSelectors.selectTotal;
export const selectPatternClipById = patternClipSelectors.selectById;
export const selectPatternClips = patternClipSelectors.selectAll;

export const selectPatternClipsByPatternId = (
  project: Project,
  patternId: PatternId
) => {
  const clips = selectPatternClips(project);
  return clips.filter((clip) => clip.patternId === patternId);
};

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
export const selectPoseClipIds = poseClipSelectors.selectIds as (
  project: Project
) => PoseClipId[];
export const selectPoseClipTotal = poseClipSelectors.selectTotal;
export const selectPoseClipById = poseClipSelectors.selectById as (
  project: Project,
  id: PoseClipId
) => PoseClip;
export const selectPoseClips = poseClipSelectors.selectAll;

export const selectPoseClipsByPoseId = (project: Project, poseId: string) => {
  const clips = selectPoseClips(project);
  return clips.filter((clip) => clip.poseId === poseId);
};

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
export const selectScaleClipIds = scaleClipSelectors.selectIds as (
  project: Project
) => ScaleClipId[];
export const selectScaleClipTotal = scaleClipSelectors.selectTotal;
export const selectScaleClipById = scaleClipSelectors.selectById;
export const selectScaleClips = scaleClipSelectors.selectAll;

export const selectScaleClipsByScaleId = (
  project: Project,
  scaleId: string
) => {
  const clips = selectScaleClips(project);
  return clips.filter((clip) => clip.scaleId === scaleId);
};

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

/** Select true if the user has any clips. */
export const selectHasClips = createSelector(
  [selectClipIds],
  (clipIds) => clipIds.length > 0
);

/** Select the map of clips to their motifs. */
export const selectClipMotifMap = createDeepSelector(
  [selectClipMap, selectMotifState],
  (clips, motifState) => {
    return mapValues(clips, (clip) => {
      if (clip === undefined) return;
      const motifMap = motifState[clip.type].entities;
      const motifId = getClipMotifId(clip);
      if (!motifId) return;
      return motifMap[motifId];
    });
  }
);

/** Select a clip's motif */
export const selectClipMotif = createValueSelector(selectClipMotifMap);

/** Select the durations of all clips. */
export const selectClipDurationMap = createDeepSelector(
  [selectClipMap, selectClipMotifMap],
  (clipMap, referenceMap) =>
    mapValues(clipMap, (clip) => {
      const reference = getValueByKey(referenceMap, clip?.id);
      if (!clip || !reference) return Infinity;
      if (clip.duration) return clip.duration;
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

/** Select the map of motifs to their clips. */
export const selectMotifClipMap = createDeepSelector(
  [selectClips, selectMotifState],
  (clips, motifs) => {
    return mapValues(motifs, (state) => {
      return state.ids.reduce((acc, id) => {
        return {
          ...acc,
          [id]: clips.filter((clip) => getClipMotifId(clip) === id),
        };
      }, {} as Record<string, Timed<Clip>[]>);
    });
  }
);

const selectClipId = (_: Project, id: ClipId) => id;

/** Select a specific clip from the store. */
export const selectClipById = createSelector(
  [selectClipMap, selectClipDurationMap, selectClipId],
  (clipMap, durationMap, id) => {
    const clip = clipMap[id];
    if (!clip) return undefined;
    return { ...clip, duration: durationMap[id] } as Timed<Clip>;
  }
);

/** Select a list of clips by their track IDs. */
export const selectClipsByTrackIds = (
  project: Project,
  trackIds: TrackId[]
) => {
  const clips = selectClips(project);
  return trackIds.flatMap((id) => clips.filter((clip) => clip.trackId === id));
};

/** Select the map of clips to their names. */
export const selectClipNameMap = createSelector(
  [selectClipMap, selectClipMotifMap],
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
