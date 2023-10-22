import { Project } from "types/Project";
import { selectTrackHierarchy, selectTrackNodeMap } from "../TrackHierarchy";
import { getProperties, getProperty } from "types/util";
import { getClipDuration, isClip, getClipStreams, ClipId } from "types/Clip";
import { TrackId } from "types/Track";
import { createDeepEqualSelector } from "redux/util";
import { doesMediaOverlap } from "types/Media";
import { selectPatternMap } from "redux/Pattern/PatternSelectors";
import { selectPatternTrackMap } from "redux/PatternTrack/PatternTrackSelectors";
import { selectScaleMap } from "redux/Scale/ScaleSelectors";
import { selectScaleTrackMap } from "redux/ScaleTrack/ScaleTrackSelectors";
import { selectTranspositionMap } from "redux/Transposition/TranspositionSelectors";

/**
 * Select the clip map from the store.
 * @param project  The project.
 * @returns A clip map.
 */
export const selectClipMap = (project: Project) =>
  project.arrangement.present.clips.byId;

/**
 * Select all clip IDs from the store.
 * @param project  The project.
 * @returns An array of clip IDs.
 */
export const selectClipIds = (project: Project) =>
  project.arrangement.present.clips.allIds;

/**
 * Select all clips from the store.
 * @param project The project.
 * @returns An array of clips.
 */
export const selectClips = createDeepEqualSelector(
  [selectClipMap, selectClipIds],
  (clipMap, clipIds) => getProperties(clipMap, clipIds)
);

/**
 * Select a specific clip from the store.
 * @param project The project.
 * @param id The ID of the clip.
 * @returns The clip.
 */
export const selectClipById = (project: Project, id?: ClipId) => {
  const clipMap = selectClipMap(project);
  return getProperty(clipMap, id);
};

/**
 * Select a list of clips by their IDs.
 * @param project The project.
 * @param ids The IDs of the clips.
 * @returns An array of clips.
 */
export const selectClipsByIds = (project: Project, ids: ClipId[]) => {
  const clipMap = selectClipMap(project);
  return getProperties(clipMap, ids);
};

/**
 * Select a list of clips by their track IDs.
 * @param project The project.
 * @param trackIds The track IDs.
 */
export const selectClipsByTrackIds = (
  project: Project,
  trackIds: TrackId[]
) => {
  const clips = selectClips(project);
  return clips.filter((clip) => trackIds.includes(clip.trackId));
};

/**
 * Select the pattern ID of a clip.
 * @param project The project.
 * @param id The ID of the clip.
 * @returns The pattern ID of the clip.
 */
export const selectClipPatternId = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  return clip?.patternId;
};

/**
 * Select the pattern of a clip.
 * @param project The project.
 * @param id The ID of the clip.
 * @returns The pattern of the clip.
 */
export const selectClipPattern = (project: Project, id?: ClipId) => {
  const patternId = selectClipPatternId(project, id);
  const patternMap = selectPatternMap(project);
  return getProperty(patternMap, patternId);
};

/**
 * Select the patterns of a list of clips.
 * @param project The project.
 * @param ids The IDs of the clips.
 * @returns An array of patterns.
 */
export const selectClipPatterns = (project: Project, ids: ClipId[]) => {
  const patternMap = selectPatternMap(project);
  const patternIds = ids.map((id) => selectClipPatternId(project, id));
  return getProperties(patternMap, patternIds);
};

/**
 * Select the name of a clip by using the name of its pattern.
 * @param project The project.
 * @param id The ID of the clip.
 * @returns The name of the clip.
 */
export const selectClipName = (project: Project, id?: ClipId) => {
  const pattern = selectClipPattern(project, id);
  return pattern?.name;
};

/**
 * Select the duration of a clip in ticks.
 * @param project The project.
 * @param id The ID of the clip.
 * @returns The duration in ticks.
 */
export const selectClipDuration = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  const pattern = selectClipPattern(project, id);
  return getClipDuration(clip, pattern);
};

/**
 * Select the durations of a list of clips.
 * @param project The project.
 * @param ids The IDs of the clips.
 * @returns An array of durations.
 */
export const selectClipDurations = (project: Project, ids: ClipId[]) => {
  const clips = selectClipsByIds(project, ids);
  const patterns = selectClipPatterns(project, ids);
  return clips.map((clip, index) => getClipDuration(clip, patterns[index]));
};

/**
 * Select the transposition IDs of a clip.
 * @param project The project.
 * @param id The ID of the clip.
 * @returns An array of transposition IDs.
 */
export const selectClipTranspositionIds = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  if (!isClip(clip)) return [];
  const trackHierarchy = selectTrackHierarchy(project);
  const trackNode = trackHierarchy.byId[clip.trackId];
  return trackNode?.transpositionIds ?? [];
};

/**
 * Select the transpositions of a clip.
 * @param project The project.
 * @param id The ID of the clip.
 * @returns An array of transpositions.
 */
export const selectClipTranspositions = (project: Project, id?: ClipId) => {
  const clip = selectClipById(project, id);
  if (!isClip(clip)) return [];
  const trackHierarchy = selectTrackHierarchy(project);
  const trackNode = trackHierarchy.byId[clip.trackId];
  if (!trackNode) return [];
  const transpositionMap = selectTranspositionMap(project);
  const ids = trackNode.transpositionIds;
  const transpositions = getProperties(transpositionMap, ids);
  const clipDuration = selectClipDuration(project, id);
  return transpositions.filter((transposition) => {
    return doesMediaOverlap(
      clip,
      transposition.tick,
      transposition.tick + (transposition.duration ?? Infinity),
      clipDuration
    );
  });
};

/**
 * Select the fully transposed streams of all clip.
 * @param project The project.
 * @returns An array of transposed streams.
 */
export const selectClipStreams = createDeepEqualSelector(
  [
    selectClips,
    selectPatternMap,
    selectPatternTrackMap,
    selectScaleMap,
    selectScaleTrackMap,
    selectTranspositionMap,
    selectTrackNodeMap,
  ],
  (
    clips,
    patternMap,
    patternTrackMap,
    scaleMap,
    scaleTrackMap,
    transpositionMap,
    trackNodeMap
  ) => {
    return getClipStreams({
      clips,
      patternMap,
      patternTrackMap,
      scaleMap,
      scaleTrackMap,
      transpositionMap,
      trackNodeMap,
    });
  }
);

/**
 * Select the fully transposed stream of a clip.
 * @param project The project.
 * @param id The ID of the clip.
 * @returns The transposed stream of the clip.
 */
export const selectClipStream = (project: Project, id?: ClipId) => {
  const streams = selectClipStreams(project);
  return getProperty(streams, id);
};
