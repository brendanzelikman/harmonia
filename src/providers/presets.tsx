import { getUserDatabase } from "./idb/database";
import { PRESET_STORE } from "utils/constants";
import { pick } from "lodash";
import { PresetScaleList, PresetScaleMap } from "presets/scales";
import { PresetPatternList, PresetPatternMap } from "presets/patterns";
import { PresetPoseList } from "presets/poses";
import { BaseProject } from "providers/store";
import { defaultBaseProject } from "types/Project/ProjectTypes";
import {
  mergeProjectPatterns,
  mergeProjectPoses,
  mergeBaseProjects,
  mergeProjectScales,
} from "types/Project/ProjectFunctions";
import { createContext, ReactNode, useEffect, useState } from "react";
import { useAuthentication } from "./authentication";

// A preset can be constructed from a selection of project fields
const presetFields = [
  "patternTracks",
  "scaleTracks",
  "instruments",
  "motifs",
  "clips",
] as const;
export type PresetProject = Pick<BaseProject, (typeof presetFields)[number]>;
export const defaultPresetProject: PresetProject = pick(
  defaultBaseProject,
  presetFields
);

export const PresetContext = createContext<PresetProject>(defaultPresetProject);

export const PresetProvider = (props: { children: ReactNode }) => {
  const { uid } = useAuthentication();
  const [value, setValue] = useState<PresetProject>(defaultPresetProject);

  // Update the preset project when the user changes
  useEffect(() => {
    const updatePresets = async () => {
      const project = await getPresetProjectFromDB(uid);
      setValue(project);
    };
    updatePresets();
  }, [uid]);

  return (
    <PresetContext.Provider value={value}>
      {props.children}
    </PresetContext.Provider>
  );
};

/** Get the preset project as a promise. */
export async function getPresetProjectFromDB(
  uid?: string
): Promise<PresetProject> {
  if (!uid) return defaultBaseProject;
  let project = defaultBaseProject;

  // Read in every preset project and try to merge their values
  const db = await getUserDatabase(uid);
  const presetProjects = await db.getAll(PRESET_STORE);
  for (const preset of presetProjects) {
    project = mergeBaseProjects(project, preset);
  }

  // Return only the fields that are relevant to a preset
  return pick(project, presetFields);
}

// Add a preset to the database
export async function addPresetProjectToDB(uid: string, preset: PresetProject) {
  const db = await getUserDatabase(uid);
  await db.put(PRESET_STORE, preset);
}

// Remove all presets from the database
export async function removePresetProjectFromDB(uid: string) {
  const db = await getUserDatabase(uid);
  await db.clear(PRESET_STORE);
}

// Add the default presets to the database
export async function addDefaultPresetsToDB(uid: string) {
  let project = defaultBaseProject;
  project = mergeProjectScales(project, {
    entities: PresetScaleMap,
    ids: PresetScaleList.map((scale) => scale.id),
  });
  project = mergeProjectPatterns(project, {
    entities: PresetPatternMap,
    ids: PresetPatternList.map((pattern) => pattern.id),
  });
  project = mergeProjectPoses(project, {
    entities: {},
    ids: PresetPoseList.map((pose) => pose.id),
  });
  const db = await getUserDatabase(uid);
  await db.put(PRESET_STORE, project);
}
