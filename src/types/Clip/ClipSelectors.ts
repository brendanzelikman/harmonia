import { createSelector } from "reselect";
import { createDeepSelector, createValueSelector } from "types/redux";
import { getPatternDuration } from "types/Pattern/PatternFunctions";
import { isPattern, Pattern, PatternId } from "types/Pattern/PatternTypes";
import { isPose } from "types/Pose/PoseTypes";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import { TrackId } from "types/Track/TrackTypes";
import {
  ClipMap,
  ClipId,
  Clip,
  PatternClipState,
  PoseClipState,
  PatternClipId,
  PoseClipId,
  PoseClip,
  PatternClip,
  isPatternClip,
  isPoseClip,
} from "./ClipTypes";
import { getPoseDuration } from "types/Pose/PoseFunctions";
import {
  defaultPatternClipState,
  defaultPoseClipState,
  patternClipAdapter,
  poseClipAdapter,
} from "./ClipSlice";
import { Timed } from "types/units";
import { mapValues, pick, uniqBy, values } from "lodash";
import { getClipMotifId } from "./ClipTypes";
import {
  selectPatternById,
  selectPatternIds,
  selectPatternMap,
  selectPatternState,
} from "types/Pattern/PatternSelectors";
import { getPatternClipHeaderColor } from "./PatternClip/PatternClipFunctions";
import {
  selectPoseIds,
  selectPoseMap,
  selectPoseState,
} from "types/Pose/PoseSelectors";
import { isFinite } from "utils/math";

// ------------------------------------------------------------
// Pattern Clip Selectors
// ------------------------------------------------------------

// Create a safe selector for the pattern clip state.
const selectPatternClipState = (project: SafeProject) =>
  (project?.present?.patternClips ??
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

// ------------------------------------------------------------
// Pose Clip Selectors
// ------------------------------------------------------------

// Create a safe selector for the pose clip state.
const selectPoseClipState = (project: SafeProject) =>
  (project?.present?.poseClips ?? defaultPoseClipState) as PoseClipState;

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

// ------------------------------------------------------------
// Combined Clip Selectors
// ------------------------------------------------------------

/** Select the clip map from the store. */
export const selectClipMap = createDeepSelector(
  [selectPatternClipMap, selectPoseClipMap],
  (pattern, pose) =>
    ({
      ...pattern,
      ...pose,
    } as ClipMap)
);

/** Select all clip IDs from the store. */
export const selectClipIds = createDeepSelector(
  [selectPatternClipIds, selectPoseClipIds],
  (patternIds, poseIds) => [...patternIds, ...poseIds] as ClipId[]
);

/** Select true if the user has any clips. */
export const selectHasClips = createSelector(
  [selectClipIds],
  (clipIds) => clipIds.length > 0
);

/** Select the map of clips to their motifs. */
export const selectClipMotifMap = createDeepSelector(
  [selectClipMap, selectPatternMap, selectPoseMap],
  (clips, patterns, poses) => {
    return mapValues(clips, (clip) => {
      if (!clip) return undefined;
      if (isPatternClip(clip)) return patterns[clip.patternId];
      if (isPoseClip(clip)) return poses[clip.poseId];
      return undefined;
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
      const reference = referenceMap[clip.id];
      if (!reference) return 0;
      if (clip.duration && isFinite(clip.duration)) return clip.duration;
      if (isPose(reference)) return getPoseDuration(reference);
      if (isPattern(reference)) return getPatternDuration(reference);
      return Infinity;
    })
);

/** Select all clips from the store. */
export const selectClips = createDeepSelector(
  [selectClipMap, selectClipIds, selectClipDurationMap],
  (clipMap, clipIds, durationMap) =>
    values(pick(clipMap, clipIds)).map((clip) => ({
      ...clip,
      duration: durationMap[clip.id] ?? clip.duration,
    }))
);

/** Select the map of motifs to their clips. */
export const selectMotifClipMap = createDeepSelector(
  [selectClips, selectPatternState, selectPoseState],
  (clips, patternState, poseState) => {
    const motifs = { ...patternState.entities, ...poseState.entities };
    return Object.keys(motifs).reduce((acc, id) => {
      return {
        ...acc,
        [id]: clips.filter((clip) => getClipMotifId(clip) === id),
      };
    }, {} as Record<string, Timed<Clip>[]>);
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

/** Select a list of pattern clips from the IDs provided. */
export const selectPatternClipsByIds = (
  project: Project,
  ids: PatternClipId[]
) => {
  return ids
    .map((id) => selectPatternClipById(project, id))
    .filter(Boolean) as PatternClip[];
};

/** Select the map of clips to their names. */
export const selectClipNameMap = createSelector(
  [
    selectClipMap,
    selectPatternMap,
    selectPoseMap,
    selectPatternIds,
    selectPoseIds,
  ],
  (clipMap, patternMap, poseMap, patternIds, poseIds) =>
    mapValues(clipMap, (clip) => {
      if (!clip) return undefined;
      if (clip.name) return clip.name;
      if (isPatternClip(clip))
        return (
          patternMap[clip.patternId]?.name ??
          `Pattern ${patternIds.indexOf(clip.patternId) + 1}`
        );
      if (isPoseClip(clip))
        return (
          poseMap[clip.poseId]?.name ??
          `Pose ${poseIds.indexOf(clip.poseId) + 1}`
        );
      return undefined;
    })
);

/** Select the name of a clip by using the name of its reference. */
export const selectClipName = createValueSelector(selectClipNameMap, "Clip");

/** Get the color of a clip header. */
export const selectClipHeaderColor = (project: Project, id: PatternClipId) => {
  const clip = selectPatternClipById(project, id);
  return getPatternClipHeaderColor(clip);
};

/** Select the duration of a clip. */
export const selectClipDuration = createValueSelector(selectClipDurationMap, 0);

/** Select a clip with a definite duration by its ID. */
export const selectTimedClipById = (project: Project, id: ClipId) => {
  const clip = selectClipById(project, id);
  if (!clip) return undefined;
  const duration = selectClipDuration(project, id) ?? Infinity;
  return { ...clip, duration } as Timed<Clip>;
};
