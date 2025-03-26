import { useCustomEventListener } from "hooks/useCustomEventListener";
import { getProjectsFromDB } from "providers/idb/projects";
import { useCallback, useEffect, useState } from "react";
import { useRouterPath } from "router";
import { UPDATE_PROJECTS } from "types/Project/ProjectThunks";
import { Project } from "types/Project/ProjectTypes";

export const useUserProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const view = useRouterPath();

  // Update the projects directly from the database
  const updateProjects = useCallback(() => {
    getProjectsFromDB().then(setProjects);
    return () => {};
  }, []);

  // Listen for signals and view changes
  useCustomEventListener(UPDATE_PROJECTS, updateProjects);
  useEffect(updateProjects, [view]);

  return projects;
};
