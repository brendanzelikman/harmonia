import LogoImage from "assets/images/logo.png";
import { Link } from "react-router-dom";
import { getProjects, uploadProject } from "app/projects";
import { useFetch } from "hooks/useFetch";
import { UPDATE_PROJECT_EVENT } from "utils/constants";
import { DEMO_PROJECTS } from "lib/demos";
import { useEffect, useMemo, useState } from "react";
import {
  GiCompactDisc,
  GiMusicalKeyboard,
  GiSoundWaves,
  GiStarGate,
} from "react-icons/gi";
import { BsPlusCircle } from "react-icons/bs";
import {
  selectProjectId,
  selectProjectLastUpdated,
  selectProjectName,
} from "types/Meta/MetaSelectors";
import { loadDemoProject, loadProject } from "types/Project/ProjectLoaders";
import dayjs from "dayjs";
import { useHotkeys } from "hooks/useHotkeys";

export function NavbarBrand() {
  return (
    <Link to="/" className="flex items-center text-white shrink-0">
      <img src={LogoImage} alt="Logo" className="size-10" />
      <span className="ml-4 max-lg:hidden text-3xl">Harmonia</span>
    </Link>
  );
}

export function NavbarPlaygroundBrand() {
  const [show, setShow] = useState(false);
  useHotkeys({ escape: () => setShow(false) });
  const { data } = useFetch(getProjects, UPDATE_PROJECT_EVENT);
  const projects = useMemo(
    () =>
      (data || []).sort(
        (a, b) =>
          dayjs(selectProjectLastUpdated(b)).unix() -
          dayjs(selectProjectLastUpdated(a)).unix()
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
  return (
    <>
      {show && (
        <div className="fixed w-75 h-screen overflow-scroll bg-slate-950/70 animate-in fade-in duration-150 backdrop-blur top-nav left-0">
          <div className="flex flex-col h-full p-4 gap-4">
            <Link
              to="/"
              className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
            >
              <GiStarGate className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-full" />{" "}
              <div>Main Menu</div>
            </Link>
            <button
              className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
              onClick={() => uploadProject()}
            >
              <BsPlusCircle className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-full" />{" "}
              <div>New Project</div>
            </button>
            <div className="flex flex-col gap-4">
              <div className="font-semibold">Projects</div>
              <ul className="flex flex-col gap-2">
                {projects.map((p) => {
                  const id = selectProjectId(p);
                  const name = selectProjectName(p);
                  return (
                    <li
                      key={id}
                      className="bg-slate-950/50 h-10 rounded border border-slate-600 flex items-center gap-2 px-2 hover:bg-slate-800/50 cursor-pointer"
                      onClick={() => loadProject(id)}
                    >
                      <GiCompactDisc className="text-2xl" />
                      <div className="text-base">{name}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex flex-col gap-4 shrink-0 mt-4">
              <div className="font-semibold">Demos</div>
              <div className="flex flex-col gap-2 shrink-0 grow">
                {DEMO_PROJECTS.map((p) => (
                  <div
                    key={p.project.meta.id}
                    className="bg-slate-950/50 h-10 rounded border border-slate-600 flex items-center gap-2 px-2 hover:bg-slate-800/50 cursor-pointer"
                    onClick={() => loadDemoProject(p.project)}
                  >
                    <GiCompactDisc className="text-2xl" />
                    <div className="text-base">{p.project.meta.name}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col h-full mt-4 gap-4 shrink-0">
              <div className="font-semibold">Other Menus</div>
              <Link
                className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
                to="/projects"
              >
                <GiCompactDisc className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-full" />{" "}
                <div>Projects</div>
              </Link>
              <Link
                className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
                to="/demos"
              >
                <GiMusicalKeyboard className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-full" />{" "}
                <div>Demos</div>
              </Link>
              <Link
                className="flex items-center gap-4 group hover:underline text-xl font-light border-b border-slate-600 pb-4 cursor-pointer"
                to="/samples"
              >
                <GiSoundWaves className="text-3xl group-hover:scale-105 group-hover:bg-slate-800 rounded-full" />{" "}
                <div>Samples</div>
              </Link>
            </div>
          </div>
        </div>
      )}
      <button
        className="cursor-pointer rounded-full focus:ring-0 focus:outline-0 active:opacity-85"
        type="button"
        onClick={() => setShow((prev) => !prev)}
      >
        <img src={LogoImage} alt="Logo" className="size-10" />
      </button>
    </>
  );
}
