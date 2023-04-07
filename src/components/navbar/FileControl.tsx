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
import { BiSave, BiTrash, BiUpload } from "react-icons/bi";
import { clearState, readFiles, saveStateToFile } from "redux/util";

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
          className="text-3xl select-none cursor-pointer"
          onClick={() => props.toggleFile(props.onFile)}
        />
        {/* <Label text="Save File" shortText="Save" /> */}
        <NavbarTooltip
          className="bg-gradient-to-t from-sky-900/90 to-slate-800 backdrop-blur"
          show={props.onFile}
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
        <NavbarFormLabel>Clear Project</NavbarFormLabel>
        <BiTrash
          className="pl-2 text-3xl cursor-pointer text-red-500"
          onClick={props.clear}
        />
      </NavbarFormGroup>
    </div>
  );
}
