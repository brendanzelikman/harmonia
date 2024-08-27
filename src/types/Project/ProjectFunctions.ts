import { defaultBaseProject, Project, SafeProject } from "./ProjectTypes";
import { defaultProjectMetadata } from "../Meta/MetaTypes";
import { isEqual, merge } from "lodash";
import { isInstrument } from "types/Instrument/InstrumentTypes";
import { isPattern, PatternState } from "types/Pattern/PatternTypes";
import { isPose, PoseState } from "types/Pose/PoseTypes";
import { isScaleObject, ScaleState } from "types/Scale/ScaleTypes";
import { defaultTimeline } from "types/Timeline/TimelineTypes";
import { defaultTransport } from "types/Transport/TransportTypes";
import { defaultEditor } from "types/Editor/EditorTypes";
import { isIdInState, mergeStates } from "types/util";
import { BaseProject, SafeBaseProject } from "providers/store";
import {
  ClipState,
  isIPatternClip,
  isIPoseClip,
  isIScaleClip,
} from "types/Clip/ClipTypes";
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
import { TrackId } from "types/Track/TrackTypes";
import { MotifState } from "types/Motif/MotifTypes";

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
  const mergeMotifs = options.mergeMotifs;
  const mergeTracks = options.mergeTracks && mergeMotifs;
  const mergeClips = options.mergeClips && mergeTracks;

  // Sanitize the scales
  const scales = mergeStates(
    m1?.scale,
    mergeMotifs ? m2?.scale : undefined,
    isScaleObject
  );

  // Sanitize the patterns
  const patterns = mergeStates(
    m1?.pattern,
    mergeMotifs ? m2?.pattern : undefined,
    isPattern
  );

  // Sanitize the poses
  const poses = mergeStates(
    m1?.pose,
    mergeMotifs ? m2?.pose : undefined,
    isPose
  );

  // Group the motifs together
  const motifs: MotifState = { scale: scales, pattern: patterns, pose: poses };

  // Make sure that scale tracks have scales
  const scaleTracks = mergeStates(
    p1?.scaleTracks,
    mergeTracks ? p2?.scaleTracks : undefined,
    (obj: unknown) => isIScaleTrack(obj) && isIdInState(scales, obj.scaleId)
  );

  // Sanitize the pattern tracks
  const patternTracks = mergeStates(
    p1?.patternTracks,
    mergeTracks ? p2?.patternTracks : undefined,
    isIPatternTrack
  );

  // Make sure that instruments have pattern tracks
  const instruments = mergeStates(
    p1?.instruments,
    mergeTracks ? p2?.instruments : undefined,
    (_: unknown) => isInstrument(_) && isIdInState(patternTracks, _.trackId)
  );

  // Return true if a clip is in the state
  const isClipInState = (clip: { trackId: TrackId }) => {
    if (isIPatternClip(clip)) {
      return isIdInState(patternTracks, clip.trackId);
    } else {
      return (
        isIdInState(patternTracks, clip.trackId) ||
        isIdInState(scaleTracks, clip.trackId)
      );
    }
  };

  // Make sure that scale clips have valid tracks and scales
  const scaleClips = mergeStates(
    p1?.clips?.scale,
    mergeClips ? p2?.clips?.scale : undefined,
    (clip: unknown) =>
      isIScaleClip(clip) &&
      isClipInState(clip) &&
      isIdInState(scales, clip.scaleId)
  );

  // Make sure that pattern clips have valid tracks and patterns
  const patternClips = mergeStates(
    p1?.clips?.pattern,
    mergeClips ? p2?.clips?.pattern : undefined,
    (clip: unknown) =>
      isIPatternClip(clip) &&
      isClipInState(clip) &&
      isIdInState(patterns, clip.patternId)
  );

  // Make sure that pose clips have valid tracks and poses
  const poseClips = mergeStates(
    p1?.clips?.pose,
    mergeClips ? p2?.clips?.pose : undefined,
    (clip: unknown) =>
      isIPoseClip(clip) &&
      isClipInState(clip) &&
      isIdInState(poses, clip.poseId)
  );

  // Group the clips together
  const clips: ClipState = {
    scale: scaleClips,
    pattern: patternClips,
    pose: poseClips,
  };

  // Make sure that portals have valid tracks
  const portals = mergeStates(
    p1?.portals,
    p2?.portals,
    (clip: unknown) => isPortal(clip) && isClipInState(clip)
  );

  // Update the metadata with the latest timestamp
  const meta = merge({}, defaultProjectMetadata, p1?.meta, {
    lastUpdated: new Date().toISOString(),
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
      lastUpdated: new Date().toISOString(),
    },
  },
});

/** Returns true if a project has not been changed from default settings. */
export const isProjectEmpty = (project: Project) => {
  if (project.past.length !== 0) return false;
  if (project.future.length !== 0) return false;

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
  if (!isEqual(project.present.timeline, defaultTimeline)) return false;
  if (!isEqual(project.present.transport, defaultTransport)) return false;
  if (!isEqual(project.present.editor, defaultEditor)) return false;

  return true;
};
