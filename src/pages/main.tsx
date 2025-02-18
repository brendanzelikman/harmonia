import classNames from "classnames";
import { Docs } from "features/Docs/Docs";
import { useProjectList } from "features/Projects";
import { useParams } from "react-router-dom";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { getProjectsFromDB } from "providers/idb";
import { useProjectFetcher } from "features/Projects/hooks/useProjectFetcher";
import { TourBackground } from "features/Tour";
import { useProjectSelector } from "types/hooks";
import { useBrowserTitle } from "hooks/useBrowserTitle";
import { useAuth } from "providers/auth";

import LandingBackground from "assets/images/landing-background.png";
import { Project } from "types/Project/ProjectTypes";
import { UserProfile } from "features/Profile/UserProfile";
import { Playground } from "features/Playground/Playground";
import { Navbar } from "features/Navbar/Navbar";
import { selectProjectName } from "types/Meta/MetaSelectors";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { UPDATE_PROJECTS } from "types/Project/ProjectThunks";

export type View = "projects" | "demos" | "docs" | "profile" | "playground";
export const views = [
  "projects",
  // "demos",
  // "docs",
  // "profile",
  "playground",
] as const;

/* The main page of the app */
interface MainPageProps {
  view?: View;
}
export function MainPage(props: MainPageProps) {
  const { uid, isAtLeastRank } = useAuth();
  const params = useParams<{ view: View }>();
  const view = props.view || params.view || "projects";
  const [projects, setProjects] = useState<Project[]>([]);
  const demoPaths: string[] = [];

  // Update the list of projects based on the authentication status
  const updateProjects = async () => {
    const fetchedProjects = await getProjectsFromDB();
    setProjects(fetchedProjects);
  };

  // Update whenever the database or view changes
  useCustomEventListener(UPDATE_PROJECTS, updateProjects);
  useEffect(() => {
    updateProjects();
  }, [view, uid]);

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
    if (view === "demos") return `Harmonia • Demos`;
    if (view === "docs") return "Harmonia • Docs";
    if (view === "profile") return "Harmonia • Profile";
    if (view === "playground") return `Harmonia • ${projectName}`;
    return "Harmonia";
  }, [view, projectName, projectCount, demoCount]);

  useBrowserTitle(title);

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

  // The background appears for projects and demos
  const MainBackground = view !== "playground" && (
    <img
      src={LandingBackground}
      className={
        "fixed h-screen landing-background select-none opacity-50 -z-10"
      }
    />
  );

  // Render the main page
  return (
    <div className={"w-full h-screen relative overflow-hidden"}>
      <Navbar view={view} />
      {MainBackground}
      <TourBackground />
      <div
        className={classNames(
          "w-full h-full pt-nav flex flex-col items-center",
          "text-white font-nunito",
          { "pt-nav": view !== "playground" }
        )}
      >
        {isAtLeastRank("maestro") && (
          <ViewWrapper view="projects">{ProjectList()}</ViewWrapper>
        )}
        <ViewWrapper view="demos">{DemoList()}</ViewWrapper>
        <ViewWrapper view="docs">{Docs()}</ViewWrapper>
        <ViewWrapper view="profile">
          <UserProfile />
        </ViewWrapper>
        <ViewWrapper view="playground">
          <Playground />
        </ViewWrapper>
      </div>
    </div>
  );
}
