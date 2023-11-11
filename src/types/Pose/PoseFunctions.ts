import { Tick } from "types/units";
import {
  Pose,
  PoseVector,
  PoseVectorId,
  PoseMap,
  PoseUpdate,
} from "./PoseTypes";
import { TrackId } from "types/Track";
import { ScaleTrackMap } from "types/ScaleTrack";
import { getKeys } from "utils/objects";
import { ScaleVector } from "types/Scale";
import { isNumber } from "lodash";

// ------------------------------------------------------------
// Pose Serializers
// ------------------------------------------------------------

/** Get a `Pose` as a string. */
export const getPoseAsString = (pose: Pose) => {
  const { id, tick, trackId, vector } = pose;
  return `${id},${tick},${trackId},${getPoseVectorAsString(vector)}`;
};

/** Get a `PoseUpdate` as a string. */
export const getPoseUpdateAsString = (update: PoseUpdate) => {
  return JSON.stringify(update);
};

/** Get a `PoseVector` as a string. */
export const getPoseVectorAsString = (
  vector?: PoseVector,
  orderedTrackIds?: TrackId[]
) => {
  if (!vector) return "";
  const vectorKeys = Object.keys(vector);
  const nonScalarKeys = vectorKeys.filter(
    (k) => k !== "chromatic" && k !== "chordal"
  );
  const scalars = nonScalarKeys.sort((a, b) => {
    const aIndex = orderedTrackIds?.indexOf(a) || 0;
    const bIndex = orderedTrackIds?.indexOf(b) || 0;
    return aIndex - bIndex;
  });
  const N = vector.chromatic || 0;
  const Ts = scalars.map((k) => vector[k] || 0);
  const t = vector.chordal || 0;
  if (!Ts.length) return `N${N} • t${t}`;
  return `N${N} • T(${Ts.join(", ")}) • t${t}`;
};

// ------------------------------------------------------------
// Property Getters
// ------------------------------------------------------------

/** Get the chromatic offset from the vector. */
export const getChromaticOffset = (vector?: PoseVector) => {
  if (!vector) return 0;
  return vector.chromatic || 0;
};

/** Get the chordal offset from the vector. */
export const getChordalOffset = (vector?: PoseVector) => {
  if (!vector) return 0;
  return vector.chordal || 0;
};

/** Get the pose offset by ID from the vector. */
export const getPoseOffsetById = (vector?: PoseVector, id?: PoseVectorId) => {
  if (!vector || !id) return 0;
  return vector[id] || 0;
};

/** Get the pose offsets by ID from the vector. */
export const getPoseOffsetsById = (
  vector?: PoseVector,
  ids?: PoseVectorId[]
) => {
  if (!vector || !ids) return [];
  return ids.map((id) => vector[id] || 0);
};

/** Get the scale vector of a pose. */
export const getPoseScaleVector = (
  pose?: Pose,
  scaleTracks?: ScaleTrackMap
) => {
  if (!pose || !scaleTracks) return {};
  const keys = getKeys(pose.vector);
  return keys.reduce((acc, cur) => {
    const track = scaleTracks[cur];
    if (track) acc[track.scaleId] = pose.vector[cur];
    return acc;
  }, {} as ScaleVector);
};

// ------------------------------------------------------------
// Pose Operations
// ------------------------------------------------------------

/** Get the offseted pose by adding the given vectors to the given pose. */
export const getOffsettedPose = (
  pose: Pose,
  ...vectors: PoseVector[]
): Pose => {
  const allVectors = [pose.vector, ...vectors];

  // Add the vectors together
  const newVector = allVectors.reduce((acc, cur) => {
    const keys = Object.keys(cur);
    for (const key of keys) {
      acc[key] = (acc[key] || 0) + cur[key];
    }
    return acc;
  }, {} as PoseVector);

  // Return the pose with the new vector
  return { ...pose, vector: newVector };
};

/** Get the current pose occurring at or before the given tick. */
export const getCurrentPose = (poses: Pose[], tick: Tick = 0, sort = true) => {
  if (!poses.length) return undefined;

  // Get the matches
  const matches = poses.filter((t) => {
    const startsBefore = t.tick <= tick;
    const endsAfter = isNumber(t.duration) ? t.tick + t.duration > tick : true;
    return startsBefore && endsAfter;
  });

  // If no matching poses, return undefined
  if (!matches.length) return undefined;

  // If sort is false, return the first matching pose
  if (!sort) return matches[0];

  // Otherwise, sort the matching poses by tick and return the first one
  return matches.sort((a, b) => b.tick - a.tick)[0];
};

/** Creates a PoseMap from an array of Poses. */
export const createPoseMap = (poses: Pose[]) => {
  return poses.reduce((acc, pose) => {
    acc[pose.id] = pose;
    return acc;
  }, {} as PoseMap);
};
