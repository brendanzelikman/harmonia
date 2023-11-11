import { PoseId, PoseNoId, getOffsettedPose, initializePose } from "types/Pose";
import { Thunk } from "types/Project";
import { PoseVector } from "types/Pose";
import {
  addMediaToHierarchy,
  removeMediaFromHierarchy,
  updateMediaInHierarchy,
} from "redux/TrackHierarchy";
import { selectSelectedPoses } from "redux/selectors";
import { _updatePoses, addPoses, removePoses } from "./PoseSlice";
import { RemoveMediaPayload, UpdateMediaPayload } from "types/Media";

/** Create a list of poses and add them to the slice and hierarchy. */
export const createPoses =
  (initialPoses: Partial<PoseNoId>[]): Thunk<PoseId[]> =>
  (dispatch) => {
    // Create the poses
    const poses = initialPoses.map(initializePose);
    const payload = { poses };

    // Add the poses to the slice and hierarchy.
    dispatch(addPoses(payload));
    dispatch(addMediaToHierarchy(payload));

    // Return the newly created pose IDs
    return poses.map((t) => t.id);
  };

/** Update a list of poses. */
export const updatePoses =
  (media: UpdateMediaPayload): Thunk =>
  (dispatch) => {
    dispatch(_updatePoses(media));
    dispatch(updateMediaInHierarchy(media));
  };

/** Remove a list of poses from the store. */
export const deletePoses =
  (mediaIds: RemoveMediaPayload): Thunk =>
  (dispatch) => {
    dispatch(removePoses(mediaIds));
    dispatch(removeMediaFromHierarchy(mediaIds));
  };

/** Update the selected poses with the given vector. */
export const updateSelectedPoses =
  (vector: PoseVector): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedPoses = selectSelectedPoses(project);
    if (!selectedPoses.length) return;
    const poses = selectedPoses.map((t) => {
      return { ...t, vector: { ...t.vector, ...vector } };
    });
    dispatch(_updatePoses({ poses }));
  };

/** Offset the selected poses by the given vector. */
export const offsetSelectedPoses =
  (vector: PoseVector): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedPoses = selectSelectedPoses(project);
    if (!selectedPoses.length) return;

    // Offset each pose
    const poses = selectedPoses.map((t) => getOffsettedPose(t, vector));

    // Update the poses
    dispatch(_updatePoses({ poses }));
  };

/** Reset the vector of the selected poses. */
export const resetSelectedPoses = (): Thunk => (dispatch, getProject) => {
  const project = getProject();
  const selectedPoses = selectSelectedPoses(project);
  if (!selectedPoses.length) return;
  const poses = selectedPoses.map((t) => ({
    ...t,
    vector: {} as PoseVector,
  }));
  dispatch(_updatePoses({ poses }));
};
