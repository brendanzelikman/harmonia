import { useProjectFetcher } from "./useProjectFetcher";

export const useDemoProjects = () => {
  const demoPaths: string[] = [];
  const demoProjects = useProjectFetcher({ filePaths: demoPaths });
  return demoProjects;
};
