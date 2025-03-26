import { selectPoseClipMap } from "types/Clip/ClipSelectors";
import {
  ClipType,
  IPortaledClip,
  PortaledPatternClip,
  PortaledPatternClipId,
} from "types/Clip/ClipTypes";
import { Project } from "types/Project/ProjectTypes";
import {
  selectCellWidth,
  selectCellsPerTick,
} from "types/Timeline/TimelineSelectors";

import {
  selectPortaledPatternClipStream,
  selectPortaledPatternClipStreamMap,
  selectPortaledClipMap,
  selectPortaledClips,
  selectProcessedArrangement,
} from "./ArrangementSelectors";
import { selectTrackMap } from "types/Track/TrackSelectors";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import { mapValues } from "lodash";
import { getPoseVectorAsString } from "types/Pose/PoseFunctions";
import { createDeepSelector, createValueSelector } from "lib/redux";
import { TRACK_WIDTH } from "utils/constants";
import { DemoXML } from "assets/demoXML";
import { exportPatternStreamToXML } from "types/Pattern/PatternExporters";
import { selectPatternById } from "types/Pattern/PatternSelectors";
import { selectTrackMidiScaleAtTick } from "./ArrangementTrackSelectors";
import { IPortaledClipId, PortaledClipId } from "types/Portal/PortalTypes";
import { isFiniteNumber } from "types/util";
import { getMidiStreamMinMax } from "types/Pattern/PatternUtils";
import {
  StreamQueryOptions,
  defaultStreamQuery,
  getPatternStreamQuery,
} from "./ArrangementSearchFunctions";

// --------------------------------------------
// Clip Properties
// --------------------------------------------

/** Select the map of all clips to their left pixels. */
export const selectClipLeftMap = createDeepSelector(
  [selectPortaledClipMap, selectCellsPerTick],
  (clips, ratio) => mapValues(clips, (clip) => TRACK_WIDTH + clip.tick * ratio)
);

/** Select the left of a clip in pixels. */
export const selectClipLeft = createValueSelector(selectClipLeftMap);

/** Select the map of all clips to their width in pixels. */
export const selectClipWidthMap = createDeepSelector(
  [selectPortaledClipMap, selectCellsPerTick, selectCellWidth],
  (clips, ratio, cellWidth) =>
    mapValues(clips, (clip) => {
      if (!clip.duration || !isFiniteNumber(clip.duration)) {
        return cellWidth;
      }
      return Math.max(ratio * clip.duration, cellWidth);
    })
);

/** Select the width of a clip in pixels. */
export const selectClipWidth = createValueSelector(selectClipWidthMap);

/** Select the map of all clips to their bounds (left and right pixels). */
export const selectPortaledClipBoundMap = createDeepSelector(
  [selectPortaledClips, selectClipLeftMap, selectClipWidthMap],
  (clips, leftMap, widthMap) => {
    return clips.reduce((acc, clip) => {
      acc[clip.id] = {
        left: leftMap[clip.id],
        right: leftMap[clip.id] + widthMap[clip.id],
      };
      return acc;
    }, {} as Record<PortaledClipId, { left: number; right: number }>);
  }
);

// --------------------------------------------
// Pose Clips
// --------------------------------------------

type PortaledClipSelector<T extends ClipType> = (
  project: Project,
  id: IPortaledClipId<T>
) => IPortaledClip<T>;

/** Select a portaled pose clip by ID. */
export const selectPortaledPoseClip = createValueSelector(
  selectPortaledClipMap
) as PortaledClipSelector<"pose">;

/** Select the JSX of a pose clip (string). */
export const selectPoseClipJSXMap = createDeepSelector(
  [selectPoseClipMap, selectPoseMap, selectTrackMap],
  (poseClips, poseMap, trackMap) => {
    return mapValues(poseClips, (clip) => {
      if (clip === undefined) return null;
      const pose = poseMap[clip.poseId];
      return getPoseVectorAsString(pose?.vector ?? {}, trackMap);
    });
  }
);
export const selectPoseClipJSX = createValueSelector(selectPoseClipJSXMap);

// --------------------------------------------
// Pattern Clips
// --------------------------------------------

/** Select a portaled pattern clip by ID. */
export const selectPortaledPatternClip = createValueSelector(
  selectPortaledClipMap
) as PortaledClipSelector<"pattern">;

/** Select the map of all pattern clips to their MIDI ranges. */
export const selectPortaledPatternClipRangeMap = createDeepSelector(
  [selectPortaledPatternClipStreamMap],
  (streamMap) =>
    mapValues(streamMap, (stream) =>
      getMidiStreamMinMax(stream.map((n) => n.notes))
    )
);

/** Select the MIDI range of a pattern clip. */
export const selectPortaledPatternClipRange = createValueSelector(
  selectPortaledPatternClipRangeMap,
  { min: 0, max: 0 }
);

/** Select the XML of a pattern clip (at the tick of the clip). */
export const selectPortaledPatternClipXML = (
  project: Project,
  clip?: PortaledPatternClip
) => {
  if (clip === undefined) return DemoXML;
  const pattern = selectPatternById(project, clip?.patternId);
  if (pattern === undefined) return DemoXML;
  const midi = selectPortaledPatternClipStream(project, clip.id);
  const stream = midi.map((n) => n.notes);
  const scale = selectTrackMidiScaleAtTick(project, pattern.trackId, clip.tick);
  return exportPatternStreamToXML(stream, scale);
};

/** Select the transformation of a clip using a stream query. */
export const selectPortaledPatternClipTransformation = (
  project: Project,
  id: PortaledPatternClipId,
  options?: Partial<StreamQueryOptions>
) => {
  const arrangement = selectProcessedArrangement(project);
  const clip = arrangement.patternClips[id];
  if (!clip) return defaultStreamQuery;
  const pattern = arrangement.patterns.entities?.[clip.patternId];
  if (!pattern) return defaultStreamQuery;
  const deps = { ...arrangement, clip, tick: clip.tick };
  return getPatternStreamQuery(pattern.stream, deps, options);
};
