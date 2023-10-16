import * as Selectors from "redux/selectors";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { lowerCase } from "lodash";
import { useState, useMemo } from "react";
import { BsPlus, BsUpload } from "react-icons/bs";
import { getInstrumentName } from "types/Instrument";
import { getScaleName } from "types/Scale";
import { getScaleTrackScale } from "types/ScaleTrack";
import { useAppDispatch } from "redux/hooks";
import { ProjectComponent } from "components/Project";
import { Transition } from "@headlessui/react";
import { getProjectsFromDB } from "indexedDB";
import { Project } from "types/Project";
import {
  CREATE_PROJECT,
  DELETE_PROJECT,
  createProject,
  openLocalProjects,
} from "redux/Project";
import { useDatabaseCallback } from "hooks/useDatabaseCallback";

export function Projects() {
  const dispatch = useAppDispatch();

  const [projects, setProjects] = useState<Project[]>([]);
  const updateProjects = async () => setProjects(await getProjectsFromDB());

  // Update the projects when a new project is created or deleted
  useDatabaseCallback(updateProjects);
  useCustomEventListener(CREATE_PROJECT, updateProjects);
  useCustomEventListener(DELETE_PROJECT, updateProjects);

  // Get the filtered projects
  const [search, setSearch] = useState("");
  const filteredProjects = useMemo(
    () =>
      projects.filter((state) => {
        // Get the list of patterns used
        const clips = Selectors.selectClips(state);
        const patternMap = Selectors.selectPatternMap(state);
        const allPatternIds = clips.map(({ patternId }) => patternId);
        const patternIds = [...new Set(allPatternIds)];
        const allPatternNames = patternIds.map((id) => patternMap[id]?.name);
        const patternNames = [...new Set(allPatternNames)].map(lowerCase);

        // Get the list of scales used
        const scaleTracks = Selectors.selectScaleTracks(state);
        const scaleTrackMap = Selectors.selectScaleTrackMap(state);
        const scaleMap = Selectors.selectScaleMap(state);
        const allScales = scaleTracks.map((track) =>
          getScaleTrackScale(track, scaleTrackMap, scaleMap)
        );
        const allScaleNames = allScales.map(getScaleName);
        const scaleNames = [...new Set(allScaleNames)].map(lowerCase);

        // Get the list of instruments used
        const instruments = Selectors.selectInstruments(state);
        const allInstrumentNames = instruments.map(({ key }) =>
          getInstrumentName(key)
        );
        const instrumentNames = [...new Set(allInstrumentNames)].map(lowerCase);

        // Get the name of the project
        const name = state.meta.name.toLowerCase();

        // Get the date of the project
        const date = new Date(state.meta.dateCreated)
          .toLocaleString("default", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })
          .toLowerCase();

        // Filter the projects
        const hasPattern = patternNames.some((_) => _.includes(search));
        const hasScale = scaleNames.some((_) => _.includes(search));
        const hasInstrument = instrumentNames.some((_) => _.includes(search));
        const hasName = name.includes(search);
        const hasDate = date.includes(search);
        return hasPattern || hasScale || hasInstrument || hasName || hasDate;
      }),
    [projects, search]
  );

  // Display the list of projects
  const ProjectList = () => (
    <div className="w-full h-full space-y-8">
      {filteredProjects.map((state, index) => (
        <ProjectComponent state={state} index={index} key={state.meta.id} />
      ))}
    </div>
  );

  // Display the search bar and new project button
  const SearchBar = () => {
    return (
      <div className="my-6 w-full flex items-center p-4 rounded space-x-3 bg-slate-950/80 border border-slate-50/50 [&>*]:bg-slate-900/80">
        <button
          className="h-full p-2 flex justify-center items-center text-slate-200 hover:bg-slate-950 rounded-lg border border-slate-400"
          onClick={() => createProject()}
        >
          <BsPlus className="text-xl" />
        </button>
        <button
          className="h-full p-2 flex justify-center items-center text-slate-200 hover:bg-slate-950 rounded-lg border border-slate-400"
          onClick={() => dispatch(openLocalProjects())}
        >
          <BsUpload className="text-xl" />
        </button>
        <input
          type="text"
          className="w-full h-10 px-4 text-slate-200 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          placeholder="Search Projects by Name, Date, Patterns, etc."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    );
  };

  return (
    <Transition
      show
      appear
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="w-full h-full"
    >
      {SearchBar()}
      {ProjectList()}
    </Transition>
  );
}
