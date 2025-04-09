import { useState } from "react";
import { Project } from "types/Project/ProjectTypes";
import { selectProjectId } from "types/Meta/MetaSelectors";
import { createProject, deleteAllProjects } from "types/Project/ProjectThunks";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { HomeContainer } from "features/Home/HomeContainer";
import { HomeList } from "features/Home/HomeList";
import {
  HomeControlBar,
  HomeControlButton,
} from "features/Home/HomeControlBar";
import classNames from "classnames";
import { BsUsbPlug } from "react-icons/bs";
import {
  GiRetroController,
  GiCompactDisc,
  GiLoad,
  GiFiles,
  GiSoundWaves,
  GiFire,
} from "react-icons/gi";
import { exportProjectsToZIP } from "types/Project/ProjectExporters";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import dayjs from "dayjs";
import { useDispatch } from "hooks/useStore";
import { BiCodeCurly } from "react-icons/bi";
import { ProjectFormatter } from "features/Projects/ProjectsFormatter";
import { ProjectSearchBar } from "features/Projects/ProjectsSearchBar";
import { useFetch } from "hooks/useFetch";
import { getProjects } from "app/projects";
import { useProjectSearch } from "features/Projects/useProjectSearch";

export interface ProjectItem {
  project: Project;
  filePath?: string;
}

export function ProjectPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useHotkeys("enter", () => navigate("/playground"));
  const { data } = useFetch(getProjects, UPDATE_PROJECT_EVENT);
  const projects = data ?? [];
  const [query, setQuery] = useState("");
  const results = useProjectSearch({ projects, query });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <HomeContainer>
      <HomeControlBar>
        <div className="max-[1300px]:hidden flex flex-col order-12 ml-auto *:ml-auto whitespace-nowrap text-slate-400">
          <span>{dayjs().format("MMMM D, YYYY")}</span>
          <span>{dayjs().format("h:mm:ss a")}</span>
        </div>
        <HomeControlButton
          className="border-indigo-400 text-indigo-400"
          title="Open Project"
          icon={<GiRetroController />}
          onClick={() => navigate("/playground")}
        />
        <HomeControlButton
          className="border-sky-400 text-sky-400"
          title="Create New Project"
          icon={<GiCompactDisc style={{ rotate: "50deg" }} />}
          onClick={() => createProject()}
        />
        <HomeControlButton
          className="border-orange-300 text-orange-300"
          title="Load Project From JSON"
          icon={<GiLoad />}
          onClick={() => readLocalProjects()}
        />
        <HomeControlButton
          className="border-emerald-400 text-emerald-400"
          title={saving ? undefined : "Save All Projects"}
          onMouseLeave={() => setSaving(false)}
          icon={
            !saving ? (
              <GiFiles />
            ) : (
              <div className="w-full flex items-center rounded *:grow h-full shrink-0 animate-in fade-in ease-in-out text-xs gap-2 p-1">
                <button
                  onClick={() => dispatch(exportProjectsToZIP("json"))}
                  className="flex flex-col gap-1 items-center hover:saturate-150 rounded hover:opacity-75 text-sky-400"
                >
                  JSON
                  <BiCodeCurly className="text-xl" />
                </button>
                <button
                  onClick={() => dispatch(exportProjectsToZIP("wav"))}
                  className="flex flex-col gap-1 items-center hover:saturate-150 rounded hover:opacity-75 text-teal-400"
                >
                  WAV
                  <GiSoundWaves className="text-xl" />
                </button>
                <button
                  onClick={() => dispatch(exportProjectsToZIP("midi"))}
                  className="flex flex-col gap-1 items-center hover:saturate-150 rounded hover:opacity-75 text-indigo-400"
                >
                  MIDI
                  <BsUsbPlug className="text-xl" />
                </button>
              </div>
            )
          }
          onClick={() => setSaving((prev) => !prev)}
        />
        <HomeControlButton
          className={classNames(
            "border-red-400 text-red-400 transition-all",
            deleting ? "saturate-150" : ""
          )}
          title={deleting ? "Confirm Deletion?" : "Delete All Projects"}
          icon={<GiFire className={deleting ? "animate-pulse" : ""} />}
          onClick={() => {
            if (deleting) deleteAllProjects();
            setDeleting((prev) => !prev);
          }}
          onMouseLeave={() => setDeleting(false)}
        />
        <ProjectSearchBar query={query} setQuery={setQuery} />
      </HomeControlBar>
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
