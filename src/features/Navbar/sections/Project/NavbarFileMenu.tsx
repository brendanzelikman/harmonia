import { blurOnEnter } from "utils/html";
import { BiMusic, BiSave, BiTrash, BiUpload } from "react-icons/bi";
import { SiMidi } from "react-icons/si";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useMemo } from "react";
import { BsFiletypeWav } from "react-icons/bs";
import {
  NavbarFormGroup,
  NavbarFormInput,
  NavbarFormLabel,
  NavbarHoverTooltip,
} from "../../components";
import { useTransportTick } from "hooks";
import { percent } from "utils/math";
import { useSubscription } from "providers/subscription";
import { GiSecretBook } from "react-icons/gi";
import classNames from "classnames";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import { setProjectName } from "types/Project/MetadataSlice";
import { selectMetadata } from "types/Project/MetadataSelectors";
import { selectLastArrangementTick } from "types/Arrangement/ArrangementSelectors";
import { selectTransport } from "types/Transport/TransportSelectors";
import { createProject, clearProject } from "types/Project/ProjectThunks";
import { readLocalProjects } from "types/Project/ProjectLoaders";
import { exportProjectToHAM } from "types/Project/ProjectExporters";
import { exportProjectToMIDI } from "types/Project/ProjectExporters";
import {
  stopDownloadingTransport,
  downloadTransport,
} from "types/Transport/TransportThunks";

