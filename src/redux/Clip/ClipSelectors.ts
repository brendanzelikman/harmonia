import { RootState } from "redux/store";
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
 * @param state  The root state.
 * @returns A clip map.
 */
export const selectClipMap = (state: RootState) =>
  state.arrangement.present.clips.byId;

/**
 * Select all clip IDs from the store.
 * @param state  The root state.
 * @returns An array of clip IDs.
 */
export const selectClipIds = (state: RootState) =>
  state.arrangement.present.clips.allIds;

/**
 * Select all clips from the store.
 * @param state The root state.
 * @returns An array of clips.
 */
export const selectClips = createDeepEqualSelector(
  [selectClipMap, selectClipIds],
  (clipMap, clipIds) => getProperties(clipMap, clipIds)
);

/**
 * Select a specific clip from the store.
 * @param state The root state.
 * @param id The ID of the clip.
 * @returns The clip.
 */
export const selectClipById = (state: RootState, id?: ClipId) => {
  const clipMap = selectClipMap(state);
  return getProperty(clipMap, id);
};

/**
 * Select a list of clips by their IDs.
 * @param state The root state.
 * @param ids The IDs of the clips.
 * @returns An array of clips.
 */
export const selectClipsByIds = (state: RootState, ids: ClipId[]) => {
  const clipMap = selectClipMap(state);
  return getProperties(clipMap, ids);
};

/**
 * Select a list of clips by their track IDs.
 * @param state The root state.
 * @param trackIds The track IDs.
 */
export const selectClipsByTrackIds = (
  state: RootState,
  trackIds: TrackId[]
) => {
  const clips = selectClips(state);
  return clips.filter((clip) => trackIds.includes(clip.trackId));
};

/**
 * Select the pattern ID of a clip.
 * @param state The root state.
 * @param id The ID of the clip.
 * @returns The pattern ID of the clip.
 */
export const selectClipPatternId = (state: RootState, id?: ClipId) => {
  const clip = selectClipById(state, id);
  return clip?.patternId;
};

/**
 * Select the pattern of a clip.
 * @param state The root state.
 * @param id The ID of the clip.
 * @returns The pattern of the clip.
 */
export const selectClipPattern = (state: RootState, id?: ClipId) => {
  const patternId = selectClipPatternId(state, id);
  const patternMap = selectPatternMap(state);
  return getProperty(patternMap, patternId);
};

/**
 * Select the patterns of a list of clips.
 * @param state The root state.
 * @param ids The IDs of the clips.
 * @returns An array of patterns.
 */
export const selectClipPatterns = (state: RootState, ids: ClipId[]) => {
  const patternMap = selectPatternMap(state);
  const patternIds = ids.map((id) => selectClipPatternId(state, id));
  return getProperties(patternMap, patternIds);
};

/**
 * Select the name of a clip by using the name of its pattern.
 * @param state The root state.
 * @param id The ID of the clip.
 * @returns The name of the clip.
 */
export const selectClipName = (state: RootState, id?: ClipId) => {
  const pattern = selectClipPattern(state, id);
  return pattern?.name;
};

/**
 * Select the duration of a clip in ticks.
 * @param state The root state.
 * @param id The ID of the clip.
 * @returns The duration in ticks.
 */
export const selectClipDuration = (state: RootState, id?: ClipId) => {
  const clip = selectClipById(state, id);
  const pattern = selectClipPattern(state, id);
  return getClipDuration(clip, pattern);
};

/**
 * Select the durations of a list of clips.
 * @param state The root state.
 * @param ids The IDs of the clips.
 * @returns An array of durations.
 */
export const selectClipDurations = (state: RootState, ids: ClipId[]) => {
  const clips = selectClipsByIds(state, ids);
  const patterns = selectClipPatterns(state, ids);
  return clips.map((clip, index) => getClipDuration(clip, patterns[index]));
};

/**
 * Select the transposition IDs of a clip.
 * @param state The root state.
 * @param id The ID of the clip.
 * @returns An array of transposition IDs.
 */
export const selectClipTranspositionIds = (state: RootState, id?: ClipId) => {
  const clip = selectClipById(state, id);
  if (!isClip(clip)) return [];
  const trackHierarchy = selectTrackHierarchy(state);
  const trackNode = trackHierarchy.byId[clip.trackId];
  return trackNode?.transpositionIds ?? [];
};

/**
 * Select the transpositions of a clip.
 * @param state The root state.
 * @param id The ID of the clip.
 * @returns An array of transpositions.
 */
export const selectClipTranspositions = (state: RootState, id?: ClipId) => {
  const clip = selectClipById(state, id);
  if (!isClip(clip)) return [];
  const trackHierarchy = selectTrackHierarchy(state);
  const trackNode = trackHierarchy.byId[clip.trackId];
  if (!trackNode) return [];
  const transpositionMap = selectTranspositionMap(state);
  const ids = trackNode.transpositionIds;
  const transpositions = getProperties(transpositionMap, ids);
  const clipDuration = selectClipDuration(state, id);
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
 * @param state The root state.
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
 * @param state The root state.
 * @param id The ID of the clip.
 * @returns The transposed stream of the clip.
 */
export const selectClipStream = (state: RootState, id?: ClipId) => {
  const streams = selectClipStreams(state);
  return getProperty(streams, id);
};
