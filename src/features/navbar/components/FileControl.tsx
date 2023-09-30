import { connect, ConnectedProps } from "react-redux";
import { RootState, AppDispatch } from "redux/store";
import {
  NavbarFormGroup,
  NavbarFormLabel,
  NavbarTooltip,
  NavButton,
} from "./Navbar";
import { CiUndo, CiRedo, CiFileOn } from "react-icons/ci";
import { UndoTypes } from "redux/undoTypes";
import { setProjectName } from "redux/slices/root";
import {
  selectEditor,
  selectRoot,
  selectTransport,
  selectTransportEndTick,
} from "redux/selectors";
import { blurOnEnter, percentOfRange } from "utils";
import { BiMusic, BiSave, BiTrash, BiUpload } from "react-icons/bi";
import { SiMidi } from "react-icons/si";
import {
  clearState,
  loadStateFromString,
  readFiles,
  saveStateToFile,
} from "redux/util";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { saveStateToMIDI } from "redux/thunks/clips";
import { hideEditor, showEditor } from "redux/slices/editor";
import { downloadTransport, stopRecording } from "redux/thunks";
import { BsFiletypeWav } from "react-icons/bs";

const mapStateToProps = (state: RootState) => {
  const canUndo = !!state.session.past?.length;
  const canRedo = !!state.session.future?.length;
  const { projectName } = selectRoot(state);
  const editor = selectEditor(state);
  const onFile = editor.id === "file";

  const transport = selectTransport(state);
  const endTick = transport.loop
    ? transport.loopEnd
    : selectTransportEndTick(state);
  const recording = transport.recording;
  const exportProgress = recording
    ? percentOfRange(transport.offlineTick ?? 0, 0, endTick)
    : 0;
  return { projectName, canUndo, canRedo, onFile, recording, exportProgress };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    toggleFile: (onFile: boolean) => {
      if (onFile) {
        dispatch(hideEditor());
      } else {
        dispatch(showEditor({ id: "file" }));
      }
    },
    setProjectName: (name: string) => dispatch(setProjectName(name)),
    undo: () => dispatch({ type: UndoTypes.undoSession }),
    redo: () => dispatch({ type: UndoTypes.redoSession }),
    saveToHAM: () => dispatch(saveStateToFile),
    saveToMIDI: () => dispatch(saveStateToMIDI),
    saveToWAV: () => dispatch(downloadTransport()),
    stopSavingToWAV: () => dispatch(stopRecording()),
    loadFromHAM: () => dispatch(readFiles),
    loadDemo: () => {
      fetch(window.location.origin + "/harmonia/demos/demo.ham").then((res) => {
        res
          .text()
          .then((text) => {
            loadStateFromString(text);
          })
          .catch((err) => console.log(err));
      });
    },
    clear: () => clearState(),
  };
};

const connector = connect(mapStateToProps, mapDispatchToProps);
type Props = ConnectedProps<typeof connector>;

export default connector(FileControl);

function FileControl(props: Props) {
  const UndoButton = () => (
    <NavButton
      className={`flex-col text-xs p-1 ${
        props.canUndo ? "active:bg-sky-500" : ""
      }`}
      onClick={props.canUndo ? props.undo : undefined}
      disabled={!props.canUndo}
      disabledClass="text-white/50 cursor-default"
      label="undo"
    >
      <CiUndo className="text-3xl" />
    </NavButton>
  );

  const RedoButton = () => (
    <NavButton
      className={`h-full flex flex-col text-xs p-1 ${
        props.canRedo ? "active:bg-sky-500" : ""
      }`}
      onClick={props.canRedo ? props.redo : undefined}
      disabled={!props.canRedo}
      disabledClass="text-white/50 cursor-default"
      label="redo"
    >
      <CiRedo className="text-3xl" />
    </NavButton>
  );
  return (
    <>
      <div className="relative">
        <CiFileOn
          className={`text-3xl select-none cursor-pointer mr-1 ${
            props.onFile ? "text-sky-400" : ""
          }`}
          onClick={() => props.toggleFile(props.onFile)}
        />
        {/* <Label text="Save File" shortText="Save" /> */}
        <NavbarTooltip
          className="bg-sky-800"
          show={!!props.onFile}
          content={<FileTooltipContent {...props} />}
        />
      </div>
      <UndoButton />
      <RedoButton />
    </>
  );
}

