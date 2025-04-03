import { useProjectSearch } from "./hooks/useProjectSearch";
import { useState } from "react";
import { Project } from "types/Project/ProjectTypes";
import { selectProjectId } from "types/Meta/MetaSelectors";
import {
  createProject,
  deleteAllProjects,
  UPDATE_PROJECTS,
} from "types/Project/ProjectThunks";
import { ProjectFormatter } from "./components/ProjectFormatter";
import { useUserProjects } from "./hooks/useUserProjects";
import { useHotkeys } from "react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { HomeContainer } from "pages/components/HomeContainer";
import { HomeList } from "pages/components/HomeList";
import {
  HomeControlBar,
  HomeControlButton,
} from "pages/components/HomeControlBar";
import classNames from "classnames";
import { BsUsbPlug } from "react-icons/bs";
import {
  GiRetroController,
  GiCompactDisc,
  GiLoad,
  GiFiles,
  GiPig,
  GiSoundWaves,
  GiFire,
} from "react-icons/gi";
import { exportProjectsToZIP } from "types/Project/ProjectExporters";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import { ProjectSearchBar } from "./components/ProjectSearchBar";
import moment from "moment";
import { useProjectDispatch } from "types/hooks";

export interface ProjectItem {
  project: Project;
  filePath?: string;
}

export function ProjectsPage() {
  const dispatch = useProjectDispatch();
  const navigate = useNavigate();
  useHotkeys("enter", () => navigate("/playground"));

  const projects = useUserProjects();
  const [query, setQuery] = useState("");
  const results = useProjectSearch({ projects, query });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  return (
    <HomeContainer>
      <HomeControlBar>
        <div className="max-[1300px]:hidden flex flex-col order-12 ml-auto whitespace-nowrap text-slate-400">
          <span>{moment().format("MMMM Do, YYYY")}</span>
          <span>{moment().format("[Logged in] h:mm a")}</span>
        </div>
        <HomeControlButton
          className="border-indigo-400 text-indigo-400"
          title="Open Playground"
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
          title="Load Project From File"
          icon={<GiLoad />}
          onClick={() => dispatch(readLocalProjects())}
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
                  onClick={() => dispatch(exportProjectsToZIP("ham"))}
                  className="flex flex-col gap-1 items-center hover:ring-1 rounded hover:ring-white hover:opacity-75 text-sky-400"
                >
                  HAM
                  <GiPig className="text-xl" />
                </button>
                <button
                  onClick={() => dispatch(exportProjectsToZIP("wav"))}
                  className="flex flex-col gap-1 items-center hover:ring-1 rounded hover:ring-white hover:opacity-75 text-teal-400"
                >
                  WAV
                  <GiSoundWaves className="text-xl" />
                </button>
                <button
                  onClick={() => dispatch(exportProjectsToZIP("midi"))}
                  className="flex flex-col gap-1 items-center hover:ring-1 rounded hover:ring-white hover:opacity-75 text-indigo-400"
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
      <HomeList signal={UPDATE_PROJECTS}>
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
