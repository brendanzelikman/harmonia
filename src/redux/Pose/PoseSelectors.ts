import { Project } from "types/Project";
import { createDeepEqualSelector } from "redux/util";
import { getValueByKey, getValuesByKeys } from "utils/objects";
import { PoseId, PoseMap } from "types/Pose";
import { createSelector } from "reselect";
import { PresetPoseMap } from "presets/poses";

/** Select the pose past length. */
export const selectPosePastLength = (project: Project) =>
  project.poses.past.length;

/** Select the pose future length. */
export const selectPoseFutureLength = (project: Project) =>
  project.poses.future.length;

/** Select the pose map. */
export const _selectPoseMap = (project: Project) => project.poses.present.byId;

/** Select the pattern map (integrated with preset patterns). */
export const selectPoseMap = createSelector(
  [_selectPoseMap],
  (poseMap): PoseMap => ({ ...PresetPoseMap, ...poseMap })
);

/** Select all pose IDs. */
export const selectPoseIds = (project: Project) => project.poses.present.allIds;

/** Select all poses. */
export const selectPoses = createDeepEqualSelector(
  [selectPoseMap, selectPoseIds],
  getValuesByKeys
);

/** Select all non-preset poses. */
export const selectCustomPoses = createDeepEqualSelector(
  [selectPoses],
  (poses) => poses.filter(({ id }) => id && PresetPoseMap[id] === undefined)
);

/** Select a pose by ID. */
export const selectPoseById = (project: Project, id?: PoseId) => {
  const poseMap = selectPoseMap(project);
  return getValueByKey(poseMap, id);
};

/** Select a list of poses by ID. */
export const selectPosesByIds = (project: Project, ids: PoseId[]) => {
  const poseMap = selectPoseMap(project);
  return getValuesByKeys(poseMap, ids);
};
