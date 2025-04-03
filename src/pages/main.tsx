import { useBrowserTitle } from "hooks/useBrowserTitle";
import { PlaygroundPage } from "pages/Playground/PlaygroundPage";
import { Navbar } from "features/Navbar/Navbar";
import { ProjectsPage } from "pages/Projects/ProjectsPage";
import { DemosPage } from "./Demos/DemosPage";
import { SamplesPage } from "pages/Samples/SamplesPage";
import { HomeBackground } from "pages/components/HomeBackground";
import { useRouterPath } from "router";

export function MainPage() {
  const view = useRouterPath();
  useBrowserTitle(view);
  return (
    <div className="w-full h-screen relative font-nunito">
      <Navbar />
      <HomeBackground />
      <div className="size-full pt-nav total-center-col text-white">
        {view === "projects" && <ProjectsPage />}
        {view === "demos" && <DemosPage />}
        {view === "samples" && <SamplesPage />}
        {view === "playground" && <PlaygroundPage />}
      </div>
    </div>
  );
}

export type View = (typeof views)[number];
export const views = ["projects", "demos", "samples", "playground"] as const;
