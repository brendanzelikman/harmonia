import { defaultBaseProject } from "./ProjectTypes";
import { defaultProjectMetadata } from "../Meta/MetaTypes";
import { merge } from "lodash";
import { isInstrument } from "types/Instrument/InstrumentTypes";
import { PatternState } from "types/Pattern/PatternTypes";
import { PoseState } from "types/Pose/PoseTypes";
import { ScaleState } from "types/Scale/ScaleTypes";
import { defaultTimeline, TimelineStorage } from "types/Timeline/TimelineTypes";
import { defaultTransport } from "types/Transport/TransportTypes";
import {
  filterEntityState,
  isEntityInState,
  isIdInState,
  mergeStates,
} from "types/utils";
import { BaseProject, SafeBaseProject } from "app/reducer";
import dayjs from "dayjs";
import { isScaleTrack, Track } from "types/Track/TrackTypes";
import { PatternClip, PoseClip } from "types/Clip/ClipTypes";
import { defaultGame } from "types/Game/GameTypes";

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
    if (isScaleTrack(t)) {
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
    const hasTrack = isEntityInState<Track>(tracks, (t) => t.scaleId === s.id);
    return hasTrack;
  });

  // Remove all patterns that don't have a valid track or clip
  patterns = filterEntityState(patterns, (p) => {
    const hasClips = isEntityInState<PatternClip>(
      patternClips,
      (c) => c.patternId === p.id
    );
    return hasClips;
  });

  // Remove all pattern clips that don't have a pattern or track
  patternClips = filterEntityState(patternClips, (c) => {
    const hasPattern = isIdInState(patterns, c.patternId);
    const hasTrack = isIdInState(tracks, c.trackId);
    return hasPattern && hasTrack;
  });

  // Remove all poses that don't have any clips
  poses = filterEntityState(poses, (p) => {
    const hasClips = isEntityInState<PoseClip>(
      poseClips,
      (c) => c.poseId === p.id
    );
    return hasClips;
  });

  // Remove all pose clips that don't have a pose or track
  poseClips = filterEntityState(poseClips, (c) => {
    const hasPose = isIdInState(poses, c.poseId);
    const hasTrack = isIdInState(tracks, c.trackId);
    return hasPose && hasTrack;
  });

  // Make sure that portals have valid tracks
  const portals = mergeStates(p1?.portals, p2?.portals);

  // Update the metadata with the latest timestamp
  const meta = merge({}, defaultProjectMetadata, p1?.meta, {
    lastUpdated: dayjs().format(),
  });

  // Merge the rest of the project
  const timeline = {
    ...defaultTimeline,
    cellWidth: p1?.timeline?.cellWidth ?? defaultTimeline.cellWidth,
    cellHeight: p1?.timeline?.cellHeight ?? defaultTimeline.cellHeight,
    subdivision: p1?.timeline?.subdivision ?? defaultTimeline.subdivision,
    storage: (p1?.timeline?.storage ??
      defaultTimeline.storage) as TimelineStorage,
  };
  const transport = merge({}, defaultTransport, p1?.transport);
  const game = merge({}, defaultGame, p1?.game);

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
    game,
  };
};
