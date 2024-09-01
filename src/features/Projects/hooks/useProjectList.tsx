import { useProjectSearch } from "./useProjectSearch";
import { ProjectFormatter } from "..";
import { useCallback, useState } from "react";
import { Project } from "types/Project/ProjectTypes";
import { selectProjectId } from "types/Meta/MetaSelectors";

export interface ProjectItem {
  project: Project;
  filePath?: string;
}

export interface ProjectListProps {
  projects: ProjectItem[];
  searchingDemos?: boolean;
}

export function useProjectList(props: ProjectListProps) {
  const { results, SearchMenu } = useProjectSearch({ ...props });

  // Display the list of projects
  const ProjectComponentList = useCallback(
    () => (
      <div className="size-full relative flex p-4 bg-slate-950/70 overflow-scroll gap-6 snap-x snap-mandatory">
        {results.map((item, index) => (
          <ProjectFormatter
            {...item}
            index={index}
            key={selectProjectId(item.project)}
          />
        ))}
      </div>
    ),
    [results]
  );

  const List = useCallback(
    () => (
      <div className="size-full flex z-40 flex-col p-6 bg-indigo-900/50">
        {SearchMenu()}
        {ProjectComponentList()}
      </div>
    ),
    [SearchMenu, ProjectComponentList]
  );

  return { List };
}
