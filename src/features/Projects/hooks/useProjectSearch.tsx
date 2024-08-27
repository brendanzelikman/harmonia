import classNames from "classnames";
import { lowerCase } from "lodash";
import { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProjectDispatch } from "types/hooks";
import { ProjectListProps } from "./useProjectList";
import {
  PRODIGY_PROJECT_LIMIT,
  MAESTRO_PROJECT_LIMIT,
  VIRTUOSO_PROJECT_LIMIT,
} from "utils/constants";
import { useSubscription } from "providers/subscription";
import { getInstrumentName } from "types/Instrument/InstrumentFunctions";
import { isProject } from "types/Project/ProjectTypes";
import { getScaleName } from "types/Scale/ScaleFunctions";
import { selectPatternClips } from "types/Clip/ClipSelectors";
import { selectInstruments } from "types/Instrument/InstrumentSelectors";
import { selectPatternMap } from "types/Pattern/PatternSelectors";
import {
  selectScaleTracks,
  selectTrackMidiScale,
} from "types/Track/TrackSelectors";
import { selectMetadata } from "types/Meta/MetaSelectors";
import {
  createProject,
  deleteEmptyProjects,
} from "types/Project/ProjectThunks";
import {
  readLocalProjects,
  loadRandomProject,
} from "types/Project/ProjectLoaders";
import { exportProjectsToZIP } from "types/Project/ProjectExporters";

interface ProjectSearchProps extends ProjectListProps {}

export function useProjectSearch(props: ProjectSearchProps) {
  const { projects, searchingDemos } = props;
  const subscription = useSubscription();
  const dispatch = useProjectDispatch();
  const navigate = useNavigate();

  // Check if projects are capped
  const areProjectsCapped = useMemo(() => {
    if (subscription.isAdmin) {
      return false;
    }
    if (subscription.isProdigy) {
      return projects.length >= PRODIGY_PROJECT_LIMIT;
    }
    if (subscription.isMaestro) {
      return projects.length >= MAESTRO_PROJECT_LIMIT;
    }
    if (subscription.isVirtuoso) {
      return projects.length >= VIRTUOSO_PROJECT_LIMIT;
    }
    return true;
  }, [subscription, projects]);

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
          const meta = selectMetadata(project);
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
          const dateA = new Date(selectMetadata(a.project).lastUpdated);
          const dateB = new Date(selectMetadata(b.project).lastUpdated);
          return dateB.getTime() - dateA.getTime();
        }),
    [projects, query]
  );

  // Display the search bar and new project button
  const SearchBar = () => {
    const inputClass = classNames(
      "w-full h-10 px-4 rounded-lg text-slate-200 shadow-xl",
      "bg-transparent focus:outline-none focus:ring-2",
      "border border-slate-400 focus:border-transparent",
      searchingDemos ? "focus:ring-indigo-300/50" : "focus:ring-sky-400/70"
    );
    return (
      <div className="flex w-full items-center gap-3">
        <input
          name="project-search"
          type="text"
          className={inputClass}
          placeholder={`Search ${
            searchingDemos ? "Demos" : "Projects"
          } by Name, Date, Patterns, Scales, Instruments, etc.`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
    );
  };

  const ControlBar = () => {
    return (
      <div className="hidden lg:flex lg:animate-in lg:fade-in lg:duration-75 w-full items-center gap-3 text-sm px-1 [&>button]:text-sky-500 [&>button:disabled]:text-sky-700 [&>button:active]:text-sky-400">
        <button onClick={() => createProject()} disabled={areProjectsCapped}>
          Create a Project
        </button>
        •
        <button
          onClick={() => dispatch(readLocalProjects())}
          disabled={areProjectsCapped}
        >
          Upload a Project
        </button>
        •
        <button
          onClick={() =>
            dispatch(loadRandomProject(() => navigate("/playground")))
          }
        >
          Open a Random Project
        </button>
        •
        <button onClick={() => deleteEmptyProjects()}>
          Delete Empty Projects
        </button>
        •
        <button onClick={() => exportProjectsToZIP()}>
          Export All Projects
        </button>
      </div>
    );
  };

  const SearchMenu = useCallback(() => {
    const menuClass = classNames(
      "w-full my-6 p-4 rounded-lg",
      "flex flex-col items-center gap-4",
      "ring-2 shadow-xl backdrop-blur",
      searchingDemos
        ? "bg-gray-900/90 ring-gray-400/50"
        : "bg-slate-950/60 ring-sky-500/50"
    );
    return (
      <div className={menuClass}>
        {SearchBar()}
        {!searchingDemos && ControlBar()}
      </div>
    );
  }, [searchingDemos, SearchBar, ControlBar]);

  return { results, SearchMenu };
}
