import { NavbarTooltipButton } from "../../../components/TooltipButton";
import { useProjectDispatch, useProjectSelector } from "redux/hooks";
import { selectEditor, selectTimeline } from "redux/selectors";
import { GiWaveCrest, GiYarn } from "react-icons/gi";
import { toggleSelectedClipType } from "redux/Timeline";
import classNames from "classnames";
import { isPatternEditorOpen, isPoseEditorOpen } from "types/Editor";
import { showEditor, toggleEditor } from "redux/Editor";

export const NavbarClipTypeButton = () => {
  const dispatch = useProjectDispatch();
  const timeline = useProjectSelector(selectTimeline);
  const editor = useProjectSelector(selectEditor);
  const clipType = timeline.selectedClipType;
  const otherType = clipType === "pattern" ? "pose" : "pattern";
  const onPattern = clipType === "pattern";
  const onEditor = onPattern
    ? isPatternEditorOpen(editor)
    : isPoseEditorOpen(editor);

  const ClipTypeButton = () => {
    const Icon = onPattern ? GiYarn : GiWaveCrest;
    return (
      <NavbarTooltipButton
        label={`Switch To The ${otherType} Toolkit`}
        className={classNames(
          "border h-7 capitalize bg-slate-800/20",
          onPattern ? "border-emerald-600" : "border-fuchsia-600"
        )}
        keepTooltipOnClick
        onClick={() => {
          dispatch(toggleSelectedClipType());
          if (onEditor) dispatch(showEditor(otherType));
        }}
      >
        <Icon className="p-0.5" />
      </NavbarTooltipButton>
    );
  };

  return (
    <div className="relative" id="clip-type-button">
      {ClipTypeButton()}
    </div>
  );
};
