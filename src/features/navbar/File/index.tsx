import { CiUndo, CiRedo } from "react-icons/ci";
import {
  selectEditor,
  selectMetadata,
  selectTransport,
  selectTimelineEndTick,
} from "redux/selectors";
import { blurOnEnter, percentOfRange } from "utils";
import { BiMusic, BiSave, BiTrash, BiUpload } from "react-icons/bi";
import { SiMidi } from "react-icons/si";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useMemo } from "react";
import {
  clearProject,
  downloadTransport,
  openLocalProjects,
  exportProjectToHAM,
  exportProjectToMIDI,
  stopDownloadingTransport,
} from "redux/thunks";
import { BsFiletypeWav, BsMusicPlayerFill } from "react-icons/bs";
import { toggleEditor } from "redux/Editor";
import { setProjectName } from "redux/Metadata";
import {
  NavbarButton,
  NavbarFormGroup,
  NavbarFormInput,
  NavbarFormLabel,
  NavbarTooltip,
  NavbarTooltipMenu,
} from "../components";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { isEditorOn } from "types/Editor";
import useTransportTick from "hooks/useTransportTick";
import { useNavigate } from "react-router-dom";
import { undoArrangement, redoArrangement } from "redux/Arrangement";

export function NavbarFileMenu() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const canUndo = useAppSelector((state) => state.arrangement.past.length);
  const canRedo = useAppSelector((state) => state.arrangement.future.length);
  const { downloading } = useAppSelector(selectTransport);
  const offlineTick = useTransportTick({ offline: true });
  const endTick = useAppSelector(selectTimelineEndTick);
  const project = useAppSelector(selectMetadata);
  const editor = useAppSelector(selectEditor);
  const onFileEditor = isEditorOn(editor, "file");

  /**
   * The undo button allows the user to undo the arrangement.
   */
  const UndoButton = () => (
    <NavbarButton
      className={`p-1 ${canUndo ? "active:bg-sky-500" : ""}`}
      onClick={() => canUndo && dispatch(undoArrangement())}
      disabled={!canUndo}
      disabledClass="text-white/50 cursor-default"
      label="undo"
    >
      <CiUndo className="text-3xl" />
    </NavbarButton>
  );

  /**
   * The redo button allows the user to redo the arrangement.
   */
  const RedoButton = () => (
    <NavbarButton
      className={`p-1 ${canRedo ? "active:bg-sky-500" : ""}`}
      onClick={() => canRedo && dispatch(redoArrangement())}
      disabled={!canRedo}
      disabledClass="text-white/50 cursor-default"
      label="redo"
    >
      <CiRedo className="text-3xl" />
    </NavbarButton>
  );

  /**
   * The save to HAM button allows the user to save the current state to a Harmonia file.
   */
  const SaveToHAMButton = () => (
    <NavbarFormGroup
      className="px-2 h-8 hover:bg-sky-600 cursor-pointer"
      onClick={() => dispatch(exportProjectToHAM())}
    >
      <NavbarFormLabel>Save to HAM</NavbarFormLabel>
      <BiSave className="text-2xl" />
    </NavbarFormGroup>
  );

  /**
   * The load HAM button allows the user to read and load a Harmonia file.
   */
  const LoadFromHAMButton = () => (
    <NavbarFormGroup
      className="px-2 h-8 hover:bg-sky-600 cursor-pointer"
      onClick={() => dispatch(openLocalProjects())}
    >
      <NavbarFormLabel>Load from HAM</NavbarFormLabel>
      <BiUpload className="text-2xl" />
    </NavbarFormGroup>
  );

  /**
   * The save to WAV button allows the user to export the project as a WAV file.
   */
  const SaveToWAVButton = useMemo(() => {
    const progress = downloading ? percentOfRange(offlineTick, 0, endTick) : 0;
    const percent = progress.toFixed(0);
    const finished = progress === 100;
    /**
     * The progress tooltip shows the progress of the export and
     * allows the user to cancel the export.
     */
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
          style={{ width: `${percent}%` }}
        ></div>
        <label className={`${finished ? "text-emerald-400" : "text-white/50"}`}>
          {finished ? "Exporting..." : "Rendering..."} {percent}%
        </label>
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
        className="h-8 hover:bg-sky-600 cursor-pointer"
        onClick={
          downloading
            ? () => dispatch(stopDownloadingTransport())
            : () => dispatch(downloadTransport())
        }
      >
        <NavbarFormLabel className={``}>Export to WAV</NavbarFormLabel>
        <div className="relative flex flex-col text-2xl">
          <BsFiletypeWav className="text-2xl" />
          <ProgressTooltip />
        </div>
      </NavbarFormGroup>
    );
  }, [downloading, offlineTick, endTick]);

  /**
   * The save to MIDI button allows the user to save the current state to a MIDI file.
   */
  const SaveToMIDIButton = () => (
    <NavbarFormGroup
      className="h-8 hover:bg-sky-600 cursor-pointer"
      onClick={() => dispatch(exportProjectToMIDI())}
    >
      <NavbarFormLabel>Export to MIDI</NavbarFormLabel>
      <SiMidi className="text-2xl" />
    </NavbarFormGroup>
  );

  /**
   * The projects button allows the user to view their projects.
   */
  const ProjectsButton = () => (
    <NavbarFormGroup
      className="h-8 hover:bg-sky-600 cursor-pointer"
      onClick={() => navigate("/projects")}
    >
      <NavbarFormLabel>View Projects</NavbarFormLabel>
      <BiMusic className="text-2xl" />
    </NavbarFormGroup>
  );

  /**
   * The clear button allows the user to clear the project.
   */
  const ClearButton = () => {
    /**
     * The clear project tooltip always shows a confirmation dialog before clearing.
     */
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
              className="w-1/2 px-2 py-1 rounded border border-red-500 hover:text-red-500 hover:drop-shadow cursor-pointer"
              onClick={() => dispatch(clearProject())}
            >
              Yes
            </button>
            <button
              className="w-1/2 px-2 py-1 rounded border border-slate-500 hover:text-slate-500 hover:drop-shadow cursor-pointer"
              onClick={props.close}
            >
              No
            </button>
          </div>
        </Menu.Items>
      </Transition>
    );
    return (
      <NavbarFormGroup className="h-8 hover:bg-sky-600 cursor-pointer">
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

  /**
   * The project name field allows the user to change the project name.
   */
  const ProjectNameField = () => (
    <NavbarFormInput
      className="w-full focus:bg-sky-700/80 py-2 mb-2"
      type="text"
      placeholder="New Project"
      value={project.name}
      onChange={(e) => dispatch(setProjectName(e.target.value))}
      onKeyDown={blurOnEnter}
    />
  );

  /**
   * The File button allows the user to toggle the file editor.
   */
  const FileButton = () => (
    <BsMusicPlayerFill
      className={`text-2xl select-none cursor-pointer mr-1 ${
        onFileEditor ? "text-sky-500" : "text-slate-300"
      }`}
      onClick={() => dispatch(toggleEditor("file"))}
    />
  );

  const FileTooltip = () => {
    return (
      <NavbarTooltip
        className="mt-2 bg-sky-800/75 shadow-xl"
        show={!!onFileEditor}
        content={
          <NavbarTooltipMenu>
            {ProjectNameField()}
            <SaveToHAMButton />
            <LoadFromHAMButton />
            <SaveToWAVButton />
            <SaveToMIDIButton />
            <ProjectsButton />
            <ClearButton />
          </NavbarTooltipMenu>
        }
      />
    );
  };

  return (
    <div className="flex items-center">
      <FileButton />
      {FileTooltip()}
      <UndoButton />
      <RedoButton />
    </div>
  );
}
