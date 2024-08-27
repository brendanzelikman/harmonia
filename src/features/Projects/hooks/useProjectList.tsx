import { useProjectSearch } from "./useProjectSearch";
import { ProjectFormatter } from "..";
import { useCallback } from "react";
import { Project } from "types/Project/ProjectTypes";
import { selectProjectId } from "types/Project/MetadataSelectors";

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
      <div className="w-full space-y-6">
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
      <div className="w-full h-full flex flex-col px-8 pb-8 overflow-scroll">
        {SearchMenu()}
        {ProjectComponentList()}
      </div>
    ),
    [SearchMenu, ProjectComponentList]
  );

  return { List };
}
