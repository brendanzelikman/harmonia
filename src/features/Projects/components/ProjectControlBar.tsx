import moment from "moment";
import { BsUsbPlug } from "react-icons/bs";
import {
  GiRetroController,
  GiCompactDisc,
  GiLoad,
  GiFiles,
  GiSoundWaves,
  GiFire,
  GiPig,
} from "react-icons/gi";
import { useNavigate } from "react-router-dom";
import { exportProjectsToZIP } from "types/Project/ProjectExporters";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import { createProject, deleteAllProjects } from "types/Project/ProjectThunks";
import { ProjectSearchBar } from "./ProjectSearchBar";
import { useProjectDispatch } from "types/hooks";
import { Dispatch, ReactNode, SetStateAction, useState } from "react";
import classNames from "classnames";

interface ProjectControlBarProps {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
  deleting: boolean;
  setDeleting: Dispatch<SetStateAction<boolean>>;
}

export const ProjectControlBar = (props: ProjectControlBarProps) => {
  const { query, setQuery, deleting, setDeleting } = props;
  const navigate = useNavigate();
  const dispatch = useProjectDispatch();
  const [saving, setSaving] = useState(false);
  return (
    <div className="w-full my-6 animate-in slide-in-from-bottom mt-auto p-4 rounded-lg flex flex-col items-center gap-4 ring-2 shadow-xl backdrop-blur bg-slate-950/60 ring-indigo-500/80">
      <div className="flex animate-in fade-in duration-75 w-full items-center max-[600px]:justify-center gap-6 text-sm">
        <Time />
        <ControlButton
          className="border-indigo-400 text-indigo-400"
          title="Open Playground"
          icon={<GiRetroController />}
          onClick={() => navigate("/playground")}
        />
        <ControlButton
          className="border-sky-400 text-sky-400"
          title="Create New Project"
          icon={<GiCompactDisc style={{ rotate: "50deg" }} />}
          onClick={() => createProject()}
        />
        <ControlButton
          className="border-orange-300 text-orange-300"
          title="Load Project From File"
          icon={<GiLoad />}
          onClick={() => dispatch(readLocalProjects())}
        />
        <ControlButton
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
        <ControlButton
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
      </div>
    </div>
  );
};

const Time = () => (
  <div className="max-[1300px]:hidden flex flex-col order-12 ml-auto whitespace-nowrap text-slate-400">
    <span>{moment().format("MMMM Do, YYYY")}</span>
    <span>{moment().format("[Logged in] h:mm a")}</span>
  </div>
);

const ControlButton = (props: {
  className: string;
  small?: boolean;
  title?: string;
  icon?: ReactNode;
  onClick: () => void;
  onMouseLeave?: () => void;
}) => {
  const { className, small, title, icon, onClick } = props;
  return (
    <div
      className={classNames(
        small ? "" : "xl:w-36 text-5xl size-12 border px-2",
        "rounded-3xl *:mx-auto group xl:rounded cursor-pointer flex shrink-0 items-center text-center select-none",
        className
      )}
      onClick={onClick}
      onMouseLeave={props.onMouseLeave}
    >
      {!title ? null : (
        <span className="max-xl:hidden text-sm group-hover:opacity-85">
          {title}
        </span>
      )}
      {icon}
    </div>
  );
};