export function NavbarFileMenu() {
  const dispatch = useProjectDispatch();
  const { isAtLeastStatus } = useSubscription();
  const { downloading } = useProjectSelector(selectTransport);
  const offlineTick = useTransportTick({ offline: true });
  const endTick = useProjectSelector(selectLastArrangementTick);
  const meta = useProjectSelector(selectMetadata);

  /** The project name field allows the user to change the project name. */
  const ProjectNameField = (
    <div>
      <NavbarFormInput
        id="projectName"
        className="w-full focus:bg-indigo-900/50 py-2 mb-2"
        type="text"
        placeholder="New Project"
        value={meta.name}
        onChange={(e) => dispatch(setProjectName(e.target.value))}
        onKeyDown={blurOnEnter}
      />
      <label
        htmlFor="projectName"
        className={`absolute text-xs text-indigo-400 duration-300 transform scale-75 top-1.5 z-10 origin-0 bg-gray-800 rounded px-1 left-4`}
      >
        Project Name
      </label>
    </div>
  );

  /** The new project button allows the user to create a new project. */
  const NewProjectButton = () => (
    <NavbarFormGroup
      className="h-8 space-x-4 hover:bg-indigo-500/25 cursor-pointer"
      onClick={() => createProject().then(() => location.reload())}
    >
      <NavbarFileLabel>Open New Project</NavbarFileLabel>
      <div className="w-16">
        <BiMusic className="ml-auto text-2xl" />
      </div>
    </NavbarFormGroup>
  );

  /** The save to HAM button allows the user to save the current state to a Harmonia file. */
  const SaveToHAMButton = () => (
    <NavbarFormGroup
      className="px-2 h-8 space-x-4 hover:bg-indigo-500/25 cursor-pointer"
      onClick={() => dispatch(exportProjectToHAM())}
    >
      <NavbarFileLabel>Save to HAM</NavbarFileLabel>
      <div className="w-16">
        <BiSave className="ml-auto text-2xl" />
      </div>
    </NavbarFormGroup>
  );

  /** The load HAM button allows the user to read and load a Harmonia file. */
  const LoadFromHAMButton = () => (
    <NavbarFormGroup
      className="px-2 h-8 space-x-4 hover:bg-indigo-500/25 cursor-pointer"
      onClick={() => dispatch(readLocalProjects())}
    >
      <NavbarFileLabel>Load from HAM</NavbarFileLabel>
      <div className="w-16">
        <BiUpload className="ml-auto text-2xl" />
      </div>
    </NavbarFormGroup>
  );

  /** The merge HAM button allows the user to import and merge a Harmonia file. */
  const MergeFromHAMButton = () => (
    <NavbarFormGroup
      className="px-2 h-8 space-x-4 hover:bg-indigo-500/25 cursor-pointer"
      onClick={() => dispatch(readLocalProjects({ merging: true }))}
    >
      <NavbarFileLabel>Import from File</NavbarFileLabel>
      <div className="w-16">
        <BiUpload className="ml-auto text-2xl" />
      </div>
    </NavbarFormGroup>
  );

  /** The export to WAV button allows the user to export the project as a WAV file. */
  const ExportToWAVButton = useMemo(() => {
    const progress = downloading ? percent(offlineTick, 0, endTick) : 0;
    const exportPercent = progress.toFixed(0);
    const finished = progress === 100;

    /** The progress tooltip shows the export progress and offers a cancel button. */
    const ProgressTooltip = () => (
      <Transition
        show={downloading}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
        className={`text-xs w-32 absolute flex flex-col top-0 -right-36 p-2 border rounded bg-slate-800 ${
          finished ? "border-slate-400" : "border-slate-500"
        }`}
      >
        <div
          className="h-1 self-start mb-1 w-full rounded bg-emerald-400 transition-all duration-300"
          style={{ width: `${exportPercent}%` }}
        ></div>
        <span className={`${finished ? "text-emerald-400" : "text-white/50"}`}>
          {finished ? "Exporting..." : "Rendering..."} {exportPercent}%
        </span>
        <button
          className="self-start mt-2 text-center border border-slate-500 bg-slate-800 p-1 px-2 rounded"
          onClick={() => dispatch(stopDownloadingTransport())}
        >
          Cancel
        </button>
      </Transition>
    );

    return () => (
      <NavbarFormGroup
        className={`h-8 space-x-4 ${
          !endTick ? "text-slate-500" : "hover:bg-indigo-500/25 cursor-pointer"
        }`}
        onClick={() =>
          !endTick
            ? null
            : downloading
            ? dispatch(stopDownloadingTransport())
            : dispatch(downloadTransport())
        }
      >
        <NavbarFileLabel>Export to WAV</NavbarFileLabel>
        <div className="relative flex flex-col text-2xl">
          <BsFiletypeWav className="text-2xl" />
          <ProgressTooltip />
        </div>
      </NavbarFormGroup>
    );
  }, [downloading, offlineTick, endTick]);

  /** The export to MIDI button allows the user to save the current state to a MIDI file. */
  const ExportToMIDIButton = () => (
    <NavbarFormGroup
      className={`h-8 space-x-4 ${
        !endTick ? "text-slate-500" : "hover:bg-indigo-500/25 cursor-pointer"
      }`}
      onClick={() => dispatch(exportProjectToMIDI())}
    >
      <NavbarFileLabel>Export to MIDI</NavbarFileLabel>
      <SiMidi className="text-2xl" />
    </NavbarFormGroup>
  );

  /** The clear button allows the user to clear the project. */
  const ClearProjectButton = () => {
    /** The clear project tooltip always shows a confirmation dialog before clearing. */
    const ClearProjectTooltip = (props: {
      open: boolean;
      close: () => void;
    }) => (
      <Transition
        as={Fragment}
        show={props.open}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute flex flex-col items-center -top-8 -right-52 -mr-5 px-2 py-2 bg-slate-800 border border-slate-400 text-xs rounded">
          <div className="w-full text-center pb-1 mb-1 font-bold border-b border-b-slate-500/50">
            Clear Project?
          </div>
          <span className="text-xs px-1 mb-2 text-slate-400">
            You will lose all unsaved changes.
          </span>
          <div className="flex w-full justify-center items-center space-x-2">
            <button
              className="w-1/2 px-2 py-1 rounded border border-red-500 hover:text-red-500 hover:shadow-md cursor-pointer"
              onClick={() => dispatch(clearProject())}
            >
              Yes
            </button>
            <button
              className="w-1/2 px-2 py-1 rounded border border-slate-500 hover:text-slate-500 hover:shadow-md cursor-pointer"
              onClick={props.close}
            >
              No
            </button>
          </div>
        </Menu.Items>
      </Transition>
    );
    return (
      <NavbarFormGroup className="h-8 space-x-4 hover:bg-indigo-500/25 cursor-pointer">
        <Menu as="div" className="w-full relative">
          {({ open, close }) => (
            <>
              <Menu.Button className="w-full inline-flex justify-between items-center">
                <NavbarFormLabel>Clear Project</NavbarFormLabel>
                <BiTrash className="text-2xl" />
              </Menu.Button>
              <ClearProjectTooltip open={open} close={close} />
            </>
          )}
        </Menu>
      </NavbarFormGroup>
    );
  };

  return (
    <div className="group relative shrink-0">
      {/* Button */}
      <div className="rounded-full p-1.5">
        <GiSecretBook
          className={classNames(
            "size-full select-none cursor-pointer group-hover:text-indigo-300"
          )}
        />
      </div>

      {/* Tooltip */}
      <NavbarHoverTooltip bgColor="bg-slate-800">
        <div className="size-full py-1 space-y-1.5">
          {ProjectNameField}
          {isAtLeastStatus("maestro") && <NewProjectButton />}
          <SaveToHAMButton />
          <LoadFromHAMButton />
          <MergeFromHAMButton />
          <ExportToWAVButton />
          {isAtLeastStatus("maestro") && <ExportToMIDIButton />}
          <ClearProjectButton />
        </div>
      </NavbarHoverTooltip>
    </div>
  );
}

function NavbarFileLabel({ children }: { children: React.ReactNode }) {
  return (
    <NavbarFormLabel className="w-24 hover:opacity-95 active:opacity-100 whitespace-nowrap">
      {children}
    </NavbarFormLabel>
  );
}
