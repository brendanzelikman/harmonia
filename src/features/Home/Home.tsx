import { Background } from "components/Background";
import { Navbar } from "features/Navbar/Navbar";
import { useRoute } from "app/router";
import { useProject } from "hooks/useProject";
import { useWindow } from "hooks/useWindow";
import DemosPage from "features/Demos/Demos";
import PlaygroundPage from "features/Playground/Playground";
import ProjectPage from "features/Projects/Projects";
import SamplePage from "features/Samples/Samples";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import { DEMOS_BY_KEY } from "lib/demos";
import { loadDemoProject } from "types/Project/ProjectLoaders";

export function HomePage() {
  const navigate = useNavigate();
  const view = useRoute();
  const { id } = useParams();
  useEffect(() => {
    if (view.startsWith("demos") && !!id) {
      const demo = DEMOS_BY_KEY[id];
      if (demo) loadDemoProject(demo.project, () => navigate("/playground"));
    }
  }, [view, id]);
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
