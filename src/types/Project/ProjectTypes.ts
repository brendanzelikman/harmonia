import { nanoid } from "@reduxjs/toolkit";
import { defaultClipState } from "redux/Clip";
import { defaultInstrumentState } from "redux/Instrument";
import { defaultPatternState } from "redux/Pattern";
import { defaultPatternTrackState } from "redux/PatternTrack";
import { defaultScaleState } from "redux/Scale";
import { defaultScaleTrackState } from "redux/ScaleTrack";
import { defaultTranspositionState } from "redux/Transposition";
import { RootState } from "redux/store";
import { defaultEditor, isEditor } from "types/Editor";
import { defaultTimeline, isTimeline } from "types/Timeline";
import { defaultTrackHierarchy } from "types/TrackHierarchy";
import { defaultTransport, isTransport } from "types/Transport";
import { isNormalizedState } from "types/util";

/**
 * The `ProjectMetadata` interface contains general, high-level info.
 * @property `id` - The ID of the project.
 * @property `name` - The name of the project.
 * @property `dateCreated` - The date the project was created.
 * @property `lastUpdated` - The date the project was last updated.
 */
export interface ProjectMetadata {
  id: string;
  name: string;
  dateCreated: string;
  lastUpdated: string;
}

/** Initialize new metadata for a project. */
export const initializeProjectMetadata = (): ProjectMetadata => ({
  id: `harmonia-project-${nanoid()}`,
  name: "New Project",
  dateCreated: new Date().toISOString(),
  lastUpdated: new Date().toISOString(),
});

/** The Project type is exactly equal to the Redux state. */
export type Project = RootState;

/** The default project. */
export const defaultProject: Project = {
  meta: initializeProjectMetadata(),
  transport: defaultTransport,
  timeline: defaultTimeline,
  editor: defaultEditor,
  scales: { present: defaultScaleState, past: [], future: [] },
  patterns: { present: defaultPatternState, past: [], future: [] },
  arrangement: {
    present: {
      scaleTracks: defaultScaleTrackState,
      patternTracks: defaultPatternTrackState,
      instruments: defaultInstrumentState,
      clips: defaultClipState,
      transpositions: defaultTranspositionState,
      hierarchy: defaultTrackHierarchy,
    },
    past: [],
    future: [],
  },
};

/** Creates a new project using the given template */
export const initializeProject = (
  template: Project = defaultProject
): Project => {
  const meta = initializeProjectMetadata();
  if (template.meta.name !== "New Project") {
    meta.name = `${template.meta.name} Copy`;
  }
  return { ...template, meta };
};

/**
 * Checks if a given object is of type `Project`.
 * @param obj The object to check.
 * @returns True if the object is a `Project`, otherwise false.
 */
export const isProjectMetaData = (obj: unknown): obj is ProjectMetadata => {
  const candidate = obj as ProjectMetadata;
  return (
    candidate?.id !== undefined &&
    candidate?.name !== undefined &&
    candidate?.dateCreated !== undefined &&
    candidate?.lastUpdated !== undefined
  );
};

export const isProject = (obj: unknown): obj is Project => {
  const candidate = obj as Project;
  if (!candidate) return false;

  // Validate the arrangement
  const arrangement = candidate.arrangement?.present;
  if (!arrangement) return false;
  if (!isNormalizedState(arrangement.clips)) return false;
  if (!isNormalizedState(arrangement.transpositions)) return false;
  if (!isNormalizedState(arrangement.patternTracks)) return false;
  if (!isNormalizedState(arrangement.scaleTracks)) return false;

  // Validate the scales
  const scales = candidate.scales?.present;
  if (!isNormalizedState(scales)) return false;

  // Validate the patterns
  const patterns = candidate.patterns?.present;
  if (!isNormalizedState(patterns)) return false;

  // Validate the rest of the state
  if (!isTransport(candidate.transport)) return false;
  if (!isTimeline(candidate.timeline)) return false;
  if (!isEditor(candidate.editor)) return false;
  if (!isProjectMetaData(candidate.meta)) return false;

  // Return true if all validations pass
  return true;
};
