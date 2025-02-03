import { createSelector } from "reselect";
import { selectMotifState } from "types/Motif/MotifSelectors";
import { Project } from "types/Project/ProjectTypes";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import { selectScaleMap, selectScaleIds } from "types/Scale/ScaleSelectors";
import { ScaleId } from "types/Scale/ScaleTypes";
import { selectCellHeight } from "types/Timeline/TimelineSelectors";
import { getTrackLabel } from "types/Track/TrackFunctions";
import {
  selectOrderedTrackIds,
  selectScaleTrackMap,
  selectTopLevelTrackIds,
  selectTrackById,
  selectTrackChildIdMap,
  selectTrackCollapsedMap,
  selectTrackInstrumentMap,
  selectTrackLabelMap,
  selectTrackMap,
  selectTrackMidiScaleMap,
  selectTrackParentIdMap,
} from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { Tick } from "types/units";
import { HEADER_HEIGHT, COLLAPSED_TRACK_HEIGHT } from "utils/constants";
import { getArrayByKey, getValueByKey } from "utils/objects";
import { getTrackScaleChain } from "./ArrangementFunctions";
import { selectProcessedArrangement } from "./ArrangementSelectors";
import { createDeepSelector } from "lib/redux";
import { getScaleName } from "utils/scale";
import {
  getPoseVectorAsJSX,
  getPoseVectorAsString,
} from "types/Pose/PoseFunctions";
import { getPoseOperationsAtTick } from "types/Clip/PoseClip/PoseClipFunctions";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import { sumVectors } from "utils/vector";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";

export const selectTrackVectorJSX = createSelector(
  [selectTrackMap, (_: Project, id: TrackId) => id],
  (trackMap, trackId) => {
    return getPoseVectorAsJSX(trackMap[trackId]?.vector, trackMap);
  }
);

const createMap = <K extends string, V>(keys: K[], value: (key: K) => V) => {
  return keys.reduce((acc, key) => {
    acc[key] = value(key);
    return acc;
  }, {} as Record<K, V>);
};

/** Select the top offset of the track ID in pixels based on the given track ID. */
export const selectTrackTopMap = createDeepSelector(
  [
    selectOrderedTrackIds,
    selectTrackParentIdMap,
    selectTrackChildIdMap,
    selectTrackCollapsedMap,
    selectCellHeight,
  ],
  (
    orderedTrackIds,
    trackParentIdMap,
    trackChildIdMap,
    collapsedMap,
    cellHeight
  ) => {
    const topLevelTrackIds = orderedTrackIds.filter(
      (id) => !trackParentIdMap[id]
    );

    // Create a map for each track
    return createMap(orderedTrackIds, (id) => {
      let found = false;
      let top = HEADER_HEIGHT;
      if (!id) return HEADER_HEIGHT;

      // Recursively get the top offset with the children
      const getChildrenTop = (
        trackIds: TrackId[],
        trackId: TrackId
      ): number => {
        let acc = 0;

        // Iterate through each child
        for (let i = 0; i < trackIds.length; i++) {
          if (found) return acc;

          // Get the child
          const childId = trackIds[i];

          // If the child is the object, return the top offset
          if (childId === trackId) {
            found = true;
            return acc;
          }
          // Otherwise, add the height of the child and its children
          const children = getArrayByKey(trackChildIdMap, childId);
          acc += collapsedMap[childId] ? COLLAPSED_TRACK_HEIGHT : cellHeight;
          acc += getChildrenTop(children, trackId);
        }
        return acc;
      };

      // Iterate through each top-level track
      for (const tId of topLevelTrackIds) {
        // If the object is found, return the top offset
        if (found) return top;
        if (tId === id) break;

        // Add the height of the node and its children
        top += !!collapsedMap[tId] ? COLLAPSED_TRACK_HEIGHT : cellHeight;
        const children = getArrayByKey(trackChildIdMap, tId);
        top += getChildrenTop(children, id);
      }

      // Return the top offset
      return top;
    });
  }
);

/** Select the top offset of the track ID in pixels */
export const selectTrackTop = (project: Project, trackId?: TrackId) => {
  const trackIdTopMap = selectTrackTopMap(project);
  return getValueByKey(trackIdTopMap, trackId) ?? 0;
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
  if (!trackId) return [];
  const arrangement = selectProcessedArrangement(project);
  const motifs = selectMotifState(project);
  return getTrackScaleChain(trackId, { ...arrangement, motifs, tick });
};

