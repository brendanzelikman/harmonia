import LogoImage from "assets/images/logo.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  deleteDemoProjects,
  deleteProjects,
  getProjects,
  uploadProject,
} from "app/projects";
import { useFetch } from "hooks/useFetch";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { DEMO_GENRES } from "lib/demos";
import { useCallback, useEffect, useMemo, useState } from "react";
import { GiCalculator, GiCompactDisc, GiStarGate } from "react-icons/gi";
import {
  BsChevronRight,
  BsEject,
  BsPlusCircle,
  BsUpload,
} from "react-icons/bs";
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
import { SPLASH, CALCULATOR } from "app/router";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";

export function NavbarBrand() {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const onMain = pathname === CALCULATOR;
  const projectId = useAppValue(selectProjectId);
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
      const x = pathname === CALCULATOR ? 50 : 300;
      if ((event.x > x && event.y < 60) || event.x > 300) setShow(false); // Blur to the right
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [pathname]);
  const Icon = onMain ? GiStarGate : GiCalculator;
  const [onDemos, setOnDemos] = useState(false);
  const callback = useCallback(
    () => (pathname ? navigate(CALCULATOR) : undefined),
    [pathname, navigate]
  );
  return (
    <>
      {show && (
        <div className="fixed w-[303px] h-screen overflow-scroll bg-slate-950/80 border-r-2 border-r-slate-700 animate-in fade-in duration-150 backdrop-blur top-nav left-0">
          <div className="flex flex-col h-full p-4 gap-4">
            <Link
              to={onMain ? SPLASH : CALCULATOR}
              className="flex items-center gap-4 group hover:underline font-light text-lg border-b border-slate-600 pb-4 cursor-pointer"
            >
              <Icon className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-lg" />{" "}
              <div>{onMain ? "Landing Screen" : "Musical Calculator"}</div>
            </Link>
            <button
              className="flex items-center gap-4 group hover:underline font-light text-lg border-b border-slate-600 pb-4 cursor-pointer"
              onClick={() => uploadProject()}
            >
              <BsPlusCircle className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-full" />{" "}
              <div>New Project</div>
            </button>
            <button
              className="flex items-center gap-4 group hover:underline font-light text-lg border-b border-slate-600 pb-4 cursor-pointer"
              onClick={() => promptUserForProjects()}
            >
              <BsUpload className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-lg p-1" />{" "}
              <div>Upload Project</div>
            </button>
            <div className="flex flex-col gap-4">
              <div className="flex *:w-28 *:text-center justify-center w-full pb-4 border-b border-slate-600">
                <div
                  data-selected={!onDemos}
                  className="font-semibold data-[selected=true]:text-indigo-400 cursor-pointer select-none"
                  onClick={() => setOnDemos(false)}
                >
                  Projects
                </div>
                <div
                  data-selected={onDemos}
                  className="font-semibold data-[selected=true]:text-indigo-400 cursor-pointer select-none"
                  onClick={() => setOnDemos(true)}
                >
                  Demos
                </div>
              </div>
              {!onDemos && (
                <div className="flex flex-col gap-4 shrink-0 pb-6 mb-2 border-b border-b-slate-600">
                  {projects.map((p) => {
                    const id = selectProjectId(p);
                    const name = selectProjectName(p);
                    return (
                      <div
                        key={id}
                        data-selected={id === projectId}
                        className="bg-slate-950/50 rounded border border-slate-600 data-[selected=true]:border-indigo-500 flex flex-col p-2 gap-2 hover:bg-slate-800/50 cursor-pointer"
                        onClick={() => loadProject(id, callback)}
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
              )}
            </div>
            {onDemos && (
              <div className="flex flex-col gap-4 shrink-0 pb-6 mb-2 border-b border-b-slate-600">
                {DEMO_GENRES.map((genre) => (
                  <Disclosure as="div" className="flex flex-col gap-4">
                    <DisclosureButton
                      key={genre.key}
                      className="flex items-center text-xl group gap-2 cursor-pointer hover:bg-slate-700/50 bg-slate-900/50 border border-indigo-500/50 rounded-lg p-1 font-light"
                    >
                      <BsChevronRight className="group-data-open:rotate-180" />
                      {genre.key}
                    </DisclosureButton>
                    <DisclosurePanel className="flex flex-col gap-2 shrink-0 grow ">
                      {genre.demos.map((p) => (
                        <div
                          key={p.project.meta.id}
                          data-selected={projectId.startsWith(
                            p.project.meta.id
                          )}
                          className="bg-slate-950/50 rounded border border-slate-600 data-[selected=true]:border-indigo-500 flex flex-col p-2 gap-2 hover:bg-slate-800/50 cursor-pointer"
                          onClick={() => loadDemoProject(p.project, callback)}
                        >
                          <div className="flex gap-2">
                            <GiCompactDisc className="text-2xl" />
                            <div className="text-base">
                              {p.project.meta.name}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">{p.blurb}</div>
                        </div>
                      ))}
                    </DisclosurePanel>
                  </Disclosure>
                ))}
              </div>
            )}
            <div className="flex flex-col h-full mt-2 gap-6 shrink-0">
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
                onClick={() => deleteProjects()}
              >
                <BsEject className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-lg p-1" />{" "}
                <div className="text-lg">Eject All Projects</div>
              </div>
            </div>
          </div>
        </div>
      )}
      <div
        className="cursor-pointer select-none flex items-center gap-3 text-2xl rounded-full focus:ring-0 focus:outline-0 active:opacity-85"
        onClick={() => setShow((prev) => !prev)}
      >
        <img src={LogoImage} alt="Logo" className="size-10 shrink-0" />
        {!onMain && "Harmonia"}
      </div>
    </>
  );
}
