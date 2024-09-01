import { mapValues } from "lodash";
import { createSelector } from "reselect";
import { selectMotifState } from "types/Motif/MotifSelectors";
import { Project } from "types/Project/ProjectTypes";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import { selectScaleMap, selectScaleIds } from "types/Scale/ScaleSelectors";
import { chromaticScale, ScaleId } from "types/Scale/ScaleTypes";
import { selectCellHeight } from "types/Timeline/TimelineSelectors";
import { getTrackLabel } from "types/Track/TrackFunctions";
import {
  selectOrderedTrackIds,
  selectScaleTrackMap,
  selectScaleTracks,
  selectTrackChildMap,
  selectTrackMap,
  selectTrackMidiScaleMap,
} from "types/Track/TrackSelectors";
import { Track, TrackId } from "types/Track/TrackTypes";
import { Tick } from "types/units";
import { HEADER_HEIGHT, COLLAPSED_TRACK_HEIGHT } from "utils/constants";
import { getArrayByKey } from "utils/objects";
import { getTrackScaleChain } from "./ArrangementFunctions";
import { selectTrackArrangement } from "./ArrangementSelectors";
import { createDeepSelector, createValueSelector } from "lib/redux";
import { getScaleName } from "utils/key";

/** Select the top offset of the track ID in pixels based on the given track ID. */
export const selectTrackTopMap = createDeepSelector(
  [
    selectTrackMap,
    selectOrderedTrackIds,
    selectTrackChildMap,
    selectCellHeight,
  ],
  (trackMap, orderedTrackIds, trackChildMap, cellHeight) => {
    const topLevelTracks = orderedTrackIds
      .map((id) => trackMap[id])
      .filter((t) => t !== undefined && t.parentId === undefined) as Track[];

    // Create a map for each track
    return mapValues(trackMap, (t) => {
      let found = false;
      let top = HEADER_HEIGHT;
      if (!t) return HEADER_HEIGHT;

      // Recursively get the top offset with the children
      const getChildrenTop = (tracks: Track[], trackId: TrackId): number => {
        let acc = 0;

        // Iterate through each child
        for (let i = 0; i < tracks.length; i++) {
          if (found) return acc;

          // Get the child
          const child = tracks[i];
          if (!child) continue;

          // If the child is the object, return the top offset
          if (child.id === trackId) {
            found = true;
            return acc;
          }
          // Otherwise, add the height of the child and its children
          const children = getArrayByKey(trackChildMap, child.id);
          acc += child.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
          acc += getChildrenTop(children, trackId);
        }
        return acc;
      };

      // Iterate through each top-level track
      for (const topLevelTrack of topLevelTracks) {
        // If the object is found, return the top offset
        if (found) return top;
        if (topLevelTrack.id === t.id) break;

        // Add the height of the node and its children
        top += !!topLevelTrack.collapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
        const children = getArrayByKey(trackChildMap, topLevelTrack.id);
        top += getChildrenTop(children, t.id);
      }

      // Return the top offset
      return top;
    });
  }
);

/** Select the top offset of the track ID in pixels */
export const selectTrackTop = (project: Project, trackId?: TrackId) => {
  if (!trackId) return 0;
  const trackIdTopMap = selectTrackTopMap(project);
  return trackIdTopMap[trackId] ?? 0;
};

// ------------------------------------------------------------
// Track Tick-Based Scale Selectors
// ------------------------------------------------------------

/** Select the scale chain of a specific track at a given tick.  */
export const selectTrackScaleChainAtTick = (
  project: Project,
  trackId?: TrackId,
  tick: Tick = 0
) => {
  if (!trackId) return [chromaticScale];
  const arrangement = selectTrackArrangement(project);
  const motifs = selectMotifState(project);
  return getTrackScaleChain(trackId, { ...arrangement, motifs, tick });
};

/** Select the name of a track at a given tick. */
export const selectTrackScaleNameAtTick = (
  project: Project,
  trackId?: TrackId,
  tick: Tick = 0
) => {
  const scaleChain = selectTrackScaleChainAtTick(project, trackId, tick);
  const midiScale = resolveScaleChainToMidi(scaleChain);
  const name = getScaleName(midiScale);
  return name;
};

/** Select the record of all scales to their names. */
export const selectScaleNameMap = createSelector(
  [
    selectScaleMap,
    selectScaleIds,
    selectScaleTrackMap,
    selectScaleTracks,
    selectTrackMidiScaleMap,
  ],
  (scaleMap, scaleIds, scaleTrackMap, scaleTracks, midiScaleMap) => {
    const scaleNameMap: Record<ScaleId, string | undefined> = {};

    // Iterate over each scale
    scaleIds.forEach((id) => {
      const scale = scaleMap[id];
      if (!scale) return;

      // If the scale belongs to a scale track, display the track label.
      if (scale.scaleTrackId) {
        const trackLabel = getTrackLabel(scale.scaleTrackId, scaleTrackMap);
        const midiScale = getArrayByKey(midiScaleMap, scale.scaleTrackId);
        const name = getScaleName(midiScale);
        scaleNameMap[id] = `(Track ${trackLabel}) ${name}`;
      } else {
        scaleNameMap[id] = scale.name;
      }
    });

    return scaleNameMap;
  }
);

/** Select the name of a scale. */
export const selectScaleName = createValueSelector(
  selectScaleNameMap,
  "Custom Scale"
);
