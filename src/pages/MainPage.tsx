import classNames from "classnames";
import { Docs } from "features/Docs";
import { useProjectList } from "features/Projects";
import { Playground } from "../features/Playground";
import { Navbar } from "features/Navbar";
import { useParams } from "react-router-dom";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { useDatabaseCallback, useCustomEventListener } from "hooks";
import { getProjectsFromDB } from "indexedDB";
import { CREATE_PROJECT, DELETE_PROJECT } from "redux/thunks";
import { Project } from "types/Project";

import Nest from "assets/demos/nest.ham";
import Barry from "assets/demos/barry.ham";
import { useProjectFetcher } from "features/Projects/hooks/useProjectFetcher";
import { TourBackground } from "features/Tour";
import { useProjectSelector } from "redux/hooks";
import { selectProjectName } from "redux/Metadata";
import { useBrowserTitle } from "hooks/useBrowserTitle";

export type View = (typeof views)[number];
export const views = ["projects", "demos", "docs", "playground"] as const;
export const viewCount = views.length;

/* The main page of the app */
export function MainPage(props: { view?: View }) {
  const params = useParams<{ view: View }>();
  const view = props.view || params.view || "projects";
  const [projects, setProjects] = useState<Project[]>([]);
  const demoPaths = [Nest, Barry];
  const updateProjects = async () => setProjects(await getProjectsFromDB());

  // Update whenever the database changes
  useDatabaseCallback(updateProjects);
  useCustomEventListener(CREATE_PROJECT, updateProjects);
  useCustomEventListener(DELETE_PROJECT, updateProjects);

  // Get the list of projects
  const fetchedProjects = useProjectFetcher({ projects });
  const fetchedItems = fetchedProjects.map((project) => ({ project }));
  const { List: ProjectList } = useProjectList({ projects: fetchedItems });

  // Get the list of demos
  const demoProjects = useProjectFetcher({ filePaths: demoPaths });
  const demoItems = demoProjects.map((demo, i) => ({
    project: demo,
    filePath: demoPaths[i],
  }));
  const { List: DemoList } = useProjectList({
    projects: demoItems,
    searchingDemos: true,
  });

  // Get information about the projects
  const projectName = useProjectSelector(selectProjectName);
  const projectCount = projects.length;
  const demoCount = demoPaths.length;

  // Get the browser title based on the view
  const title = useMemo(() => {
    if (view === "projects")
      return `Harmonia • Projects (${projectCount} total)`;
    if (view === "demos") return `Harmonia • Demo Projects`;
    if (view === "playground") return `Harmonia • ${projectName}`;
    if (view === "docs") return "Harmonia • Documentation";
    return "Harmonia";
  }, [view, projectName, projectCount, demoCount]);

  useBrowserTitle(title);

  // Add a transition class based on the view
  const transitionClass = classNames(
    "w-full h-full pt-nav flex flex-col items-center",
    "text-white font-nunito",
    { "bg-slate-950/60": view === "docs" },
    { "pt-nav": view !== "playground" }
  );

  // A view wrapper that fades in different views
  const ViewWrapper = useCallback(
    (props: { view: View; children: ReactNode }) => {
      if (props.view !== view) return null;
      return (
        <div className={"transition-all w-full h-full animate-in fade-in"}>
          {props.children}
        </div>
      );
    },
    [view]
  );

  // Render the main page
  return (
    <div className="w-full h-screen relative overflow-hidden">
      <Navbar view={view} />
      <TourBackground />
      <div className={transitionClass}>
        <ViewWrapper view="projects">{ProjectList()}</ViewWrapper>
        <ViewWrapper view="demos">{DemoList()}</ViewWrapper>
        <ViewWrapper view="docs">{Docs()}</ViewWrapper>
        <ViewWrapper view="playground">
          <Playground />
        </ViewWrapper>
      </div>
    </div>
  );
}
