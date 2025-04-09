import {
  isPortaledPatternClipId,
  PortaledPatternClipId,
} from "types/Clip/ClipTypes";
import {
  defaultSearchOptions,
  StreamQueryOptions,
} from "./ArrangementSearchFunctions";
import { Thunk } from "types/Project/ProjectTypes";
import {
  selectPortaledClip,
  selectPortaledClipIds,
} from "./ArrangementSelectors";
import { selectPortaledPatternClipTransformation } from "./ArrangementClipSelectors";
import { createUndoType, Payload, unpackUndoType } from "utils/redux";
import { selectPoseClips } from "types/Clip/ClipSelectors";
import { selectSelectedClipIds } from "types/Timeline/TimelineSelectors";
import { updatePose } from "types/Pose/PoseSlice";
import { sumVectors } from "utils/vector";
import { selectPoseById, selectPoses } from "types/Pose/PoseSelectors";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";
import { PoseVectorId } from "types/Pose/PoseTypes";
import { createCourtesyPoseClip } from "types/Track/PatternTrack/PatternTrackThunks";

export const walkPatternClip =
  (
    payload: Payload<{
      id: PortaledPatternClipId;
      options?: Partial<StreamQueryOptions>;
    }>
  ): Thunk =>
  (dispatch, getProject) => {
    const undoType = unpackUndoType(payload, "walkPatternClip");
    const clipId = payload.data.id;
    const options = payload.data.options ?? defaultSearchOptions;
    const project = getProject();
    const clip = selectPortaledClip(project, clipId);
    const search = selectPortaledPatternClipTransformation(
      project,
      clipId,
      options
    );
    if (!clip || !search) return;

    // Try to find the existing vector targeting the clip
    const poseClips = selectPoseClips(project);
    const poseClip = poseClips.find(
      (pc) => pc.trackId === clip.trackId && pc.tick === clip.tick
    );

    // If the pose clip exists, update the pose vector
    if (poseClip) {
      const pose = selectPoseById(project, poseClip.poseId);
      const vector = sumVectors(pose?.vector, search.vector);
      for (const key in vector) {
        if (!vector[key as PoseVectorId]) delete vector[key as PoseVectorId];
      }
      dispatch(updatePose({ data: { id: poseClip.poseId, vector }, undoType }));
      return;
    }

    // Otherwise, create a new pose and clip
    dispatch(
      createCourtesyPoseClip({
        data: {
          pose: { vector: search.vector },
          clip: { tick: clip.tick, trackId: clip.trackId },
        },
        undoType,
      })
    );
  };

// Walk all selected pattern clips using the given stream query
export const walkSelectedPatternClips =
  (payload: Payload<{ options?: Partial<StreamQueryOptions> } | null>): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const poses = selectPoses(project);
    const undoType = createUndoType("search", poses);
    const portaledClipIds = selectPortaledClipIds(project);
    const selectedIds = selectSelectedClipIds(project);
    const pcIds = portaledClipIds.filter(
      (pcId) =>
        isPortaledPatternClipId(pcId) &&
        selectedIds.some((id) => getOriginalIdFromPortaledClip(pcId) === id)
    ) as PortaledPatternClipId[];
    for (const id of pcIds) {
      dispatch(
        walkPatternClip({
          data: { id, options: payload?.data?.options ?? {} },
          undoType,
        })
      );
    }
  };
