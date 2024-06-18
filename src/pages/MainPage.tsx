import classNames from "classnames";
import { Docs } from "features/Docs";
import { useProjectList } from "features/Projects";
import { Playground } from "../features/Playground";
import { Navbar } from "features/Navbar";
import { useParams } from "react-router-dom";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import { useDatabaseCallback, useCustomEventListener } from "hooks";
import { getProjectsFromDB } from "indexedDB";
import { CREATE_PROJECT, DELETE_PROJECT } from "redux/thunks";
import { Project } from "types/Project";
import { useProjectFetcher } from "features/Projects/hooks/useProjectFetcher";
import { TourBackground } from "features/Tour";
import { useProjectSelector } from "redux/hooks";
import { selectProjectName } from "redux/Metadata";
import { useBrowserTitle } from "hooks";
import { UserProfile } from "features/Profile";
import { useAuthentication } from "providers/authentication";
import { useSubscription } from "providers/subscription";

import LandingBackground from "assets/images/landing-background.png";
import Barry from "assets/demos/barry.ham";
import Wind from "assets/demos/wind.ham";
import Inversions from "assets/demos/inversions.ham";
import Marimba from "assets/demos/marimba.ham";
import Scriabin from "assets/demos/scriabin.ham";
import Corridors from "assets/demos/corridors.ham";
import Upward from "assets/demos/upward.ham";

export type View = (typeof views)[number];
export const views = [
  "projects",
  "demos",
  "docs",
  "profile",
  "playground",
] as const;

/* The main page of the app */
interface MainPageProps {
  view?: View;
}
export function MainPage(props: MainPageProps) {
  const { uid } = useAuthentication();
  const { isAtLeastStatus } = useSubscription();
  const params = useParams<{ view: View }>();
  const view = props.view || params.view || "projects";
  const [projects, setProjects] = useState<Project[]>([]);
  const demoPaths = [
    Barry,
    Wind,
    Marimba,
    Inversions,
    Corridors,
    Scriabin,
    Upward,
  ];

  // Update the list of projects based on the authentication status
  const updateProjects = async () => {
    if (!uid) return;
    const fetchedProjects = await getProjectsFromDB(uid);
    setProjects(fetchedProjects);
  };

  // Update whenever the database or view changes
  useDatabaseCallback(updateProjects, [uid]);
  useCustomEventListener(CREATE_PROJECT, updateProjects);
  useCustomEventListener(DELETE_PROJECT, updateProjects);
  useEffect(() => {
    updateProjects();
  }, [view]);

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

  // Add a transition class based on the view
  const transitionClass = classNames(
    "w-full h-full pt-nav flex flex-col items-center",
    "text-white font-nunito",
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
      <div className={transitionClass}>
        {isAtLeastStatus("maestro") && (
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
