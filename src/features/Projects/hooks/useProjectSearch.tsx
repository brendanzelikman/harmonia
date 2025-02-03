import classNames from "classnames";
import { lowerCase } from "lodash";
import { useState, useMemo, useCallback, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProjectDispatch } from "types/hooks";
import { ProjectListProps } from "./useProjectList";
import {
  PRODIGY_PROJECT_LIMIT,
  MAESTRO_PROJECT_LIMIT,
  VIRTUOSO_PROJECT_LIMIT,
} from "utils/rank";
import { useAuth } from "providers/auth";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { isProject } from "types/Project/ProjectTypes";
import { selectPatternClips } from "types/Clip/ClipSelectors";
import { selectInstruments } from "types/Instrument/InstrumentSelectors";
import { selectPatternMap } from "types/Pattern/PatternSelectors";
import {
  selectScaleTracks,
  selectTrackMidiScale,
} from "types/Track/TrackSelectors";
import { selectMeta } from "types/Meta/MetaSelectors";
import {
  createProject,
  deleteAllProjects,
  deleteEmptyProjects,
} from "types/Project/ProjectThunks";
import { loadProject, readLocalProjects } from "types/Project/ProjectLoaders";
import { exportProjectsToZIP } from "types/Project/ProjectExporters";
import { getScaleName } from "utils/scale";
import {
  GiCompactDisc,
  GiFiles,
  GiFire,
  GiLoad,
  GiRetroController,
  GiScissors,
  GiSoundWaves,
} from "react-icons/gi";
import { isProjectEmpty } from "types/Project/ProjectFunctions";
import { useDrop } from "react-dnd";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { BsPiggyBank, BsUsbPlug } from "react-icons/bs";
import { TooltipButton } from "components/TooltipButton";
import { dispatchCustomEvent } from "utils/html";
import moment from "moment";

interface ProjectSearchProps extends ProjectListProps {}

