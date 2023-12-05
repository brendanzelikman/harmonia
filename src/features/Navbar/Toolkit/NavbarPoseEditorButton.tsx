import { BsPencil } from "react-icons/bs";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectEditor } from "redux/selectors";
import { NavbarToolkitButton } from "../components/NavbarToolkitButton";
import { hideEditor, showEditor } from "redux/Editor";
import { isPoseEditorOpen } from "types/Editor";
import classNames from "classnames";

export const NavbarPoseEditorButton = () => {
  const dispatch = useProjectDispatch();
  const editor = useProjectSelector(selectEditor);
  const onPoseEditor = isPoseEditorOpen(editor);

  const PoseEditorButton = () => {
    const buttonClass = classNames(
      "bg-pink-400/90 border-slate-400/50",
      onPoseEditor
        ? "ring-2 ring-offset-2 ring-pink-400/80 ring-offset-black"
        : ""
    );
    return (
      <NavbarToolkitButton
        className={buttonClass}
        onClick={() =>
          onPoseEditor ? dispatch(hideEditor()) : dispatch(showEditor("pose"))
        }
      >
        <BsPencil className="p-[3px]" />
      </NavbarToolkitButton>
    );
  };

  return (
    <div className="relative" id="pose-editor-button">
      <PoseEditorButton />
    </div>
  );
};
