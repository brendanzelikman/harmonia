import { useBrowserTitle } from "hooks/useBrowserTitle";
import { PlaygroundPage } from "playground";
import { Navbar } from "features/Navbar/Navbar";
import { ProjectsPage } from "pages/Projects/ProjectsPage";
import { DemosPage } from "./pages/Demos/DemosPage";
import { SamplesPage } from "pages/Samples/SamplesPage";
import { Background } from "components/Background";
import { useRoute } from "router";

export function MainPage() {
  const view = useRoute();
  useBrowserTitle(view);
  return (
    <div className="size-full relative">
      <Navbar />
      {view !== "playground" && <Background />}
      <div className="size-full pt-nav total-center-col">
        {view === "projects" && <ProjectsPage />}
        {view === "demos" && <DemosPage />}
        {view === "samples" && <SamplesPage />}
        {view === "playground" && <PlaygroundPage />}
      </div>
    </div>
  );
}

export const views = ["projects", "demos", "samples", "playground"] as const;
