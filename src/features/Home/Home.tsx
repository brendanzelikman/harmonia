import { ProjectPage } from "features/Projects/Projects";
import { DemosPage } from "../Demos/Demos";
import { SamplePage } from "features/Samples/SamplePage";
import { Background } from "components/Background";
import { Navbar } from "features/Navbar/Navbar";
import { useRoute } from "app/router";
import { PlaygroundPage } from "features/Playground/Playground";
import { useProject } from "hooks/useProject";
import { useWindow } from "hooks/useWindow";

export function HomePage() {
  const view = useRoute();
  useWindow();
  useProject();
  return (
    <div className="size-full relative">
      <Navbar />
      {view !== "playground" && <Background />}
      <div className="size-full pt-nav total-center-col">
        {view === "projects" && <ProjectPage />}
        {view === "demos" && <DemosPage />}
        {view === "samples" && <SamplePage />}
        {view === "playground" && <PlaygroundPage />}
      </div>
    </div>
  );
}

export const views = ["projects", "demos", "samples", "playground"] as const;
