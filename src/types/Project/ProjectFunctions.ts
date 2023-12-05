import { clearUndoableHistory } from "utils/undoableHistory";
import { Project } from "./ProjectTypes";
import { defaultTimeline, getIdleTimeline } from "types/Timeline";
import { defaultTransport, getIdleTransport } from "types/Transport";
import { difference, isEqual } from "lodash";
import { defaultEditor, getIdleEditor } from "types/Editor";
import { defaultInstrument } from "types/Instrument";
import { defaultPattern } from "types/Pattern";
import { defaultPose } from "types/Pose";
import { defaultPatternTrack, defaultScaleTrack } from "types/Track";
import { defaultScale, defaultScaleTrackScale } from "types/Scale";

/** Sanitize the project, clearing undo history and idling the user. */
export const sanitizeProject = (project: Project): Project => ({
  ...project,
  scales: clearUndoableHistory(project.scales),
  patterns: clearUndoableHistory(project.patterns),
  arrangement: clearUndoableHistory(project.arrangement),
  timeline: getIdleTimeline(project.timeline),
  transport: getIdleTransport(project.transport),
  editor: getIdleEditor(project.editor),
});

/** Returns true if a project has not been changed from default settings. */
export const isProjectEmpty = (project: Project) => {
  // Check that the default scale has not changed
  const scales = project.scales.present;
  if (!isEqual(scales.byId[defaultScale.id], defaultScaleTrackScale))
    return false;

  // Check that no scales have been added
  const uniqueScales = difference(scales.allIds, [defaultScale.id]);
  if (uniqueScales.length !== 0) return false;

  // Check that the default pattern has not changed
  const patterns = project.patterns.present;
  if (!isEqual(patterns.byId[defaultPattern.id], defaultPattern)) return false;

  // Check that no patterns have been added
  const uniquePatterns = difference(patterns.allIds, [defaultPattern.id]);
  if (uniquePatterns.length !== 0) return false;

  // Check that the default pose has not changed
  const poses = project.poses.present;
  if (!isEqual(poses.byId[defaultPose.id], defaultPose)) return false;

  // Check that no poses have been added
  const uniquePoses = difference(poses.allIds, [defaultPose.id]);
  if (uniquePoses.length !== 0) return false;

  // Check that the arrangement history is empty
  const arrangement = project.arrangement.present;

  // Check that the default tracks have not changed
  const pt = defaultPatternTrack;
  const st = defaultScaleTrack;
  if (!isEqual(arrangement.tracks.byId[pt.id], pt)) return false;
  if (!isEqual(arrangement.tracks.byId[st.id], st)) return false;

  // Check that no tracks have been added
  const uniqueTracks = difference(arrangement.tracks.allIds, [pt.id, st.id]);
  if (uniqueTracks.length !== 0) return false;

  // Check that the default instrument has not changed
  const i = defaultInstrument;
  if (!isEqual(arrangement.instruments.byId[i.id], i)) return false;

  // Check that no instruments have been added
  const uniqueInstruments = difference(arrangement.instruments.allIds, [i.id]);
  if (uniqueInstruments.length !== 0) return false;

  // Check that no media has been added
  if (arrangement.clips.allIds.length !== 0) return false;
  if (arrangement.portals.allIds.length !== 0) return false;

  // Check the timeline
  if (!isEqual(project.timeline, defaultTimeline)) return false;

  // Check the transport
  if (!isEqual(project.transport, defaultTransport)) return false;

  // Check the editor
  if (!isEqual(project.editor, defaultEditor)) return false;

  return true;
};
