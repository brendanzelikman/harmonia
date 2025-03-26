import { useBrowserTitle } from "hooks/useBrowserTitle";
import { Playground } from "features/Playground/Playground";
import { Navbar } from "features/Navbar/Navbar";
import { ProjectList } from "features/Projects/ProjectList";
import { MainBackground } from "components/MainBackground";
import { useRouterPath } from "router";

export function MainPage() {
  useBrowserTitle();
  const view = useRouterPath();
  return (
    <div className="w-full h-screen relative font-nunito">
      <Navbar />
      <MainBackground />
      <div className="size-full pt-nav total-center-col text-white">
        {view === "projects" && <ProjectList />}
        {view === "playground" && <Playground />}
      </div>
    </div>
  );
}

export type View = "projects" | "demos" | "playground";
export const views = ["projects", "playground"] as const;
