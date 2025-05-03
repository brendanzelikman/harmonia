import { useMemo, useState } from "react";
import { Project } from "types/Project/ProjectTypes";
import { selectProjectId } from "types/Meta/MetaSelectors";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { useNavigate } from "react-router-dom";
import { HomeContainer } from "features/Home/HomeContainer";
import { HomeList } from "features/Home/HomeList";
import { ProjectFormatter } from "features/Projects/ProjectsFormatter";
import { useFetch } from "hooks/useFetch";
import { getProjects } from "app/projects";
import { useProjectSearch } from "features/Projects/useProjectSearch";
import { useHotkeys } from "hooks/useHotkeys";
import { ProjectsControl } from "./ProjectsControl";

export interface ProjectItem {
  project: Project;
  filePath?: string;
}

export default function ProjectPage() {
  const navigate = useNavigate();
  useHotkeys({ enter: () => navigate("/playground") });
  const { data } = useFetch(getProjects, UPDATE_PROJECT_EVENT);
  const projects = useMemo(() => data ?? [], [data]);
  const [query, setQuery] = useState("");
  const results = useProjectSearch({ projects, query });
  return (
    <HomeContainer>
      <ProjectsControl query={query} setQuery={setQuery} />
      <HomeList signal={UPDATE_PROJECT_EVENT}>
        {results.map((project, index) => (
          <ProjectFormatter
            key={selectProjectId(project)}
            project={project}
            index={index}
          />
        ))}
      </HomeList>
    </HomeContainer>
  );
}
