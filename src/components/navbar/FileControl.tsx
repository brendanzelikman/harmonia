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
import { hideEditor, setProjectName, viewEditor } from "redux/slices/root";
import { selectRoot } from "redux/selectors";
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

const mapStateToProps = (state: RootState) => {
  const canUndo = state.timeline.past.length > 0;
  const canRedo = state.timeline.future.length > 0;
  const { editorState, projectName } = selectRoot(state);
  const onFile = editorState === "file";

  return { projectName, canUndo, canRedo, onFile };
};

const mapDispatchToProps = (dispatch: AppDispatch) => {
  return {
    toggleFile: (onFile: boolean) =>
      onFile ? dispatch(hideEditor()) : dispatch(viewEditor({ id: "file" })),
    setProjectName: (name: string) => dispatch(setProjectName(name)),
    undo: () => dispatch({ type: UndoTypes.undoTimeline }),
    redo: () => dispatch({ type: UndoTypes.redoTimeline }),
    save: () => dispatch(saveStateToFile),
    load: () => dispatch(readFiles),
    loadDemo: () => {
      fetch(window.location.href + "/demos/Scriabinism.ham").then((res) => {
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
  return (
    <>
      <div className="relative">
        <CiFileOn
          className={`text-3xl select-none cursor-pointer ${
            props.onFile ? "text-sky-500" : ""
          }`}
          onClick={() => props.toggleFile(props.onFile)}
        />
        {/* <Label text="Save File" shortText="Save" /> */}
        <NavbarTooltip
          className="bg-gradient-to-t from-sky-800/90 to-slate-900 backdrop-blur"
          show={!!props.onFile}
          content={<FileTooltipContent {...props} />}
        />
      </div>
      <NavButton
        className={`h-full flex flex-col text-xs p-1 ${
          props.canUndo ? "active:bg-sky-600" : ""
        }`}
        onClick={props.canUndo ? props.undo : undefined}
        disabled={!props.canUndo}
        disabledClass="text-white/50 cursor-default"
        label="undo"
      >
        <CiUndo className="text-3xl" />
        {/* <Label text="Undo" /> */}
      </NavButton>
      <NavButton
        className={`h-full flex flex-col text-xs p-1 ${
          props.canRedo ? "active:bg-sky-600" : ""
        }`}
        onClick={props.canRedo ? props.redo : undefined}
        disabled={!props.canRedo}
        disabledClass="text-white/50 cursor-default"
        label="redo"
      >
        <CiRedo className="text-3xl" />
        {/* <Label text="Redo" /> */}
      </NavButton>
    </>
  );
}

function FileTooltipContent(props: Props) {
  return (
    <div className="flex flex-col justify-center items-center">
      <input
        className="bg-transparent rounded mt-1 mb-2"
        type="text"
        placeholder="New Project"
        value={props.projectName}
        onChange={(e) => props.setProjectName(e.target.value)}
        onKeyDown={blurOnEnter}
      />
      <NavbarFormGroup className="flex items-center justify-center space-x-3">
        <NavbarFormLabel>Save to File</NavbarFormLabel>
        <BiSave className="pl-1 text-3xl cursor-pointer" onClick={props.save} />
      </NavbarFormGroup>
      <NavbarFormGroup className="flex items-center justify-center space-x-3">
        <NavbarFormLabel>Load from File</NavbarFormLabel>
        <BiUpload
          className="pl-2 text-3xl cursor-pointer"
          onClick={props.load}
        />
      </NavbarFormGroup>
      <NavbarFormGroup className="flex items-center justify-center space-x-3">
        <NavbarFormLabel>Load Demo</NavbarFormLabel>
        <BiMusic
          className="pl-2 text-3xl cursor-pointer"
          onClick={props.loadDemo}
        />
      </NavbarFormGroup>
      <NavbarFormGroup className="flex items-center justify-center space-x-3">
        <NavbarFormLabel>Clear Project</NavbarFormLabel>
        <div className="relative">
          <Menu as="div" className="relative inline-block text-left">
            {({ open, close }) => (
              <>
                <Menu.Button>
                  <BiTrash className="pl-2 text-3xl cursor-pointer" />
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
                  <Menu.Items className="absolute -top-5 -right-40 px-4 py-2 bg-slate-900/70 border border-slate-400 rounded backdrop-blur">
                    <div className="pb-1 text-red-500">Are you sure?</div>
                    <div className="flex justify-center items-center space-x-2">
                      <button
                        className="w-1/2 hover:text-slate-500"
                        onClick={props.clear}
                      >
                        Yes
                      </button>
                      <button
                        className="w-1/2 hover:text-slate-500"
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
        </div>
      </NavbarFormGroup>
    </div>
  );
}
