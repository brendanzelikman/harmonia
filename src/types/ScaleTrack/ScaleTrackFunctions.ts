import {
  NestedScaleMap,
  Scale,
  chromaticScale,
  resolveNestedScale,
} from "types/Scale";
import { ScaleTrack, ScaleTrackMap, isScaleTrack } from "./ScaleTrackTypes";
import { ERROR_TAG } from "types/units";

/**
 * Get the unique tag of a given ScaleTrack.
 * @param clip Optional. The ScaleTrack object.
 * @returns Unique tag string. If the ScaleTrack is invalid, return the error tag.
 */
export const getScaleTrackTag = (track: Partial<ScaleTrack>) => {
  if (!isScaleTrack(track)) return ERROR_TAG;
  const { id, parentId, name, type, scaleId } = track;
  return `${id}@${parentId}@${name}@${type}@${scaleId}`;
};

/**
 * Gets the scale of a scale track by recursing up the parent scale tracks.
 * @param scaleTrack The ScaleTrack object.
 * @param scaleTracks The ScaleTrackMap.
 * @param scaleMap The NestedScaleMap.
 * @returns A realized Scale. If the ScaleTrack or ScaleTrackMap is invalid, return the chromatic scale.
 */
export const getScaleTrackScale = (
  scaleTrack?: ScaleTrack,
  scaleTrackMap?: ScaleTrackMap,
  scaleMap?: NestedScaleMap
): Scale => {
  // If any parameter is invalid, return the chromatic scale
  if (!scaleTrack || !scaleTrackMap || !scaleMap) return chromaticScale;

  // Get the parent and scale of the scale track
  let { parentId, scaleId: nestedScaleId } = scaleTrack;
  let scale = scaleMap[nestedScaleId];
  let notes = scale?.notes || [];

  // Keep going up parents while there is a parent scale track
  while (parentId) {
    // Get the parent scale track from the id
    const parentScaleTrack = scaleTrackMap[parentId];
    if (!parentScaleTrack) break;

    // Get the scale notes of the parent track
    const parentScale = scaleMap[parentScaleTrack.scaleId];
    if (!parentScale) break;
    const parentNotes = parentScale.notes;

    // Map the scale track's notes to its parents
    notes = notes.map(({ degree, offset }) => {
      const note = parentNotes[degree];
      return {
        degree: note?.degree || 0,
        offset: (note?.offset || 0) + offset,
      };
    });
    // Set the parent to the parent's parent
    parentId = parentScaleTrack.parentId;
  }
  // Once there is no parent, return the notes relative to the chromatic scale
  return resolveNestedScale(notes);
};
