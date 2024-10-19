import { getValueByKey } from "utils/objects";
import { PresetPoseMap } from "assets/poses";
import { createDeepSelector } from "lib/redux";
import { Project, SafeProject } from "types/Project/ProjectTypes";
import { PoseMap, PoseId, Pose, PoseState } from "./PoseTypes";
import { defaultPoseState, poseAdapter } from "./PoseSlice";

// Create a safe selector for the pose state.
export const selectPoseState = (project: SafeProject) =>
  (project?.present?.motifs?.pose ?? defaultPoseState) as PoseState;

// Use the memoized selectors from the entity adapter.
const poseSelectors = poseAdapter.getSelectors<Project>(selectPoseState);

/** Select all pose IDs. */
export const selectPoseIds = poseSelectors.selectIds as (
  project: Project
) => PoseId[];

// Select the pose map.
export const _selectPoseMap = poseSelectors.selectEntities;
export const selectPoseMap = createDeepSelector(
  [_selectPoseMap],
  (poseMap): PoseMap => ({ ...poseMap, ...PresetPoseMap })
);

// Select all poses.
export const selectPoses = createDeepSelector(
  [selectPoseIds, selectPoseMap],
  (poseIds, poseMap) =>
    poseIds.map((id) => poseMap[id]).filter(Boolean) as Pose[]
);

/** Select a pose by ID. */
export const selectPoseById = (project: Project, id?: PoseId) => {
  const poseMap = selectPoseMap(project);
  return getValueByKey(poseMap, id);
};
