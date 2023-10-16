import { Project } from "./ProjectTypes";

/**
 * Sanitize the project, clearing undo history and idling the user.
 */
export const sanitizeProject = (project: Project): Project => ({
  ...project,
  scales: { past: [], present: project.scales.present, future: [] },
  patterns: { past: [], present: project.patterns.present, future: [] },
  arrangement: {
    past: [],
    present: project.arrangement.present,
    future: [],
  },
  timeline: { ...project.timeline, state: "idle" },
  transport: {
    ...project.transport,
    state: "stopped",
    recording: false,
    downloading: false,
  },
});
