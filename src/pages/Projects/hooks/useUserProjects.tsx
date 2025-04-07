import { useCustomEventListener } from "hooks/useCustomEventListener";
import { getProjectsFromDB } from "providers/projects";
import { useCallback, useEffect, useState } from "react";
import { useRoute } from "router";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { Project } from "types/Project/ProjectTypes";

export const useUserProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const view = useRoute();

  // Update the projects directly from the database
  const updateProjects = useCallback(() => {
    getProjectsFromDB().then(setProjects);
    return () => {};
  }, []);

  // Listen for signals and view changes
  useCustomEventListener(UPDATE_PROJECT_EVENT, updateProjects);
  useEffect(updateProjects, [view]);

  return projects;
};
