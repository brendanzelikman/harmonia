import { isEqual } from "lodash";
import { useEffect, useMemo, useState } from "react";
import { Project } from "types/Project";

interface ProjectFetcherProps {
  projects?: Project[];
  filePaths?: string[];
}

export function useProjectFetcher(props: ProjectFetcherProps): Project[] {
  const incomingProjects = props.projects;
  const incomingPaths = props.filePaths;
  const hasProjects = !!incomingProjects?.length;
  const hasPaths = useMemo(() => !!incomingPaths?.length, [incomingPaths]);

  const [projects, setProjects] = useState(incomingProjects);
  const [loaded, setLoaded] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Update the projects if they change
  useEffect(() => {
    if (incomingProjects && !isEqual(props.projects, projects)) {
      setProjects(incomingProjects);
      setLoaded(true);
    }
  }, [incomingProjects, projects]);

  // Start fetching if we have paths but no projects
  const shouldFetch = !!(!hasProjects && hasPaths && !loaded && !fetching);
  useEffect(() => {
    if (shouldFetch) setFetching(true);
  }, [shouldFetch]);

  // Fetch the projects by path
  useEffect(() => {
    if (!fetching) return;
    const fetchProjects = async () => {
      Promise.all(incomingPaths!.map((p) => fetch(p).then((res) => res.json())))
        .then(setProjects)
        .then(() => {
          setFetching(false);
          setLoaded(true);
        });
    };
    fetchProjects();
  }, [fetching]);

  // Return the projects once they are loaded
  if (!loaded) return [];
  return projects ?? [];
}
