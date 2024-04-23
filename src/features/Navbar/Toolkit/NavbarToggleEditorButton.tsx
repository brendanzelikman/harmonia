import { BsPencil } from "react-icons/bs";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectEditor, selectTimeline } from "redux/selectors";
import { NavbarTooltipButton } from "../../../components/TooltipButton";
import { hideEditor, showEditor } from "redux/Editor";
import { isPatternEditorOpen, isPoseEditorOpen } from "types/Editor";
import classNames from "classnames";

export const NavbarToggleEditorButton = () => {
  const dispatch = useProjectDispatch();
  const editor = useProjectSelector(selectEditor);
  const { selectedClipType } = useProjectSelector(selectTimeline);
  const onPatterns = selectedClipType === "pattern";
  const onEditor = onPatterns
    ? isPatternEditorOpen(editor)
    : isPoseEditorOpen(editor);

  const EditorButton = () => {
    const buttonClass = classNames(
      onPatterns ? "bg-emerald-600" : "bg-pink-400/90",
      `border-slate-400/50`,
      onEditor
        ? `ring-2 ring-offset-2 ring-offset-black ${
            onPatterns ? "ring-emerald-600/80" : "ring-pink-400/80"
          }`
        : ""
    );
    return (
      <NavbarTooltipButton
        className={buttonClass}
        label={
          onEditor
            ? `Close the ${selectedClipType} Editor`
            : `Open the ${selectedClipType} Editor`
        }
        onClick={() =>
          onEditor
            ? dispatch(hideEditor())
            : dispatch(showEditor(selectedClipType))
        }
      >
        <BsPencil className="p-[3px]" />
      </NavbarTooltipButton>
    );
  };

  return (
    <div className="relative" id={`${selectedClipType}-editor-button`}>
      {EditorButton()}
    </div>
  );
};
