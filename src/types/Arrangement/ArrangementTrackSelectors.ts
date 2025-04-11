import { Project } from "types/Project/ProjectTypes";
import { resolveScaleChainToMidi } from "types/Scale/ScaleResolvers";
import { selectCellHeight } from "types/Timeline/TimelineSelectors";
import {
  selectTopLevelTracks,
  selectTrackById,
  selectTrackChildIdMap,
  selectTrackMap,
} from "types/Track/TrackSelectors";
import { TrackId } from "types/Track/TrackTypes";
import { Tick } from "types/units";
import {
  HEADER_HEIGHT,
  COLLAPSED_TRACK_HEIGHT,
  NAV_HEIGHT,
} from "utils/constants";
import { getTrackScaleChain } from "./ArrangementFunctions";
import {
  selectPortaledClips,
  selectProcessedArrangement,
} from "./ArrangementSelectors";
import { createDeepSelector, createValueSelector } from "types/redux";
import { getScaleName } from "types/Scale/ScaleFinder";
import { getPoseVectorAsString } from "types/Pose/PoseFunctions";
import { getPoseOperationsAtTick } from "types/Clip/PoseClip/PoseClipFunctions";
import { selectPoseMap } from "types/Pose/PoseSelectors";
import { sumVectors } from "utils/vector";
import { selectClips } from "types/Clip/ClipSelectors";
import { ClipId } from "types/Clip/ClipTypes";
import { PortaledClipId } from "types/Portal/PortalTypes";

// ------------------------------------------------------------
// Track Style
// ------------------------------------------------------------

/** Select the map of all tracks to their top pixels. */
export const selectTrackTopMap = createDeepSelector(
  [
    selectTopLevelTracks,
    selectTrackChildIdMap,
    selectTrackMap,
    selectCellHeight,
  ],
  (topLevelTracks, trackChildIdMap, trackMap, cellHeight) => {
    const map: Record<TrackId, number> = {};
    let top = HEADER_HEIGHT;

    const addTrack = (trackId: TrackId) => {
      map[trackId] = top;
      const isCollapsed = !!trackMap[trackId]?.collapsed;
      top += isCollapsed ? COLLAPSED_TRACK_HEIGHT : cellHeight;
      trackChildIdMap[trackId]?.forEach(addTrack);
    };

    topLevelTracks.forEach((t) => addTrack(t.id));
    return map;
  }
);

/** Select the top of a track in pixels */
export const selectTrackTop = createValueSelector(
  selectTrackTopMap,
  NAV_HEIGHT
);

// ------------------------------------------------------------
// Track Properties
// ------------------------------------------------------------

/** Select the midi scale of a track at a given tick. */
export const selectTrackMidiScaleAtTick = (
  project: Project,
  trackId?: TrackId,
  tick: Tick = 0
) => {
  if (trackId === undefined) return [];
  const arrangement = selectProcessedArrangement(project);
  const scales = getTrackScaleChain(trackId, { ...arrangement, tick });
  const midiScale = resolveScaleChainToMidi(scales);
  return midiScale;
};

/** Select the name of the midi scale of a track at a given tick. */
export const selectTrackScaleNameAtTick = (
  project: Project,
  trackId?: TrackId,
  tick: Tick = 0
) => {
  const midiScale = selectTrackMidiScaleAtTick(project, trackId, tick);
  return getScaleName(midiScale);
};

/** Select the JSX of the pose of a track at a given tick  */
export const selectTrackJSXAtTick = (
  project: Project,
  trackId: TrackId,
  tick: Tick = 0
) => {
  const arrangement = selectProcessedArrangement(project);
  const poseClips = arrangement.trackPoseClips[trackId] ?? [];
  const poseMap = selectPoseMap(project);
  const operations = getPoseOperationsAtTick(poseClips, { poseMap, tick });
  const track = selectTrackById(project, trackId);
  const vector = sumVectors(track?.vector, ...operations.map((v) => v.vector));
  return getPoseVectorAsString(vector, arrangement.tracks);
};

// ------------------------------------------------------------
// Track Clips
// ------------------------------------------------------------

/** Select the map of tracks to their clip IDs. */
export const selectTrackClipIdsMap = createDeepSelector(
  [selectClips],
  (clips) =>
    clips.reduce((acc, clip) => {
      (acc[clip.trackId] ??= []).push(clip.id);
      return acc;
    }, {} as Record<TrackId, ClipId[]>)
);

/** Select the array of clip IDs for a track. */
export const selectTrackClipIds = (project: Project, trackId: TrackId) => {
  return selectTrackClipIdsMap(project)[trackId] ?? [];
};

/** Select the map of tracks to their portaled clip IDs. */
export const selectTrackPortaledClipIdsMap = createDeepSelector(
  [selectPortaledClips],
  (clips) =>
    clips.reduce((acc, clip) => {
      (acc[clip.trackId] ??= []).push(clip.id);
      return acc;
    }, {} as Record<TrackId, PortaledClipId[]>)
);

/** Select the array of portaled clip IDs for a track. */
export const selectTrackPortaledClipIds = (
  project: Project,
  trackId: TrackId
) => {
  return selectTrackPortaledClipIdsMap(project)[trackId] ?? [];
};