/** Select the name of a track at a given tick. */
export const selectTrackMidiScaleAtTick = (
  project: Project,
  trackId?: TrackId,
  tick: Tick = 0
) => {
  const scaleChain = selectTrackScaleChainAtTick(project, trackId, tick);
  const midiScale = resolveScaleChainToMidi(scaleChain);
  return midiScale;
};

/** Select the name of a track at a given tick. */
export const selectTrackScaleNameAtTick = (
  project: Project,
  trackId?: TrackId,
  tick: Tick = 0
) => {
  const midiScale = selectTrackMidiScaleAtTick(project, trackId, tick);
  return getScaleName(midiScale);
};

/** Select the record of all scales to their names. */
export const selectScaleNameMap = createSelector(
  [
    selectScaleMap,
    selectScaleIds,
    selectScaleTrackMap,
    selectTrackMidiScaleMap,
  ],
  (scaleMap, scaleIds, scaleTrackMap, midiScaleMap) => {
    const scaleNameMap: Record<ScaleId, string | undefined> = {};

    // Iterate over each scale
    scaleIds.forEach((id) => {
      const scale = scaleMap[id];
      if (!scale) return;

      // If the scale belongs to a scale track, display the track label.
      if (scale.trackId) {
        const trackLabel = getTrackLabel(scale.trackId, scaleTrackMap);
        const midiScale = getArrayByKey(midiScaleMap, scale.trackId);
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
export const selectScaleName = (project: Project, scaleId?: ScaleId) => {
  if (!scaleId) return "Custom Scale";
  const scaleNameMap = selectScaleNameMap(project);
  if (scaleId in scaleNameMap) return scaleNameMap[scaleId];
  const scaleMap = selectScaleMap(project);
  return scaleMap[scaleId]?.name ?? "Custom Scale";
};

export const selectTrackJSXAtTick = (
  project: Project,
  trackId: TrackId,
  tick: Tick = 0
) => {
  const arrangement = selectProcessedArrangement(project);
  const poseClips = arrangement.clipsByTrack?.[trackId]?.pose;
  const poseMap = selectPoseMap(project);
  const operations = getPoseOperationsAtTick(poseClips, poseMap, tick);
  const track = selectTrackById(project, trackId);
  const vector = sumVectors(track?.vector, ...operations.map((v) => v.vector));
  return getPoseVectorAsJSX(vector, arrangement.tracks);
};

export const selectTrackJsonAtTick = createSelector(
  [
    selectTopLevelTrackIds,
    selectTrackLabelMap,
    selectTrackMap,
    selectTrackInstrumentMap,
    selectPoseMap,
    selectProcessedArrangement,
    selectMotifState,
    (project, tick: Tick) => tick,
  ],
  (
    topLevelTracks,
    labelMap,
    trackMap,
    iMap,
    poseMap,
    arrangement,
    motifs,
    tick
  ) => {
    const createTrack = (trackId: TrackId): any => {
      const track = trackMap[trackId];
      if (!track) return { name: trackId };
      const meta = { trackId };
      const name = `Track ${labelMap[trackId]}`;
      const isPT = track.type === "pattern";
      const Instrument = getInstrumentName(iMap[trackId]?.key);
      const poseClips = arrangement.clipsByTrack?.[trackId]?.pose;
      const vector = sumVectors(
        track.vector,
        ...getPoseOperationsAtTick(poseClips, poseMap, tick).map(
          (v) => v.vector
        )
      );
      const Pose = getPoseVectorAsString(vector, trackMap);
      if (isPT) return { name, attributes: { Instrument, Pose, meta } };

      const scaleChain = getTrackScaleChain(trackId, {
        ...arrangement,
        motifs,
        tick,
      });
      const scale = resolveScaleChainToMidi(scaleChain);
      const attributes = { Scale: getScaleName(scale), Pose, meta };
      return { name, attributes, children: track.trackIds.map(createTrack) };
    };
    return {
      name: "Tracks",
      id: "f",
      children: topLevelTracks.map(createTrack),
    };
  }
);
