import { Project } from "types/Project";
import { getValuesByKeys, getValueByKey } from "utils/objects";
import { getClipDuration, isClip, ClipId } from "types/Clip";
import { TrackId } from "types/Track";
import { createDeepEqualSelector } from "redux/util";
import { doesMediaElementOverlapRange } from "types/Media";
import { selectPatternMap } from "redux/Pattern/PatternSelectors";
import { selectPoseMap } from "redux/Pose/PoseSelectors";
import { convertTicksToSeconds } from "types/Transport";
import { selectTrackHierarchy } from "redux/TrackHierarchy/TrackHierarchySelectors";
import { selectTransport } from "redux/Transport/TransportSelectors";

/** Select the clip map from the store. */
export const selectClipMap = (project: Project) =>
  project.arrangement.present.clips.byId;

/** Select all clip IDs from the store. */
export const selectClipIds = (project: Project) =>
  project.arrangement.present.clips.allIds;

/** Select all clips from the store. */
export const selectClips = createDeepEqualSelector(
  [selectClipMap, selectClipIds],
  (clipMap, clipIds) => getValuesByKeys(clipMap, clipIds)
);

/** Select a specific clip from the store. */
export const selectClipById = (project: Project, id?: ClipId) => {
  const clipMap = selectClipMap(project);
  return getValueByKey(clipMap, id);
};

/** Select a list of clips by their IDs. */
export const selectClipsByIds = (project: Project, ids: ClipId[]) => {
  const clipMap = selectClipMap(project);
  return getValuesByKeys(clipMap, ids);
};

/** Select a list of clips by their track IDs. */
export const selectClipsByTrackIds = (
  project: Project,
  trackIds: TrackId[]
) => {
  const clips = selectClips(project);
  return clips.filter((clip) => trackIds.includes(clip.trackId));
};

/** Select the pattern ID of a clip. */
export const selectClipPatternId = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  return clip?.patternId;
};

/** Select the pattern of a clip. */
export const selectClipPattern = (project: Project, id?: ClipId) => {
  const patternId = selectClipPatternId(project, id);
  const patternMap = selectPatternMap(project);
  return getValueByKey(patternMap, patternId);
};

/** Select the patterns of a list of clips. */
export const selectClipPatterns = (project: Project, ids: ClipId[]) => {
  const patternMap = selectPatternMap(project);
  const patternIds = ids.map((id) => selectClipPatternId(project, id));
  return getValuesByKeys(patternMap, patternIds);
};

/** Select the name of a clip by using the name of its pattern. */
export const selectClipName = (project: Project, id?: ClipId) => {
  const pattern = selectClipPattern(project, id);
  return pattern?.name;
};

/** Select the duration of a clip in ticks. */
export const selectClipDuration = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  const pattern = selectClipPattern(project, id);
  return getClipDuration(clip, pattern);
};

/** Select the durations of a list of clips. */
export const selectClipDurations = (project: Project, ids: ClipId[]) => {
  const clips = selectClipsByIds(project, ids);
  const patterns = selectClipPatterns(project, ids);
  return clips.map((clip, index) => getClipDuration(clip, patterns[index]));
};

/** Select the pose IDs of a clip. */
export const selectClipPoseIds = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  if (!isClip(clip)) return [];
  const trackHierarchy = selectTrackHierarchy(project);
  const trackNode = trackHierarchy.byId[clip.trackId];
  return trackNode?.poseIds ?? [];
};

/** Select the poses of a clip. */
export const selectClipPoses = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  if (!isClip(clip)) return [];
  const trackHierarchy = selectTrackHierarchy(project);
  const trackNode = trackHierarchy.byId[clip.trackId];
  if (!trackNode) return [];
  const poseMap = selectPoseMap(project);
  const ids = trackNode.poseIds;
  const poses = getValuesByKeys(poseMap, ids);
  const clipDuration = selectClipDuration(project, id);
  return poses.filter((pose) => {
    return doesMediaElementOverlapRange(clip, clipDuration, [
      pose.tick,
      pose.tick + (pose.duration ?? Infinity),
    ]);
  });
};

/** Select the start time of a clip in seconds. */
export const selectClipStartTime = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  const transport = selectTransport(project);
  if (!clip) return undefined;
  return convertTicksToSeconds(transport, clip.tick);
};
