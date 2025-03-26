import { defaultBaseProject, Project, SafeProject } from "./ProjectTypes";
import { defaultProjectMetadata } from "../Meta/MetaTypes";
import { merge } from "lodash";
import { isInstrument } from "types/Instrument/InstrumentTypes";
import { PatternState } from "types/Pattern/PatternTypes";
import { PoseState } from "types/Pose/PoseTypes";
import { ScaleState } from "types/Scale/ScaleTypes";
import { defaultTimeline } from "types/Timeline/TimelineTypes";
import { defaultTransport } from "types/Transport/TransportTypes";
import {
  filterEntityState,
  isEntityInState,
  isIdInState,
  mergeStates,
} from "types/util";
import { BaseProject, SafeBaseProject } from "providers/store";
import { isPortal } from "types/Portal/PortalTypes";
import { selectScaleIds } from "types/Scale/ScaleSelectors";
import { selectPatternIds } from "types/Pattern/PatternSelectors";
import { selectPoseIds } from "types/Pose/PoseSelectors";
import {
  selectPatternClipIds,
  selectPoseClipIds,
} from "types/Clip/ClipSelectors";
import { selectPortalIds } from "types/Portal/PortalSelectors";
import { selectTrackIds } from "types/Track/TrackSelectors";
import { selectInstrumentIds } from "types/Instrument/InstrumentSelectors";
import moment from "moment";

// Sanitize the base project by merging with default values
export const sanitizeBaseProject = (
  baseProject: SafeBaseProject
): BaseProject => {
  return mergeBaseProjects(baseProject, defaultBaseProject);
};

// Merge the scales of a project
export const mergeProjectScales = (
  project: BaseProject,
  scales: ScaleState
): BaseProject => mergeBaseProjects(project, { scales });

// Merge the patterns of a project
export const mergeProjectPatterns = (
  project: BaseProject,
  patterns: PatternState
): BaseProject => mergeBaseProjects(project, { patterns });

// Merge the poses of a project
export const mergeProjectPoses = (
  project: BaseProject,
  poses: PoseState
): BaseProject => mergeBaseProjects(project, { poses });

interface ProjectMergeOptions {
  mergeMotifs?: boolean;
  mergeTracks?: boolean;
  mergeClips?: boolean;
}

// Merge two safe projects together and create a new base project
export const mergeBaseProjects = (
  baseProject: SafeBaseProject,
  incomingProject: SafeBaseProject,
  options: ProjectMergeOptions = {
    mergeMotifs: true,
    mergeTracks: true,
    mergeClips: true,
  }
): BaseProject => {
  const p1 = baseProject;
  const p2 = incomingProject;
  const mm = options.mergeMotifs;
  const mt = options.mergeTracks && mm;
  const mc = options.mergeClips && mt;

  // Sanitize the scales
  let scales = mergeStates(p1?.scales, mm ? p2?.scales : undefined);

  // Sanitize the patterns
  let patterns = mergeStates(p1?.patterns, mm ? p2?.patterns : undefined);

  // Sanitize the poses
  let poses = mergeStates(p1?.poses, mm ? p2?.poses : undefined);

  // Sanitize the tracks
  let tracks = mergeStates(p1?.tracks, mt ? p2?.tracks : undefined);

  // Make sure that instruments have pattern tracks
  let instruments = mergeStates(
    p1?.instruments,
    mt ? p2?.instruments : undefined,
    isInstrument
  );

  // Make sure that pattern clips have valid tracks and patterns
  let patternClips = mergeStates(
    p1?.patternClips,
    mc ? p2?.patternClips : undefined
  );

  // Make sure that pose clips have valid tracks and poses
  let poseClips = mergeStates(p1?.poseClips, mc ? p2?.poseClips : undefined);

  // Remove all scale tracks with no scales
  tracks = filterEntityState(tracks, (t) => {
    if (t.type === "scale") {
      const hasScale = isIdInState(scales, t.scaleId);
      const hasParent = !t.parentId || isIdInState(tracks, t.parentId);
      return hasScale && hasParent;
    } else {
      const hasInstrument = isIdInState(instruments, t.instrumentId);
      const hasParent = !t.parentId || isIdInState(tracks, t.parentId);
      return hasInstrument && hasParent;
    }
  });

  // Remove all instruments that don't have a track
  instruments = filterEntityState(instruments, (i) => {
    const hasPatternTrack = isIdInState(tracks, i.trackId);
    return hasPatternTrack;
  });

  // Remove all scales that don't have a valid track or clip
  scales = filterEntityState(scales, (s) => {
    const hasTrack = !s.trackId || isIdInState(tracks, s.trackId);
    return hasTrack;
  });

  // Remove all patterns that don't have a valid track or clip
  patterns = filterEntityState(patterns, (p) => {
    const hasClips = isEntityInState(patternClips, (c) => c.patternId === p.id);
    const hasTrack = !p.trackId || isIdInState(tracks, p.trackId);
    return hasClips && hasTrack;
  });

  // Remove all pattern clips that don't have a pattern or track
  patternClips = filterEntityState(patternClips, (c) => {
    const hasPattern = isIdInState(patterns, c.patternId);
    const hasTrack = isIdInState(tracks, c.trackId);
    return hasPattern && hasTrack;
  });

  // Remove all poses that don't have any clips
  poses = filterEntityState(poses, (p) => {
    const hasClips = isEntityInState(poseClips, (c) => c.poseId === p.id);
    const hasTrack = !p.trackId || isIdInState(tracks, p.trackId);
    return hasClips && hasTrack;
  });

  // Remove all pose clips that don't have a pose or track
  poseClips = filterEntityState(poseClips, (c) => {
    const hasPose = isIdInState(poses, c.poseId);
    const hasTrack = isIdInState(tracks, c.trackId);
    return hasPose && hasTrack;
  });

  // Make sure that portals have valid tracks
  const portals = mergeStates(p1?.portals, p2?.portals, isPortal);

  // Update the metadata with the latest timestamp
  const meta = merge({}, defaultProjectMetadata, p1?.meta, {
    lastUpdated: moment().format(),
  });

  // Merge the rest of the project
  const timeline = merge({}, defaultTimeline, p1?.timeline);
  const transport = merge({}, defaultTransport, p1?.transport);

  // Return the new base project
  return {
    meta,
    tracks,
    scales,
    patterns,
    poses,
    patternClips,
    poseClips,
    portals,
    instruments,
    timeline,
    transport,
  };
};

/** Sanitize the project and clear the undo history. */
export const sanitizeProject = (project: SafeProject): Project => ({
  _latestUnfiltered: sanitizeBaseProject(project?._latestUnfiltered),
  group: project?.group,
  past: [],
  present: sanitizeBaseProject(project?.present),
  future: [],
});

/** Update the project with a newest timestamp */
export const timestampProject = (project: Project): Project => ({
  ...project,
  present: {
    ...project.present,
    meta: {
      ...project.present.meta,
      lastUpdated: moment().format(),
    },
  },
});

/** Returns true if a project has not been changed from default settings. */
export const isProjectEmpty = (project: Project) => {
  // Check that nothing has been added
  if (selectTrackIds(project).length !== 0) return false;
  if (selectInstrumentIds(project).length !== 0) return false;
  if (selectPatternIds(project).length !== 0) return false;
  if (selectPoseIds(project).length !== 0) return false;
  if (selectScaleIds(project).length !== 0) return false;
  if (selectPatternClipIds(project).length !== 0) return false;
  if (selectPoseClipIds(project).length !== 0) return false;
  if (selectPortalIds(project).length !== 0) return false;

  // Check default settings
  return true;
};
