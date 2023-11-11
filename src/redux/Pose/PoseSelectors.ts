import { Project } from "types/Project";
import { createDeepEqualSelector } from "redux/util";
import { TrackId } from "types/Track";
import { getValueByKey, getValuesByKeys } from "utils/objects";
import { PoseId } from "types/Pose";
import { isFiniteNumber } from "types/util";

/** Select the pose map. */
export const selectPoseMap = (project: Project) =>
  project.arrangement.present.poses.byId;

/** Select all pose IDs. */
export const selectPoseIds = (project: Project) =>
  project.arrangement.present.poses.allIds;

/** Select all poses. */
export const selectPoses = createDeepEqualSelector(
  [selectPoseMap, selectPoseIds],
  getValuesByKeys
);

/** Select a pose by ID. */
export const selectPoseById = (project: Project, id: PoseId) => {
  const poseMap = selectPoseMap(project);
  return getValueByKey(poseMap, id);
};

/** Select a list of poses by ID. */
export const selectPosesByIds = (project: Project, ids: PoseId[]) => {
  const poseMap = selectPoseMap(project);
  return getValuesByKeys(poseMap, ids);
};

/** Select a list of poses by track ID. */
export const selectPosesByTrackIds = (
  project: Project,
  trackIds: TrackId[]
) => {
  const poses = selectPoses(project);
  return poses.filter((t) => trackIds.includes(t.trackId));
};

/** Select the duration of a pose. */
export const selectPoseDuration = (project: Project, id: PoseId) => {
  const pose = selectPoseById(project, id);
  if (!pose) return 0;
  const { duration } = pose;
  if (isFiniteNumber(duration)) return duration;
  return Infinity;
};

/** Select the duration of a pose. */
export const selectPoseDurations = (project: Project, ids: PoseId[]) => {
  return ids.map((id) => selectPoseDuration(project, id));
};
