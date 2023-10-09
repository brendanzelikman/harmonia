import { ERROR_TAG } from "../units";
import { PatternTrack, isPatternTrack } from "./PatternTrackTypes";

/**
 * Get the unique tag of a given PatternTrack.
 * @param clip Optional. The PatternTrack object.
 * @returns Unique tag string. If the PatternTrack is invalid, return the error tag.
 */
export const getPatternTrackTag = (track: Partial<PatternTrack>) => {
  if (!isPatternTrack(track)) return ERROR_TAG;
  const { id, parentId, name, type, instrumentId } = track;
  return `${id}@${parentId}@${name}@${type}@${instrumentId}`;
};
