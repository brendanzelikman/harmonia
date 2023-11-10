import { BsDownload, BsTrash } from "react-icons/bs";
import { selectInstruments } from "redux/Instrument";
import { selectPatternMap } from "redux/Pattern";
import { selectScaleTracks } from "redux/ScaleTrack";
import { selectTransport } from "redux/Transport";
import {
  selectMetadata,
  selectClips,
  selectTrackMidiScale,
  selectLastArrangementTick,
  selectTrackScaleNameAtTick,
} from "redux/selectors";
import {
  loadProject,
  deleteProject,
  exportProjectToHAM,
  createProject,
  loadProjectByPath,
} from "redux/thunks";
import { getInstrumentName } from "types/Instrument";
import { getScaleName } from "types/Scale";
import { convertTicksToSeconds } from "types/Transport";
import { cancelEvent } from "utils/html";
import { Logo } from "./Logo";
import { ReactNode, useEffect, useState } from "react";
import { useProjectDispatch } from "redux/hooks";
import { BiCopy } from "react-icons/bi";
import { Transition } from "@headlessui/react";
import { Project, isProject } from "types/Project";
import { useHeldHotkeys } from "lib/react-hotkeys-hook";
import { useNavigate } from "react-router-dom";
import { getPatternName } from "types/Pattern";

interface ProjectProps {
  project?: Project;
  index?: number;
  filePath?: string;
}

