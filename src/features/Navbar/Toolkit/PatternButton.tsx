import { BsPencil } from "react-icons/bs";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectEditor } from "redux/selectors";
import { ControlButton } from ".";
import { hideEditor, showEditor } from "redux/Editor";
import { isPatternEditorOpen } from "types/Editor";

export const ToolkitPatternButton = () => {
  const dispatch = useProjectDispatch();
  const editor = useProjectSelector(selectEditor);
  const onPatternEditor = isPatternEditorOpen(editor);

  const PatternButton = () => {
    const buttonClass = onPatternEditor
      ? "bg-green-500 ring-2 ring-offset-2 ring-green-500/80 ring-offset-black"
      : "bg-green-500/80";
    return (
      <ControlButton
        className={buttonClass}
        onClick={() =>
          onPatternEditor
            ? dispatch(hideEditor())
            : dispatch(showEditor("patterns"))
        }
      >
        <BsPencil className="p-[3px]" />
      </ControlButton>
    );
  };

  return (
    <div className="relative" id="pattern-editor-button">
      <PatternButton />
    </div>
  );
};
