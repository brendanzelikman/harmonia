import { defaultBaseProject, Project, SafeProject } from "./ProjectTypes";
import { defaultProjectMetadata } from "../Meta/MetaTypes";
import { merge } from "lodash";
import { isInstrument } from "types/Instrument/InstrumentTypes";
import { PatternState } from "types/Pattern/PatternTypes";
import { PoseState } from "types/Pose/PoseTypes";
import { ScaleState } from "types/Scale/ScaleTypes";
import { defaultTimeline } from "types/Timeline/TimelineTypes";
import { defaultTransport } from "types/Transport/TransportTypes";
import { defaultEditor } from "types/Editor/EditorTypes";
import {
  filterEntityState,
  isEntityInState,
  isIdInState,
  mergeStates,
} from "types/util";
import { BaseProject, SafeBaseProject } from "providers/store";
import { CLIP_TYPES, ClipState } from "types/Clip/ClipTypes";
import { isPortal } from "types/Portal/PortalTypes";
import { selectScaleIds } from "types/Scale/ScaleSelectors";
import { selectPatternIds } from "types/Pattern/PatternSelectors";
import { selectPoseIds } from "types/Pose/PoseSelectors";
import {
  selectPatternClipIds,
  selectPoseClipIds,
  selectScaleClipIds,
} from "types/Clip/ClipSelectors";
import { selectPortalIds } from "types/Portal/PortalSelectors";
import { selectTrackIds } from "types/Track/TrackSelectors";
import { selectInstrumentIds } from "types/Instrument/InstrumentSelectors";
import { isIPatternTrack } from "types/Track/PatternTrack/PatternTrackTypes";
import { isIScaleTrack } from "types/Track/ScaleTrack/ScaleTrackTypes";
import { MotifState } from "types/Motif/MotifTypes";
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
): BaseProject => mergeBaseProjects(project, { motifs: { scale: scales } });

// Merge the patterns of a project
export const mergeProjectPatterns = (
  project: BaseProject,
  patterns: PatternState
): BaseProject => mergeBaseProjects(project, { motifs: { pattern: patterns } });

