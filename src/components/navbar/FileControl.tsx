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
import { selectEditor, selectRoot } from "redux/selectors";
import { blurOnEnter } from "appUtil";
import { BiMusic, BiSave, BiTrash, BiUpload } from "react-icons/bi";
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

const mapStateToProps = (state: RootState) => {
  const canUndo = !!state.session.past?.length;
  const canRedo = !!state.session.future?.length;
  const { projectName } = selectRoot(state);
  const editor = selectEditor(state);
  const onFile = editor.id === "file";
  return { projectName, canUndo, canRedo, onFile };
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
        props.canUndo ? "active:bg-sky-600/80" : ""
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
        props.canRedo ? "active:bg-sky-600/80" : ""
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
          className="bg-sky-950/80 backdrop-blur"
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
    <NavbarFormGroup className="hover:bg-sky-700/80" onClick={props.saveToHAM}>
      <NavbarFormLabel>Save to File</NavbarFormLabel>
      <BiSave className="px-1 text-3xl" />
    </NavbarFormGroup>
  );

  const UploadButton = () => (
    <NavbarFormGroup
      className="hover:bg-sky-700/80"
      onClick={props.loadFromHAM}
    >
      <NavbarFormLabel>Load from File</NavbarFormLabel>
      <BiUpload className="px-1 text-3xl" />
    </NavbarFormGroup>
  );

  const SaveToMIDIButton = () => (
    <NavbarFormGroup className="hover:bg-sky-700/80" onClick={props.saveToMIDI}>
      <NavbarFormLabel>Save to MIDI</NavbarFormLabel>
      <BiSave className="px-1 text-3xl" />
    </NavbarFormGroup>
  );

  const DemoButton = () => (
    <NavbarFormGroup className="hover:bg-sky-700/80" onClick={props.loadDemo}>
      <NavbarFormLabel>Load Demo</NavbarFormLabel>
      <BiMusic className="px-1 text-3xl" />
    </NavbarFormGroup>
  );

  const ClearButton = () => (
    <NavbarFormGroup className="hover:bg-sky-700/80">
      <Menu as="div" className="relative inline-block text-left w-full">
        {({ open, close }) => (
          <>
            <Menu.Button className="w-full inline-flex items-center">
              <NavbarFormLabel>Clear Project</NavbarFormLabel>
              <BiTrash className="px-1 text-3xl" />
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
              <Menu.Items className="absolute -top-5 -right-[8.5rem] px-2 py-2 bg-sky-950 border border-slate-400 rounded">
                <div
                  className="px-2 pb-1 mb-2 text-red-500 font-bold border-b border-b-slate-500/50]
"
                >
                  Are you sure?
                </div>
                <div className="flex justify-center items-center space-x-2">
                  <button
                    className="w-1/2 px-2 rounded hover:text-red-500 hover:drop-shadow cursor-pointer"
                    onClick={props.clear}
                  >
                    Yes
                  </button>
                  <button
                    className="w-1/2 px-2 rounded hover:text-slate-400 hover:drop-shadow cursor-pointer"
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
        className="bg-transparent rounded mb-2 m-1 text-sm focus:ring-0"
        type="text"
        placeholder="New Project"
        value={props.projectName}
        onChange={(e) => props.setProjectName(e.target.value)}
        onKeyDown={blurOnEnter}
      />
      <SaveToHAMButton />
      <UploadButton />
      <SaveToMIDIButton />
      <DemoButton />
      <ClearButton />
    </div>
  );
}
