import { useProjectFetcher } from "./useProjectFetcher";

const DEMO_PATHS = [
  "demos/romanesca.json",
  "demos/prelude.json",
  "demos/moonlight.json",
  "demos/beethoven.json",
  "demos/waves.json",
];

export const useDemoProjects = () => {
  const demoProjects = useProjectFetcher({ filePaths: DEMO_PATHS });
  return { projects: demoProjects, paths: DEMO_PATHS };
};
