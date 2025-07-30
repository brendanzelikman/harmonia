import {
  ClipId,
  ClipType,
  isPatternClipId,
  isPortaledPatternClipId,
  isPoseClipId,
  PatternClipId,
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
import {
  createUndoType,
  Payload,
  unpackData,
  unpackUndoType,
} from "types/redux";
import {
  selectClipsByTrackIds,
  selectPoseClips,
} from "types/Clip/ClipSelectors";
import { selectSelectedClipIds } from "types/Timeline/TimelineSelectors";
import { updatePose } from "types/Pose/PoseSlice";
import { sumVectors } from "utils/vector";
import { selectPoseById, selectPoses } from "types/Pose/PoseSelectors";
import { getOriginalIdFromPortaledClip } from "types/Portal/PortalFunctions";
import { PoseVectorId } from "types/Pose/PoseTypes";
import { createNewPoseClip } from "types/Track/PatternTrack/PatternTrackThunks";
import { deleteMedia } from "types/Media/MediaThunks";
import { selectPortalsByTrackIds } from "types/Portal/PortalSelectors";
import { removePortals } from "types/Portal/PortalSlice";
import {
  selectTrackById,
  selectTrackDescendantIds,
} from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";

export const walkPatternClip =
  (
    payload: Payload<{
      id: PatternClipId;
      options?: Partial<StreamQueryOptions>;
    }>
  ): Thunk =>
  (dispatch) =>
    dispatch(
      walkPortaledPatternClip({
        ...payload,
        data: { ...payload.data, id: `${payload.data.id}-chunk-1` },
      })
    );

export const walkPortaledPatternClip =
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
      createNewPoseClip({
        data: {
          pose: { vector: search.vector },
          clip: { tick: clip.tick, trackId: clip.trackId },
        },
        undoType,
      })
    );
  };

type WalkPortaledPatternClipPayload = {
  clipIds?: ClipId[];
  options?: Partial<StreamQueryOptions>;
};
// Walk all selected pattern clips using the given stream query
export const walkSelectedPatternClips =
  (payload: Payload<WalkPortaledPatternClipPayload | null>): Thunk =>
  (dispatch, getProject) => {
    const data = unpackData(payload);
    const project = getProject();
    const poses = selectPoses(project);
    const undoType = createUndoType("search", poses);
    const portaledClipIds = selectPortaledClipIds(project);
    const selectedIds = data?.clipIds ?? selectSelectedClipIds(project);
    const pcIds = portaledClipIds.filter(
      (pcId) =>
        isPortaledPatternClipId(pcId) &&
        selectedIds.some((id) => getOriginalIdFromPortaledClip(pcId) === id)
    ) as PortaledPatternClipId[];
    for (const id of pcIds) {
      dispatch(
        walkPortaledPatternClip({
          data: { id, options: payload?.data?.options ?? {} },
          undoType,
        })
      );
    }
  };

/** Clear a track of all media and its children. */
export const clearTrack =
  (
    payload: Payload<{
      trackId: TrackId;
      type?: ClipType;
      cascade?: boolean;
    }>
  ): Thunk =>
  (dispatch, getProject) => {
    const project = getProject();
    const { trackId, type, cascade } = unpackData(payload);
    const track = selectTrackById(project, trackId);
    if (!track) return;
    const undoType = createUndoType("clearTrack", trackId);

    // Get all clip IDs matching the type if specified
    const clips = selectClipsByTrackIds(project, [track.id]);
    if (cascade) {
      const children = selectTrackDescendantIds(project, trackId);
      clips.push(...selectClipsByTrackIds(project, children));
    }
    const clipIds = clips
      .map((c) => c.id)
      .filter((id) =>
        type === "pattern" ? isPatternClipId(id) : isPoseClipId(id)
      );

    // Remove all clips
    dispatch(deleteMedia({ data: { clipIds }, undoType }));

    // Remove all portals if no type is specified
    if (!type) {
      const portals = selectPortalsByTrackIds(project, [track.id]);
      const portalIds = portals.map((p) => p.id);
      dispatch(removePortals({ data: portalIds, undoType }));
    }
  };
