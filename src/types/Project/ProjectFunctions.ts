import { clearUndoableHistory } from "utils/undoableHistory";
import { Project } from "./ProjectTypes";
import { getIdleTimeline } from "types/Timeline";
import { getIdleTransport } from "types/Transport";

/** Sanitize the project, clearing undo history and idling the user. */
export const sanitizeProject = (project: Project): Project => ({
  ...project,
  scales: clearUndoableHistory(project.scales),
  patterns: clearUndoableHistory(project.patterns),
  arrangement: clearUndoableHistory(project.arrangement),
  timeline: getIdleTimeline(project.timeline),
  transport: getIdleTransport(project.transport),
});
