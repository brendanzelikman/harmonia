import {
  TranspositionId,
  TranspositionNoId,
  getOffsettedTransposition,
  initializeTransposition,
} from "types/Transposition";
import { Thunk } from "types/Project";
import { TranspositionVector } from "types/Transposition";
import {
  addMediaToHierarchy,
  removeMediaFromHierarchy,
  updateMediaInHierarchy,
} from "redux/TrackHierarchy";
import { selectSelectedPoses } from "redux/selectors";
import {
  _updateTranspositions,
  addTranspositions,
  removeTranspositions,
} from "./TranspositionSlice";
import { RemoveMediaPayload, UpdateMediaPayload } from "types/Media";

/** Create a list of transpositions and add them to the slice and hierarchy. */
export const createTranspositions =
  (initialPoses: Partial<TranspositionNoId>[]): Thunk<TranspositionId[]> =>
  (dispatch) => {
    // Create the transpositions
    const poses = initialPoses.map(initializeTransposition);
    const payload = { poses };

    // Add the transpositions to the slice and hierarchy.
    dispatch(addTranspositions(payload));
    dispatch(addMediaToHierarchy(payload));

    // Return the newly created transposition IDs
    return poses.map((t) => t.id);
  };

/** Update a list of transpositions. */
export const updateTranspositions =
  (media: UpdateMediaPayload): Thunk =>
  (dispatch) => {
    dispatch(_updateTranspositions(media));
    dispatch(updateMediaInHierarchy(media));
  };

/** Remove a list of transpositions from the store. */
export const deleteTranspositions =
  (mediaIds: RemoveMediaPayload): Thunk =>
  (dispatch) => {
    dispatch(removeTranspositions(mediaIds));
    dispatch(removeMediaFromHierarchy(mediaIds));
  };

/** Update the selected transpositions with the given vector. */
export const updateSelectedTranspositions =
  (vector: TranspositionVector): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedPoses = selectSelectedPoses(project);
    if (!selectedPoses.length) return;
    const poses = selectedPoses.map((t) => {
      return { ...t, vector: { ...t.vector, ...vector } };
    });
    dispatch(_updateTranspositions({ poses }));
  };

/** Offset the selected transpositions by the given vector. */
export const offsetSelectedTranspositions =
  (vector: TranspositionVector): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const selectedPoses = selectSelectedPoses(project);
    if (!selectedPoses.length) return;

    // Offset each transposition
    const poses = selectedPoses.map((t) =>
      getOffsettedTransposition(t, vector)
    );

    // Update the transpositions
    dispatch(_updateTranspositions({ poses }));
  };

/** Reset the vector of the selected transpositions. */
export const resetSelectedTranspositions =
  (): Thunk => (dispatch, getProject) => {
    const project = getProject();
    const selectedPoses = selectSelectedPoses(project);
    if (!selectedPoses.length) return;
    const poses = selectedPoses.map((t) => ({
      ...t,
      vector: {} as TranspositionVector,
    }));
    dispatch(_updateTranspositions({ poses }));
  };
