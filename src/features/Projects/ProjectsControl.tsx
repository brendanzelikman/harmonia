import { uploadProject, deleteProjects } from "app/projects";
import classNames from "classnames";
import {
  HomeControlBar,
  HomeControlButton,
} from "features/Home/HomeControlBar";
import { BsCode, BsUsbPlug } from "react-icons/bs";
import {
  GiRetroController,
  GiCompactDisc,
  GiLoad,
  GiFiles,
  GiSoundWaves,
  GiFire,
} from "react-icons/gi";
import { exportProjectsToZip } from "types/Project/ProjectExporters";
import { promptUserForProjects } from "types/Project/ProjectLoaders";
import { ProjectSearchBar } from "./ProjectsSearchBar";
import { useAppDispatch } from "hooks/useRedux";
import { Dispatch, SetStateAction, useState } from "react";
import { useNavigate } from "react-router-dom";

export const ProjectsControl = (props: {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}) => {
  const [saving, setSaving] = useState(false);
  const dispatch = useAppDispatch();
  const [deleting, setDeleting] = useState(false);
  return (
    <HomeControlBar>
      <HomeControlButton
        className="border-sky-400 text-sky-400"
        title="Create New Project"
        icon={<GiCompactDisc style={{ rotate: "50deg" }} />}
        onClick={() => uploadProject()}
      />
      <HomeControlButton
        className="border-orange-300 text-orange-300"
        title="Load Project From JSON"
        icon={<GiLoad />}
        onClick={() => promptUserForProjects()}
      />
      <HomeControlButton
        className="border-emerald-400 text-emerald-400"
        title={saving ? undefined : "Save All Projects"}
        onMouseLeave={() => setSaving(false)}
        icon={
          !saving ? (
            <GiFiles />
          ) : (
            <div className="w-full *:cursor-pointer flex items-center rounded *:grow h-full shrink-0 animate-in fade-in ease-in-out text-xs gap-2 p-1">
              <button
                onClick={() => dispatch(exportProjectsToZip("json"))}
                className="flex flex-col gap-1 items-center hover:saturate-150 rounded hover:opacity-75 text-sky-400"
              >
                JSON
                <BsCode className="text-xl" />
              </button>
              <button
                onClick={() => dispatch(exportProjectsToZip("wav"))}
                className="flex flex-col gap-1 items-center hover:saturate-150 rounded hover:opacity-75 text-teal-400"
              >
                WAV
                <GiSoundWaves className="text-xl" />
              </button>
              <button
                onClick={() => dispatch(exportProjectsToZip("midi"))}
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
        onClick={async () => {
          if (deleting) await deleteProjects();
          setDeleting((prev) => !prev);
        }}
        onMouseLeave={() => setDeleting(false)}
      />
      <ProjectSearchBar {...props} />
    </HomeControlBar>
  );
};