export function useProjectSearch(props: ProjectSearchProps) {
  const { projects, searchingDemos } = props;
  const { isAdmin, isProdigy, isMaestro, isVirtuoso } = useAuth();
  const dispatch = useProjectDispatch();
  const [isDragging, setIsDragging] = useState(false);
  useCustomEventListener("dragged-project", (e) => setIsDragging(!!e.detail));
  const emptyCount = projects.filter((item) =>
    isProjectEmpty(item.project)
  ).length;

  // Check if projects are capped
  const areProjectsCapped = useMemo(() => {
    if (isAdmin) {
      return false;
    }
    if (isProdigy) {
      return projects.length >= PRODIGY_PROJECT_LIMIT;
    }
    if (isMaestro) {
      return projects.length >= MAESTRO_PROJECT_LIMIT;
    }
    if (isVirtuoso) {
      return projects.length >= VIRTUOSO_PROJECT_LIMIT;
    }
    return true;
  }, [projects, isAdmin, isProdigy, isMaestro, isVirtuoso]);

  // Get the filtered projects
  const [query, setQuery] = useState("");
  const results = useMemo(
    () =>
      projects
        .filter(({ project }) => {
          if (!isProject(project)) return false;
          // Get the list of patterns used
          const patternMap = selectPatternMap(project);
          const patternClips = selectPatternClips(project);
          const allPatternIds = patternClips.map(({ patternId }) => patternId);
          const patternIds = [...new Set(allPatternIds)];
          const allPatternNames = patternIds.map((id) => patternMap[id]?.name);
          const patternNames = [...new Set(allPatternNames)].map(lowerCase);

          // Get the list of scales used
          const scaleTracks = selectScaleTracks(project);
          const allScales = scaleTracks.map(({ id }) =>
            selectTrackMidiScale(project, id)
          );
          const allScaleNames = allScales.map((scale) => getScaleName(scale));
          const scaleNames = [...new Set(allScaleNames)].map(lowerCase);

          // Get the list of instruments used
          const instruments = selectInstruments(project);
          const allInstrumentNames = instruments.map(({ key }) =>
            getInstrumentName(key)
          );
          const instrumentNames = [...new Set(allInstrumentNames)].map(
            lowerCase
          );

          // Get the name of the project
          const meta = selectMeta(project);
          const name = meta.name.toLowerCase();

          // Get the date of the project
          const date = new Date(meta.dateCreated)
            .toLocaleString("default", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })
            .toLowerCase();

          // Filter the projects by search term
          const term = query.toLowerCase().trim();
          const hasPattern = patternNames.some((_) => _.includes(term));
          const hasScale = scaleNames.some((_) => _.includes(term));
          const hasInstrument = instrumentNames.some((_) => _.includes(term));
          const hasName = name.includes(term);
          const hasDate = date.includes(term);
          return hasPattern || hasScale || hasInstrument || hasName || hasDate;
        })
        .sort((a, b) => {
          const dateA = new Date(selectMeta(a.project).lastUpdated);
          const dateB = new Date(selectMeta(b.project).lastUpdated);
          return dateB.getTime() - dateA.getTime();
        }),
    [projects, query]
  );

  const navigate = useNavigate();
  const [{ isOver }, drop] = useDrop(() => {
    return {
      accept: "project",
      collect(monitor) {
        return {
          isOver: monitor.isOver(),
        };
      },
      drop: (item: any) => {
        dispatch(loadProject(item.id, () => navigate("/playground")));
        setTimeout(() => dispatchCustomEvent("dragged-project", false), 500);
      },
    };
  }, []);
  // Display the search bar and new project button
  const SearchBar = useCallback(() => {
    const inputClass = classNames(
      "min-w-56 h-10 px-4 rounded-lg shadow-xl",
      "focus:outline-none focus:ring-2 text-slate-200",
      "border-none focus:border-transparent transition-all",
      searchingDemos ? "focus:ring-indigo-300/50" : "focus:ring-sky-400/70",
      isOver
        ? "shadow-[0_0_5px_5px_white] bg-indigo-950"
        : isDragging
        ? "shadow-[0_0_10px_5px_indigo] bg-transparent ring-2 ring-indigo-400/75 placeholder:text-slate-300/80"
        : "ring-2 ring-slate-600 bg-transparent"
    );
    return (
      <input
        ref={drop}
        name="project-search"
        type="text"
        className={inputClass}
        placeholder={
          isDragging ? "Insert Project Disc" : "Search By Any Fields"
        }
        aria-description={`Search ${
          searchingDemos ? "Demos" : "Projects"
        } by Name, Date, Patterns, Scales, Instruments, etc.`}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    );
  }, [query, searchingDemos, isDragging, isOver]);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    return () => {
      setSaving(false);
      setDeleting(false);
    };
  }, []);

  const ControlBar = useCallback(() => {
    return (
      <div className="flex animate-in fade-in duration-75 w-full items-center gap-6 text-sm">
        <div className="flex flex-col order-12 ml-auto whitespace-nowrap text-slate-400">
          <span>{moment().format("MMMM Do, YYYY")}</span>
          <span>{moment().format("[Logged in] h:mm a")}</span>
        </div>
        <Link
          to="/playground"
          className="rounded-lg xl:rounded flex shrink-0 items-center border px-2 w-12 h-12 xl:w-36 text-center hover:opacity-85 text-indigo-400 border-indigo-400"
        >
          <span className="max-xl:hidden">Open Playground</span>
          <GiRetroController className="mx-auto text-5xl" />
        </Link>
        <button
          className="rounded-lg xl:rounded flex shrink-0 items-center border px-2 w-12 h-12 xl:w-36 hover:opacity-85 text-sky-400 border-sky-400"
          onClick={() => createProject()}
          disabled={areProjectsCapped}
        >
          <span className="max-xl:hidden">Create New Project</span>
          <GiCompactDisc
            className="mx-auto text-5xl"
            style={{ transform: "rotateX(50deg)" }}
          />
        </button>
        <button
          className="rounded-lg xl:rounded flex shrink-0 items-center border px-2 w-12 h-12 xl:w-36 hover:opacity-85 text-orange-300 border-orange-300"
          onClick={() => dispatch(readLocalProjects())}
          disabled={areProjectsCapped}
        >
          <span className="max-xl:hidden">Load Project From File</span>
          <GiLoad className="mx-auto text-5xl" />
        </button>
        {emptyCount >= 3 && (
          <button
            className="rounded-lg xl:rounded flex shrink-0 items-center border px-2 w-12 h-12 xl:w-36 hover:opacity-85 text-slate-300 border-slate-300"
            onClick={() => deleteEmptyProjects()}
          >
            <span className="max-xl:hidden">Delete Empty Projects</span>
            <GiScissors className="mx-auto text-5xl" />
          </button>
        )}
        <div
          data-saving={saving}
          className="relative shrink-0 data-[saving=true]:w-36 w-12 xl:w-36 h-12"
        >
          <button
            data-saving={saving}
            className={`data-[saving=true]:hidden flex animate-in fade-in rounded-lg xl:rounded transition-all shrink-0 items-center border px-2 w-12 h-12 xl:w-36 hover:opacity-85 text-emerald-400 border-emerald-400`}
            onClick={() => setSaving((prev) => !prev)}
          >
            <span className="max-xl:hidden">Save All Projects</span>
            <GiFiles className="mx-auto text-5xl" />
          </button>
          <div
            data-saving={saving}
            className={`data-[saving=true]:flex hidden animate-in fade-in rounded-lg xl:rounded data-[saving=true]:w-36 w-12 xl:w-36 shrink-0 items-center`}
            onMouseLeave={() => setSaving(false)}
          >
            <div className="w-full flex items-center rounded *:grow h-full shrink-0 animate-in fade-in ease-in-out text-xs gap-2 p-1 border border-emerald-400/80">
              <TooltipButton
                className="hover:opacity-75"
                label="Download Zipped Harmonia Files"
                marginTop={50}
                marginLeft={0}
                hideRing
                onClick={() => dispatch(exportProjectsToZIP("ham"))}
              >
                <button className="flex flex-col gap-1 items-center hover:opacity-75 text-sky-400">
                  HAM
                  <BsPiggyBank className="text-xl" />
                </button>
              </TooltipButton>
              <TooltipButton
                className="flex flex-col hover:opacity-75 items-center text-sky-400"
                label="Download Zipped Audio Files"
                marginTop={50}
                marginLeft={0}
                hideRing
                onClick={() => dispatch(exportProjectsToZIP("wav"))}
              >
                <button className="flex flex-col gap-1 items-center text-teal-400">
                  WAV
                  <GiSoundWaves className="text-xl" />
                </button>
              </TooltipButton>
              <TooltipButton
                className="flex flex-col hover:opacity-75 items-center text-sky-400"
                label="Download Zipped MIDI Notes"
                marginTop={50}
                marginLeft={0}
                hideRing
                onClick={() => dispatch(exportProjectsToZIP("wav"))}
              >
                <button className="flex flex-col gap-1 items-center text-indigo-400">
                  MIDI
                  <BsUsbPlug className="text-xl" />
                </button>
              </TooltipButton>
            </div>
          </div>
        </div>
        <div
          data-deleting={deleting}
          className="relative shrink-0 data-[deleting=true]:w-36 w-12 xl:w-36 h-12"
        >
          <button
            data-deleting={deleting}
            className="data-[deleting=true]:hidden flex inset-0 absolute animate-in fade-in rounded-lg xl:rounded transition-all shrink-0 items-center border px-2 w-12 xl:w-36 hover:opacity-85 text-red-400 border-red-400"
            onClick={() => setDeleting((prev) => !prev)}
          >
            <span className="max-xl:hidden">Delete All Projects</span>
            <GiFire className="mx-auto text-5xl" />
          </button>
          <div
            data-deleting={deleting}
            className="data-[deleting=true]:flex hidden animate-in fade-in rounded absolute data-[deleting=true]:w-36 w-12 xl:w-36 shrink-0 items-center"
            onMouseLeave={() => setDeleting(false)}
          >
            <div className="w-full flex items-center rounded *:grow h-full shrink-0 animate-in fade-in ease-in-out text-xs gap-2 p-1 border border-slate-400/80">
              <TooltipButton
                className="hover:opacity-75"
                label="Don't delete everything!"
                normalCase
                marginTop={50}
                marginLeft={0}
                hideRing
                onClick={() => setDeleting(false)}
              >
                <div className="flex flex-col gap-1 select-none items-center hover:opacity-75 text-emerald-400">
                  Go Back
                  <BsPiggyBank className="mx-auto text-xl" />
                </div>
              </TooltipButton>
              <TooltipButton
                className="flex flex-col select-none hover:opacity-75 items-center text-red-400"
                normalCase
                label="Delete everything!"
                marginTop={50}
                marginLeft={0}
                hideRing
                onClick={() => {
                  deleteAllProjects();
                  setDeleting(false);
                }}
              >
                <button className="flex flex-col gap-1 items-center text-red-400">
                  Delete
                  <GiSoundWaves className="mx-auto text-xl" />
                </button>
              </TooltipButton>
            </div>
          </div>
        </div>
        {SearchBar()}
      </div>
    );
  }, [areProjectsCapped, emptyCount, saving, deleting, SearchBar]);

  const SearchMenu = useCallback(() => {
    const menuClass = classNames(
      "w-full my-6 animate-in slide-in-from-bottom mt-auto p-4 rounded-lg",
      "flex flex-col items-center gap-4",
      "ring-2 shadow-xl backdrop-blur",
      searchingDemos
        ? "bg-gray-900/90 ring-gray-400/50"
        : "bg-slate-950/60 ring-sky-500/50"
    );
    return <div className={menuClass}>{!searchingDemos && ControlBar()}</div>;
  }, [searchingDemos, ControlBar]);

  return { results, SearchMenu };
}
