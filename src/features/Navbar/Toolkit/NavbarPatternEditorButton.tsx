import { BsPencil } from "react-icons/bs";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectEditor } from "redux/selectors";
import { NavbarToolkitButton } from "../components/NavbarToolkitButton";
import { hideEditor, showEditor } from "redux/Editor";
import { isPatternEditorOpen } from "types/Editor";
import classNames from "classnames";

export const NavbarPatternEditorButton = () => {
  const dispatch = useProjectDispatch();
  const editor = useProjectSelector(selectEditor);
  const onPatternEditor = isPatternEditorOpen(editor);

  const PatternEditorButton = () => {
    const buttonClass = classNames(
      `bg-emerald-600 border-slate-400/50`,
      onPatternEditor
        ? "ring-2 ring-offset-2 ring-emerald-600/80 ring-offset-black"
        : ""
    );
    return (
      <NavbarToolkitButton
        className={buttonClass}
        onClick={() =>
          onPatternEditor
            ? dispatch(hideEditor())
            : dispatch(showEditor("pattern"))
        }
      >
        <BsPencil className="p-[3px]" />
      </NavbarToolkitButton>
    );
  };

  return (
    <div className="relative" id="pattern-editor-button">
      <PatternEditorButton />
    </div>
  );
};
