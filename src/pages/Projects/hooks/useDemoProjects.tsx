import { useProjectFetcher } from "./useProjectFetcher";

const DEMO_NAMES = [
  "demos/romanesca.json",
  "demos/prelude.json",
  "demos/moonlight.json",
  "demos/hammerklavier.json",
  "demos/generator.json",
  "demos/waves.json",
];

export const DEMO_BLURBS: Record<string, string> = {
  "demos/romanesca.json": `"A descending pattern in Renaissance music."`,
  "demos/prelude.json": `"A short piece of music in the classical style."`,
  "demos/moonlight.json": `"A few bars from the Moonlight Sonata"`,
  "demos/generator.json": `"A progression generated out of a single pattern."`,
  "demos/hammerklavier.json": `"A progression from the Hammerklavier Sonata"`,
  "demos/waves.json": `"An arpeggio and bassline in motion."`,
};

export const useDemoProjects = () => {
  const demoProjects = useProjectFetcher({ filePaths: DEMO_NAMES });
  return { projects: demoProjects, paths: DEMO_NAMES };
};
