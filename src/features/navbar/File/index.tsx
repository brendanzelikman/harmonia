import { CiUndo, CiRedo, CiFileOn } from "react-icons/ci";
import {
  selectEditor,
  selectRoot,
  selectTransport,
  selectTimelineEndTick,
} from "redux/selectors";
import { blurOnEnter, percentOfRange } from "utils";
import { BiMusic, BiSave, BiTrash, BiUpload } from "react-icons/bi";
import { SiMidi } from "react-icons/si";
import { clearState, readFiles, saveStateToFile } from "redux/util";
import { Menu, Transition } from "@headlessui/react";
import { Fragment, useMemo } from "react";
import {
  downloadTransport,
  saveStateToMIDI,
  stopDownloadingTransport,
} from "redux/thunks";
import { BsFiletypeWav } from "react-icons/bs";
import { toggleEditor } from "redux/Editor";
import { loadDemo, setProjectName } from "redux/Root";
import {
  NavbarButton,
  NavbarFormGroup,
  NavbarFormLabel,
  NavbarTooltip,
} from "../components";
import { useAppDispatch, useAppSelector } from "redux/hooks";
import { isEditorOn } from "types/Editor";
import { redoSession, undoSession } from "redux/Session";
import { globalOfflineTick } from "types/Transport";

export default function FileControl() {
  const dispatch = useAppDispatch();
  const canUndo = useAppSelector((state) => state.session.past.length);
  const canRedo = useAppSelector((state) => state.session.future.length);
  const { downloading } = useAppSelector(selectTransport);
  const endTick = useAppSelector(selectTimelineEndTick);
  const root = useAppSelector(selectRoot);
  const editor = useAppSelector(selectEditor);
  const onFileEditor = isEditorOn(editor, "file");

  /**
   * The undo button allows the user to undo the session.
   */
  const UndoButton = () => (
    <NavbarButton
      className={`text-xs p-1 ${canUndo ? "active:bg-sky-500" : ""}`}
      onClick={() => canUndo && dispatch(undoSession())}
      disabled={!canUndo}
      disabledClass="text-white/50 cursor-default"
      label="undo"
    >
      <CiUndo className="text-3xl" />
    </NavbarButton>
  );

  /**
   * The redo button allows the user to redo the session.
   */
  const RedoButton = () => (
    <NavbarButton
      className={`text-xs p-1 ${canRedo ? "active:bg-sky-500" : ""}`}
      onClick={() => canRedo && dispatch(redoSession())}
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
      className="pr-1 h-8 hover:bg-sky-600"
      onClick={saveStateToFile}
    >
      <NavbarFormLabel>Save to HAM</NavbarFormLabel>
      <div className="text-2xl">
        <BiSave />
      </div>
    </NavbarFormGroup>
  );

  /**
   * The load HAM button allows the user to read and load a Harmonia file.
   */
  const LoadFromHAMButton = () => (
    <NavbarFormGroup className="pr-1 h-8 hover:bg-sky-600" onClick={readFiles}>
      <NavbarFormLabel>Load from HAM</NavbarFormLabel>
      <div className="text-2xl">
        <BiUpload />
      </div>
    </NavbarFormGroup>
  );

  /**
   * The save to MIDI button allows the user to save the current state to a MIDI file.
   */
  const SaveToMIDIButton = () => (
    <NavbarFormGroup
      className="pr-1 h-8 hover:bg-sky-600"
      onClick={() => dispatch(saveStateToMIDI())}
    >
      <NavbarFormLabel>Export to MIDI</NavbarFormLabel>
      <div className="text-2xl">
        <SiMidi />
      </div>
    </NavbarFormGroup>
  );

  /**
   * The save to WAV button allows the user to export the project as a WAV file.
   */
  const SaveToWAVButton = useMemo(() => {
    const progress = downloading
      ? percentOfRange(globalOfflineTick, 0, endTick)
      : 0;
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
        className="pr-1 h-8 hover:bg-sky-600"
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
  }, [downloading, globalOfflineTick, endTick]);

  /**
   * The demo button allows the user to load the demo project.
   */
  const DemoButton = () => (
    <NavbarFormGroup
      className="pr-1 h-8 hover:bg-sky-600"
      onClick={() => dispatch(loadDemo())}
    >
      <NavbarFormLabel>Load Demo</NavbarFormLabel>
      <div className="text-2xl">
        <BiMusic />
      </div>
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
        <Menu.Items className="absolute flex flex-col items-center -top-8 -right-52 -mr-4 px-2 py-2 bg-slate-800 border border-slate-400 text-xs rounded">
          <div className="w-full text-center pb-1 mb-1 font-bold border-b border-b-slate-500/50">
            Clear Project?
          </div>
          <span className="text-xs px-1 mb-2 text-slate-400">
            You will lose all unsaved changes.
          </span>
          <div className="flex w-full justify-center items-center space-x-2">
            <button
              className="w-1/2 px-2 py-1 rounded border border-red-500 hover:text-red-500 hover:drop-shadow cursor-pointer"
              onClick={clearState}
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
      <NavbarFormGroup className="h-full hover:bg-sky-600">
        <Menu as="div" className="relative inline-block py-1 text-left w-full">
          {({ open, close }) => (
            <>
              <Menu.Button className="pr-1 w-full inline-flex items-center">
                <NavbarFormLabel>Clear Project</NavbarFormLabel>
                <div className="text-2xl">
                  <BiTrash className="text-2xl" />
                </div>
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
    <input
      className="bg-transparent text-white placeholder-slate-400 placeholder-shown:border-slate-400 rounded mb-2 m-1 text-sm focus:ring-0 border border-slate-300 focus:border-blue-400 focus:bg-sky-700"
      type="text"
      placeholder="New Project"
      value={root.projectName}
      onChange={(e) => dispatch(setProjectName(e.target.value))}
      onKeyDown={blurOnEnter}
    />
  );

  /**
   * The File button allows the user to toggle the file editor.
   */
  const FileButton = () => (
    <CiFileOn
      className={`text-3xl select-none cursor-pointer mr-1 ${
        onFileEditor ? "text-sky-400" : ""
      }`}
      onClick={() => dispatch(toggleEditor("file"))}
    />
  );

  /**
   * The File tooltip content contains all of the file controls.
   */
  const FileTooltipContent = () => (
    <div className="flex flex-col justify-center items-center">
      {ProjectNameField()}
      <SaveToHAMButton />
      <LoadFromHAMButton />
      <SaveToWAVButton />
      <SaveToMIDIButton />
      <DemoButton />
      <ClearButton />
    </div>
  );

  return (
    <div className="flex items-center">
      <FileButton />
      <NavbarTooltip
        className="bg-gradient-to-t from-sky-900 to-sky-800"
        show={!!onFileEditor}
        content={FileTooltipContent}
      />
      <UndoButton />
      <RedoButton />
    </div>
  );
}
