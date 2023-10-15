import { Transition } from "@headlessui/react";
import Logo from "components/Logo";
import { Project } from "components/Project";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { lowerCase } from "lodash";
import { useMemo, useState } from "react";
import { BsArrowLeft, BsBack, BsPlus, BsUpload } from "react-icons/bs";
import { useNavigate } from "react-router-dom";
import { selectInstruments } from "redux/Instrument";
import { selectPatternMap } from "redux/Pattern";
import { selectScaleMap } from "redux/Scale";
import { selectScaleTrackMap, selectScaleTracks } from "redux/ScaleTrack";
import { useAppDispatch } from "redux/hooks";
import { selectClips } from "redux/selectors";
import { RootState } from "redux/store";
import {
  CREATE_PROJECT,
  DELETE_PROJECT,
  createNewProject,
  readProjectFiles,
} from "redux/thunks";
import { getInstrumentName } from "types/Instrument";
import { PROJECT_LIST } from "types/Project";
import { getScaleName, realizeNestedScaleNotes } from "types/Scale";
import { getScaleTrackScale } from "types/ScaleTrack";
import { getLocalStorageSpace } from "utils";

export const ProjectsView = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Update the projects when a new project is created or deleted
  useCustomEventListener(CREATE_PROJECT, () =>
    setProjects(localStorage.getItem(PROJECT_LIST))
  );
  useCustomEventListener(DELETE_PROJECT, () =>
    setProjects(localStorage.getItem(PROJECT_LIST))
  );

  // Get the available project states
  const [projects, setProjects] = useState(localStorage.getItem(PROJECT_LIST));
  const parsedProjects = projects ? (JSON.parse(projects) as string[]) : [];
  const parsedStates = parsedProjects.map((id) =>
    localStorage.getItem(id)
  ) as string[];
  const availableStates = parsedStates.map((_) => JSON.parse(_) as RootState);

  // Get the local storage space
  const { usedSpace, totalSpace } = getLocalStorageSpace();
  const usedMB = usedSpace / (1024 * 1024);
  const usedStorage =
    usedMB < 0.1
      ? `${(usedMB * 1024).toFixed(2)} KB`
      : `${usedMB.toFixed(2)} MB`;
  const totalMB = totalSpace / (1024 * 1024);

  // Get the filtered projects
  const [search, setSearch] = useState("");
  const filteredProjects = useMemo(
    () =>
      availableStates.filter((state) => {
        // Get the list of patterns used
        const clips = selectClips(state);
        const patternMap = selectPatternMap(state);
        const allPatternIds = clips.map(({ patternId }) => patternId);
        const patternIds = [...new Set(allPatternIds)];
        const allPatternNames = patternIds.map((id) => patternMap[id]?.name);
        const patternNames = [...new Set(allPatternNames)].map(lowerCase);

        // Get the list of scales used
        const scaleTracks = selectScaleTracks(state);
        const scaleTrackMap = selectScaleTrackMap(state);
        const scaleMap = selectScaleMap(state);
        const allScales = scaleTracks.map((track) =>
          getScaleTrackScale(track, scaleTrackMap, scaleMap)
        );
        const allScaleNames = allScales.map(getScaleName);
        const scaleNames = [...new Set(allScaleNames)].map(lowerCase);

        // Get the list of instruments used
        const instruments = selectInstruments(state);
        const allInstrumentNames = instruments.map(({ key }) =>
          getInstrumentName(key)
        );
        const instrumentNames = [...new Set(allInstrumentNames)].map(lowerCase);

        // Get the name of the project
        const name = state.project.name.toLowerCase();

        // Get the date of the project
        const date = new Date(state.project.dateCreated)
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
    [availableStates, search]
  );

  // Display the list of projects
  const Projects = () => (
    <div className="w-full h-full space-y-8">
      {filteredProjects.map((state, index) => (
        <Project state={state} index={index} key={state.project.id} />
      ))}
    </div>
  );

  // Display the search bar and new project button
  const SearchBar = () => {
    return (
      <div className="my-6 w-full flex items-center p-4 rounded space-x-3 bg-slate-950/80 border border-slate-50/50">
        <button
          className="h-full p-2 flex justify-center items-center text-slate-200 bg-slate-900/80 hover:bg-slate-950 rounded-lg border border-slate-400"
          onClick={() => dispatch(createNewProject())}
        >
          <BsPlus className="text-xl" />
        </button>
        <button
          className="h-full p-2 flex justify-center items-center text-slate-200 bg-slate-900/80 hover:bg-slate-950 rounded-lg border border-slate-400"
          onClick={() => dispatch(readProjectFiles())}
        >
          <BsUpload className="text-xl" />
        </button>
        <input
          type="text"
          className="w-full h-10 px-4 text-slate-200 bg-slate-900/80 rounded-lg border border-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          placeholder="Search Projects by Name, Date, Patterns, etc."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
    );
  };

  // Display the header of the project list
  const Header = () => {
    return (
      <div className="w-full flex bg-slate-900/90 shadow-2xl backdrop-blur p-4 rounded-lg ring-4 ring-sky-600/50 text-5xl">
        <BsArrowLeft
          className="p-3 mr-4 bg-slate-900 hover:bg-slate-950 border rounded-full cursor-pointer"
          onClick={() => navigate("/")}
        />
        <h1 className="font-bold whitespace-nowrap">Select a Project</h1>
        <h6 className="text-sm text-slate-400 ml-auto mt-auto whitespace-nowrap">
          ({usedStorage} / {totalMB} MB)
        </h6>
      </div>
    );
  };

  return (
    <Transition
      show={true}
      appear
      enter="transition-opacity duration-500"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-500"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      className="p-8 w-full h-full flex flex-col items-center text-white font-nunito overflow-scroll"
    >
      <Header />
      {SearchBar()}
      <Projects />
    </Transition>
  );
};
