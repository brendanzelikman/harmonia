import LogoImage from "assets/images/logo.png";
import { Link } from "react-router-dom";
import {
  deleteDemoProjects,
  deleteProjects,
  getProjects,
  uploadProject,
} from "app/projects";
import { useFetch } from "hooks/useFetch";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { DEMO_GENRES } from "lib/demos";
import { useEffect, useMemo, useState } from "react";
import { GiCalculator, GiCompactDisc, GiStarGate } from "react-icons/gi";
import { BsEject, BsPlusCircle, BsUpload } from "react-icons/bs";
import {
  selectProjectDateCreated,
  selectProjectId,
  selectProjectName,
} from "types/Meta/MetaSelectors";
import {
  loadDemoProject,
  loadProject,
  promptUserForProjects,
} from "types/Project/ProjectLoaders";
import dayjs from "dayjs";
import { useHotkeys } from "hooks/useHotkeys";
import { exportProjectsToZip } from "types/Project/ProjectExporters";
import { useAppDispatch, useAppValue } from "hooks/useRedux";
import { LAND, MAIN, useRoute } from "app/router";

export function NavbarBrand() {
  const dispatch = useAppDispatch();
  const route = useRoute();
  const onMain = route === MAIN;
  const projectId = useAppValue(selectProjectId);
  const projectName = useAppValue(selectProjectName);
  const [show, setShow] = useState(false);
  useHotkeys({ escape: () => setShow(false) });
  const { data } = useFetch(getProjects, UPDATE_PROJECT_EVENT);
  const projects = useMemo(
    () =>
      (data || []).sort(
        (a, b) =>
          dayjs(selectProjectDateCreated(b)).unix() -
          dayjs(selectProjectDateCreated(a)).unix()
      ),
    [data]
  );
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if ((event.x > 50 && event.y < 60) || event.x > 300) setShow(false); // Blur to the right
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  });
  const Icon = onMain ? GiStarGate : GiCalculator;
  return (
    <>
      {show && (
        <div className="fixed w-75 h-screen overflow-scroll bg-slate-950/70 animate-in fade-in duration-150 backdrop-blur top-nav left-0">
          <div className="flex flex-col h-full p-4 gap-4">
            <Link
              to={onMain ? LAND : MAIN}
              className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
            >
              <Icon className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-lg" />{" "}
              <div>{onMain ? "Main Menu" : "Open Calculator"}</div>
            </Link>
            <button
              className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
              onClick={() => uploadProject()}
            >
              <BsPlusCircle className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-full" />{" "}
              <div>New Project</div>
            </button>
            <button
              className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
              onClick={() => promptUserForProjects()}
            >
              <BsUpload className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-lg p-1" />{" "}
              <div>Upload Project</div>
            </button>
            <div className="flex flex-col gap-4">
              <div className="font-semibold">Projects</div>
              <div className="flex flex-col gap-2">
                {projects.map((p) => {
                  const id = selectProjectId(p);
                  const name = selectProjectName(p);
                  return (
                    <div
                      key={id}
                      data-selected={id === projectId}
                      className="bg-slate-950/50 rounded border border-slate-600 data-[selected=true]:border-indigo-500 flex flex-col p-2 gap-2 hover:bg-slate-800/50 cursor-pointer"
                      onClick={() => loadProject(id)}
                    >
                      <div className="flex gap-2">
                        <GiCompactDisc className="text-2xl" />
                        <div className="text-base">{name}</div>
                      </div>
                      <div className="text-xs text-gray-400">
                        Date Created:{" "}
                        {dayjs(selectProjectDateCreated(p)).format(
                          "MMM D, YYYY h:mm A"
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-col gap-4 shrink-0 mt-4">
              {DEMO_GENRES.map((genre) => (
                <>
                  <div key={genre.key} className="font-semibold">
                    Demos - {genre.key}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 grow">
                    {genre.demos.map((p) => (
                      <div
                        key={p.project.meta.id}
                        data-selected={projectId.startsWith(p.project.meta.id)}
                        className="bg-slate-950/50 rounded border border-slate-600 data-[selected=true]:border-indigo-500 flex flex-col p-2 gap-2 hover:bg-slate-800/50 cursor-pointer"
                        onClick={() => loadDemoProject(p.project)}
                      >
                        <div className="flex gap-2">
                          <GiCompactDisc className="text-2xl" />
                          <div className="text-base">{p.project.meta.name}</div>
                        </div>
                        <div className="text-xs text-gray-400">{p.blurb}</div>
                      </div>
                    ))}
                  </div>
                </>
              ))}
            </div>
            <div className="flex flex-col h-full mt-4 gap-6 shrink-0">
              <div className="font-semibold">Quick Actions</div>
              <div
                className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
                onClick={() => dispatch(exportProjectsToZip("json"))}
              >
                <GiCompactDisc className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-full p-1" />{" "}
                <div className="text-lg">Export Projects to JSON</div>
              </div>
              <div
                className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
                onClick={() => dispatch(exportProjectsToZip("midi"))}
              >
                <GiCompactDisc className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-full p-1" />{" "}
                <div className="text-lg">Export Projects to MIDI</div>
              </div>
              <div
                className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
                onClick={() => dispatch(exportProjectsToZip("wav"))}
              >
                <GiCompactDisc className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-full p-1" />{" "}
                <div className="text-lg">Export Projects to WAV</div>
              </div>
              <div
                className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
                onClick={() => deleteDemoProjects()}
              >
                <BsEject className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-lg p-1" />{" "}
                <div className="text-lg">Eject Demo Projects</div>
              </div>
              <div
                className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
                onClick={() => deleteProjects()}
              >
                <BsEject className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-lg p-1" />{" "}
                <div className="text-lg">Eject All Projects</div>
              </div>
            </div>
          </div>
        </div>
      )}
      <button
        className="cursor-pointer flex items-center gap-3 text-2xl rounded-full focus:ring-0 focus:outline-0 active:opacity-85"
        type="button"
        onClick={() => setShow((prev) => !prev)}
      >
        <img src={LogoImage} alt="Logo" className="size-10" />
        {!onMain && "Harmonia"}
      </button>
    </>
  );
}

export function NavbarDummyBrand() {
  return (
    <Link to={LAND} className="flex items-center text-white shrink-0">
      <img src={LogoImage} alt="Logo" className="size-10" />
      <span className="ml-4 max-lg:hidden text-3xl">Harmonia</span>
    </Link>
  );
}
