import { Background } from "components/Background";
import { Navbar } from "features/Navbar/Navbar";
import { useRoute } from "app/router";
import { useProject } from "hooks/useProject";
import { useWindow } from "hooks/useWindow";
import DemosPage from "features/Demos/Demos";
import PlaygroundPage from "features/Playground/Playground";
import ProjectPage from "features/Projects/Projects";
import SamplePage from "features/Samples/Samples";

export function HomePage() {
  const view = useRoute();
  useProject();
  useWindow();
  return (
    <div className="size-full relative">
      <Navbar />
      {view !== "playground" && <Background />}
      <div className="size-full pt-nav total-center-col">
        {components[view as View]}
      </div>
    </div>
  );
}

const components = {
  projects: <ProjectPage />,
  demos: <DemosPage />,
  samples: <SamplePage />,
  playground: <PlaygroundPage />,
} as const;

export type View = keyof typeof components;