function FileTooltipContent(props: Props) {
  const SaveToHAMButton = () => (
    <NavbarFormGroup
      className="pr-1 h-8 hover:bg-sky-600"
      onClick={props.saveToHAM}
    >
      <NavbarFormLabel>Save to HAM</NavbarFormLabel>
      <div className="text-2xl">
        <BiSave />
      </div>
    </NavbarFormGroup>
  );

  const SaveToMIDIButton = () => (
    <NavbarFormGroup
      className="pr-1 h-8 hover:bg-sky-600"
      onClick={props.saveToMIDI}
    >
      <NavbarFormLabel>Export to MIDI</NavbarFormLabel>
      <div className="text-2xl">
        <SiMidi />
      </div>
    </NavbarFormGroup>
  );

  const SaveToWAVButton = () => {
    const percent = props.exportProgress.toFixed(0);
    const finished = props.exportProgress === 100;
    return (
      <NavbarFormGroup
        className="pr-1 h-8 hover:bg-sky-600"
        onClick={props.recording ? props.stopSavingToWAV : props.saveToWAV}
      >
        <NavbarFormLabel className={``}>Export to WAV</NavbarFormLabel>
        <div className="relative flex flex-col text-2xl">
          <BsFiletypeWav className="text-2xl" />
          <Transition
            show={props.recording}
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
            <label
              className={`${finished ? "text-emerald-400" : "text-white/50"}`}
            >
              {finished ? "Exporting..." : "Rendering..."} {percent}%
            </label>
            <button
              className="self-start mt-2 text-center border border-slate-500 bg-slate-800 p-1 px-2 rounded"
              onClick={props.stopSavingToWAV}
            >
              Cancel
            </button>
          </Transition>
        </div>
      </NavbarFormGroup>
    );
  };

  const UploadButton = () => (
    <NavbarFormGroup
      className="pr-1 h-8 hover:bg-sky-600"
      onClick={props.loadFromHAM}
    >
      <NavbarFormLabel>Load from HAM</NavbarFormLabel>
      <div className="text-2xl">
        <BiUpload />
      </div>
    </NavbarFormGroup>
  );

  const DemoButton = () => (
    <NavbarFormGroup
      className="pr-1 h-8 hover:bg-sky-600"
      onClick={props.loadDemo}
    >
      <NavbarFormLabel>Load Demo</NavbarFormLabel>
      <div className="text-2xl">
        <BiMusic />
      </div>
    </NavbarFormGroup>
  );

  const ClearButton = () => (
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
            <Transition
              as={Fragment}
              show={open}
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
                    onClick={props.clear}
                  >
                    Yes
                  </button>
                  <button
                    className="w-1/2 px-2 py-1 rounded border border-slate-500 hover:text-slate-500 hover:drop-shadow cursor-pointer"
                    onClick={close}
                  >
                    No
                  </button>
                </div>
              </Menu.Items>
            </Transition>
          </>
        )}
      </Menu>
    </NavbarFormGroup>
  );

  return (
    <div className="flex flex-col justify-center items-center">
      <input
        className="bg-transparent text-white placeholder-slate-400 placeholder-shown:border-slate-400 rounded mb-2 m-1 text-sm focus:ring-0 border border-slate-300 focus:border-blue-400 focus:bg-sky-700"
        type="text"
        placeholder="New Project"
        value={props.projectName}
        onChange={(e) => props.setProjectName(e.target.value)}
        onKeyDown={blurOnEnter}
      />
      <SaveToHAMButton />
      <UploadButton />
      <SaveToWAVButton />
      <SaveToMIDIButton />
      <DemoButton />
      <ClearButton />
    </div>
  );
}
