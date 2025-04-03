import { useProjectFetcher } from "./useProjectFetcher";

const DEMO_PATHS = [
  "demos/beethoven.json",
  "demos/conflict.json",
  "demos/moonlight.json",
  "demos/waves.json",
  "demos/prelude.json",
];

export const useDemoProjects = () => {
  const demoProjects = useProjectFetcher({ filePaths: DEMO_PATHS });
  return { projects: demoProjects, paths: DEMO_PATHS };
};
