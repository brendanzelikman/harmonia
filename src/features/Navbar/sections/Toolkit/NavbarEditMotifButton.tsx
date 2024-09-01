import { BsPencil } from "react-icons/bs";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import classNames from "classnames";
import { NavbarHoverTooltip } from "features/Navbar/components";
import { hideEditor } from "types/Editor/EditorSlice";
import { selectIsSelectedEditorOpen } from "types/Editor/EditorSelectors";
import { selectSelectedMotif } from "types/Timeline/TimelineSelectors";
import { selectSelectedMotifName } from "types/Arrangement/ArrangementScaleSelectors";
import { showEditor } from "types/Editor/EditorThunks";
import { NavbarToolkitProps } from "../NavbarToolkitSection";

export const NavbarEditMotifButton = ({
  type,
  motifBackground,
  motifBorder,
  motifText,
}: NavbarToolkitProps) => {
  const dispatch = useProjectDispatch();
  const name = useProjectSelector(selectSelectedMotifName);
  const disabled = useProjectSelector(selectSelectedMotif) === undefined;
  const active = useProjectSelector(selectIsSelectedEditorOpen);

  const ringColor = {
    pattern: "ring-emerald-600/80",
    pose: "ring-pink-400/80",
    scale: "ring-sky-400/80",
  }[type];

  const Button = () => {
    const buttonClass = classNames(
      motifBackground,
      `border-slate-400/50 transition-all`,
      "size-8 xl:size-9 flex total-center rounded-full",
      disabled ? "cursor-default opacity-75" : "cursor-pointer opacity-100",
      disabled
        ? ""
        : active
        ? `ring-2 ring-offset-2 ring-offset-black ${ringColor}`
        : "hover:ring-2 hover:ring-slate-300"
    );
    return (
      <div
        className={buttonClass}
        onClick={() =>
          disabled
            ? null
            : active
            ? dispatch(hideEditor({ data: null }))
            : dispatch(showEditor({ data: { view: type } }))
        }
      >
        <BsPencil className="p-[3px]" />
      </div>
    );
  };

  const Tooltip = () => (
    <NavbarHoverTooltip
      className={`-left-16 whitespace-nowrap`}
      borderColor={motifBorder}
      padding="px-3 py-2"
    >
      <span className={active ? motifText : ""}>
        {active ? "Editing" : "Edit"} <span className="font-bold">{name}</span>
      </span>
    </NavbarHoverTooltip>
  );

  return (
    <div className="relative group" id={`${type}-editor-button`}>
      {Button()}
      {!disabled && Tooltip()}
    </div>
  );
};