// Merge the poses of a project
export const mergeProjectPoses = (
  project: BaseProject,
  poses: PoseState
): BaseProject => mergeBaseProjects(project, { motifs: { pose: poses } });

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
  const m1 = baseProject?.motifs;
  const m2 = incomingProject?.motifs;
  const c1 = baseProject?.clips;
  const c2 = incomingProject?.clips;
  const mm = options.mergeMotifs;
  const mt = options.mergeTracks && mm;
  const mc = options.mergeClips && mt;

  // Sanitize the scales
  let scales = mergeStates(m1?.scale, mm ? m2?.scale : undefined);

  // Sanitize the patterns
  let patterns = mergeStates(m1?.pattern, mm ? m2?.pattern : undefined);

  // Sanitize the poses
  let poses = mergeStates(m1?.pose, mm ? m2?.pose : undefined);

  // Make sure that scale tracks have scales
  let scaleTracks = mergeStates(
    p1?.scaleTracks,
    mt ? p2?.scaleTracks : undefined,
    isIScaleTrack
  );

  // Sanitize the pattern tracks
  let patternTracks = mergeStates(
    p1?.patternTracks,
    mt ? p2?.patternTracks : undefined,
    isIPatternTrack
  );

  // Make sure that instruments have pattern tracks
  let instruments = mergeStates(
    p1?.instruments,
    mt ? p2?.instruments : undefined,
    isInstrument
  );

  // Make sure that scale clips have valid tracks and scales
  let scaleClips = mergeStates(c1?.scale, mc ? c2?.scale : undefined);

  // Make sure that pattern clips have valid tracks and patterns
  let patternClips = mergeStates(c1?.pattern, mc ? c2?.pattern : undefined);

  // Make sure that pose clips have valid tracks and poses
  let poseClips = mergeStates(c1?.pose, mc ? c2?.pose : undefined);

  // Remove all scale tracks with no scales
  scaleTracks = filterEntityState(scaleTracks, (t) => {
    const hasScale = isIdInState(scales, t.scaleId);
    const hasParent = !t.parentId || isIdInState(scaleTracks, t.parentId);
    return hasScale && hasParent;
  });

  // Remove all pattern tracks with no instruments
  patternTracks = filterEntityState(patternTracks, (t) => {
    const hasInstrument = isIdInState(instruments, t.instrumentId);
    const hasParent = !t.parentId || isIdInState(scaleTracks, t.parentId);
    return hasInstrument && hasParent;
  });

  // Remove all instruments that don't have a track
  instruments = filterEntityState(instruments, (i) => {
    const hasPatternTrack = isIdInState(patternTracks, i.trackId);
    return hasPatternTrack;
  });

  // Remove all scales that don't have a valid track or clip
  scales = filterEntityState(scales, (s) => {
    const hasClips = isEntityInState(scaleClips, (c) => c.scaleId === s.id);
    const hasTrack = !s.trackId || isIdInState(scaleTracks, s.trackId);
    return hasTrack || hasClips;
  });

  // Remove all scale clips that don't have a valid scale or track
  scaleClips = filterEntityState(scaleClips, (c) => {
    const hasScale = isIdInState(scales, c.scaleId);
    const hasTrack =
      isIdInState(scaleTracks, c.trackId) ||
      isIdInState(patternTracks, c.trackId);
    return hasScale && hasTrack;
  });

  // Remove all patterns that don't have a valid track or clip
  patterns = filterEntityState(patterns, (p) => {
    const hasClips = isEntityInState(patternClips, (c) => c.patternId === p.id);
    const hasTrack = !p.trackId || isIdInState(patternTracks, p.trackId);
    return hasClips && hasTrack;
  });

  // Remove all pattern clips that don't have a pattern or track
  patternClips = filterEntityState(patternClips, (c) => {
    const hasPattern = isIdInState(patterns, c.patternId);
    const hasTrack = isIdInState(patternTracks, c.trackId);
    return hasPattern && hasTrack;
  });

  // Remove all poses that don't have any clips
  poses = filterEntityState(poses, (p) => {
    const hasClips = isEntityInState(poseClips, (c) => c.poseId === p.id);
    const hasTrack =
      !p.trackId ||
      isIdInState(patternTracks, p.trackId) ||
      isIdInState(scaleTracks, p.trackId);
    return hasClips && hasTrack;
  });

  // Remove all pose clips that don't have a pose or track
  poseClips = filterEntityState(poseClips, (c) => {
    const hasPose = isIdInState(poses, c.poseId);
    const hasTrack =
      isIdInState(patternTracks, c.trackId) ||
      isIdInState(scaleTracks, c.trackId);
    return hasPose && hasTrack;
  });

  // Group the clips together
  const clips: ClipState = {
    scale: scaleClips,
    pattern: patternClips,
    pose: poseClips,
  };

  // Close all clips
  for (const type of CLIP_TYPES) {
    for (const id of clips[type].ids) {
      if (clips[type].entities[id]?.isOpen) {
        clips[type].entities[id].isOpen = false;
      }
    }
  }

  // Group the motifs together
  const motifs: MotifState = { scale: scales, pattern: patterns, pose: poses };

  // Make sure that portals have valid tracks
  const portals = mergeStates(p1?.portals, p2?.portals, isPortal);

  // Update the metadata with the latest timestamp
  const meta = merge({}, defaultProjectMetadata, p1?.meta, {
    lastUpdated: moment().format(),
  });

  // Merge the rest of the project
  const timeline = merge({}, defaultTimeline, p1?.timeline);
  const transport = merge({}, defaultTransport, p1?.transport);
  const editor = merge({}, defaultEditor, p1?.editor);

  // Return the new base project
  return {
    meta,
    patternTracks,
    scaleTracks,
    motifs,
    clips,
    portals,
    instruments,
    timeline,
    transport,
    editor,
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
  if (selectScaleClipIds(project).length !== 0) return false;
  if (selectPortalIds(project).length !== 0) return false;

  // Check default settings
  return true;
};