export function ProjectComponent(props: ProjectProps) {
  const dispatch = useProjectDispatch();
  const navigate = useNavigate();
  const { index } = props;
  const heldKeys = useHeldHotkeys(["alt"]);

  const [project, setProject] = useState(props.project ?? ({} as Project));
  const [loaded, setLoaded] = useState(!!props.project);
  const isInvalid = !isProject(project);

  useEffect(() => {
    if (!props.project && !!props.filePath) {
      fetch(props.filePath)
        .then((res) => res.json())
        .then(setProject)
        .then(() => setLoaded(true));
    }
  }, [props]);

  const [deleting, setDeleting] = useState(false);
  const toggleDeleting = () => setDeleting((prev) => !prev);

  if (!loaded) return null;

  // Get general info about the project
  const meta = selectMetadata(project);
  const { id, name } = meta;
  const dateCreated = new Date(meta.dateCreated).toLocaleString();
  const lastUpdated = new Date(meta.lastUpdated).toLocaleString();
  const transport = selectTransport(project);
  const { bpm, timeSignature } = transport;

  // Get the duration of the project
  const lastTick = selectLastArrangementTick(project);
  const duration = convertTicksToSeconds(transport, lastTick);
  const seconds = `${duration.toFixed(1)}s`;

  // Get the list of patterns used
  const clips = selectClips(project);
  const patternMap = selectPatternMap(project);
  const clipPatterns = clips.map(({ patternId }) => patternMap[patternId]);
  const patternNames = [...new Set(clipPatterns.map(getPatternName))];

  // Get the list of scales used
  const scaleTracks = selectScaleTracks(project);
  const allScaleNames = scaleTracks.map((track) =>
    selectTrackScaleNameAtTick(project, track.id, 0)
  );
  const scaleNames = [...new Set(allScaleNames)];

  // Get the list of instruments used
  const instruments = selectInstruments(project);
  const allInstrumentNames = instruments.map(({ key }) =>
    getInstrumentName(key)
  );
  const instrumentNames = [...new Set(allInstrumentNames)];

  /** Display some buttons for copying and deleting */
  const ProjectControl = () => (
    <div
      className="w-full space-x-2 py-1 px-2 flex items-center justify-center text-md bg-slate-900 rounded border border-slate-700 cursor-default [&>*]:cursor-pointer [&>*]:rounded"
      onClick={cancelEvent}
    >
      <BsDownload
        className="px-1 hover:bg-slate-800 rounded"
        onClick={() => dispatch(exportProjectToHAM(project))}
      />
      <BiCopy
        className="px-1 hover:bg-slate-800 rounded"
        onClick={() => createProject(project)}
      />
      <div className="flex relative h-full">
        <BsTrash
          className="px-1 hover:bg-slate-800 rounded"
          onClick={toggleDeleting}
        />
        <Transition
          show={deleting}
          appear
          enter="transition-all duration-300 ease-in-out"
          enterFrom="opacity-0 scale-75"
          enterTo="opacity-100 scale-100"
          leave="transition-all duration-300 ease-in-out"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-75"
          className="absolute p-1 w-32 bg-slate-900 shadow-xl left-4 top-5 rounded border-2 border-slate-600/80 text-xs text-slate-200 whitespace-nowrap"
        >
          <div
            className="flex px-2 flex-col items-center"
            onClick={toggleDeleting}
          >
            <p className="pb-1 mb-1 text-center border-b border-b-slate-500 w-full">
              Are you sure?
            </p>
            <div className="flex w-full items-center justify-center">
              <button
                className="px-4 hover:bg-slate-700 hover:text-red-500 rounded"
                onClick={(e) => {
                  cancelEvent(e);
                  dispatch(deleteProject(id));
                }}
              >
                Yes
              </button>
              <button className="px-4 hover:bg-slate-700 hover:text-sky-200 rounded">
                No
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  );

  /** Display the logo and file number */
  const ProjectLogo = () => (
    <div className="my-auto w-24 flex flex-col items-center text-sky-400 text-xl font-bold">
      <Logo className="h-16" />
      {index !== undefined && (
        <h1 className="my-1">
          {!!props.filePath ? "Demo" : "File"} #{index + 1}
        </h1>
      )}
      {!!props.project && <ProjectControl />}
    </div>
  );

  /** Display the title and general info */
  const ProjectTitle = () => (
    <div className="ml-5 mr-3 h-full flex-1 flex flex-col justify-center truncate [&>*]:truncate">
      <h1 className="text-3xl text-white font-bold">
        {heldKeys.alt ? id.slice(!props.filePath ? 0 : 17) : name}
      </h1>
      <h6 className="text-slate-400">Date Created: {dateCreated}</h6>
      <h6 className="text-slate-400">Last Updated: {lastUpdated}</h6>
      <h2 className="mt-2 text-md">
        <p>
          Duration: {seconds} @ {bpm}BPM
        </p>
        <p>
          Time Signature: {timeSignature[0]}/{timeSignature[1]}
        </p>
      </h2>
    </div>
  );

  /** Format the list of items */
  const renderTypeList = (items: string[]) => {
    if (!items.length) return <li>None Used</li>;
    return items.map((name) => (
      <li key={name} className="w-full">
        {name}
      </li>
    ));
  };

  /** A padded container for a list of types */
  const TypeContainer = (props: {
    className?: string;
    children: ReactNode;
  }) => (
    <div
      className={`lg:w-48 xl:w-60 h-full px-2 lg:px-4 py-1 bg-slate-800 border border-slate-500 rounded-lg flex flex-col items-center flex-shrink-0 overflow-scroll text-ellipsis ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </div>
  );

  /** The header of a list of types */
  const TypeHeader = (props: { children: ReactNode; className?: string }) => (
    <h2
      className={`flex w-full mb-2 items-center text-emerald-500 border-b text-lg ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </h2>
  );

  /** The list of types */
  const TypeList = (props: { children: ReactNode }) => (
    <ul className="flex-1 w-full space-y-1 [&>*]:truncate">{props.children}</ul>
  );

  /** Display some types and a dropdown menu */
  const ProjectBody = () => (
    <div className="hidden lg:flex flex-shrink-0 justify-end xl:space-x-8 lg:space-x-4 space-x-2">
      <TypeContainer className="group-hover:shadow-[0px_0px_20px_-5px_rgb(16,185,129)]">
        <TypeHeader className="text-emerald-500">Patterns</TypeHeader>
        <TypeList>{renderTypeList(patternNames)}</TypeList>
      </TypeContainer>
      <TypeContainer className="group-hover:shadow-[0px_0px_20px_-5px_rgb(14,165,233)]">
        <TypeHeader className="text-sky-400">Scales</TypeHeader>
        <TypeList>{renderTypeList(scaleNames)}</TypeList>
      </TypeContainer>
      <TypeContainer className="group-hover:shadow-[0px_0px_20px_-5px_rgb(255,138,76)]">
        <TypeHeader className="text-orange-400">Instruments</TypeHeader>
        <TypeList>{renderTypeList(instrumentNames)}</TypeList>
      </TypeContainer>
    </div>
  );

  const border = `rounded-lg border border-slate-400 ${
    deleting
      ? "shadow-[0px_0px_20px_0px_rgb(255,0,0)]"
      : "hover:shadow-[0px_0px_20px_0px_rgb(20,20,20)]"
  }`;

  const callback = () => navigate("/playground");
  const onClick = () => {
    !!props.filePath
      ? dispatch(loadProjectByPath(props.filePath, callback))
      : dispatch(loadProject(id, callback));
  };

  return (
    <Transition
      appear
      enter="transition-opacity duration-300"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-300"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      key={id}
      className={`group w-full flex p-4 h-40 ${
        isInvalid
          ? "bg-slate-800 ring ring-red-500 cursor-not-allowed"
          : "bg-slate-900/90 hover:bg-slate-900 cursor-pointer"
      }  ${border} text-slate-200 text-sm transition-all duration-150`}
      onClick={() => !isInvalid && onClick()}
    >
      <ProjectLogo />
      <ProjectTitle />
      <ProjectBody />
    </Transition>
  );
}
