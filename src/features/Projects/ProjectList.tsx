import { useProjectSearch } from "./hooks/useProjectSearch";
import { useCallback, useRef, useState } from "react";
import { Project } from "types/Project/ProjectTypes";
import { selectProjectId } from "types/Meta/MetaSelectors";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { UPDATE_PROJECTS } from "types/Project/ProjectThunks";
import { ProjectFormatter } from "./components/ProjectFormatter";
import { useUserProjects } from "./hooks/useUserProjects";
import { ProjectControlBar } from "./components/ProjectControlBar";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";

export interface ProjectItem {
  project: Project;
  filePath?: string;
}

export function ProjectList() {
  const navigate = useNavigate();

  const projects = useUserProjects();
  const [query, setQuery] = useState("");
  const results = useProjectSearch({ projects, query });
  const [deleting, setDeleting] = useState(false);

  // Reset the scroll position when the projects are updated
  const listRef = useRef<HTMLDivElement>(null);
  const updateList = useCallback(() => {
    listRef.current?.scrollTo(0, 0);
  }, []);
  useCustomEventListener(UPDATE_PROJECTS, updateList);

  useHotkeys("enter", () => navigate("/playground"));

  return (
    <div className="size-full flex z-40 flex-col p-6 bg-indigo-900/50 backdrop-blur">
      <ProjectControlBar
        query={query}
        setQuery={setQuery}
        deleting={deleting}
        setDeleting={setDeleting}
      />
      <div
        ref={listRef}
        className="size-full relative flex max-[800px]:flex-col py-4 px-2 rounded border-2 border-indigo-500/80 bg-slate-950/70 overflow-scroll snap-x snap-mandatory animate-in fade-in duration-300 ease-out"
      >
        {results.map((project, index) => (
          <ProjectFormatter
            key={selectProjectId(project)}
            project={project}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
