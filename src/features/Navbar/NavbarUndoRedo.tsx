import { CiUndo, CiRedo } from "react-icons/ci";
import { useAppValue } from "hooks/useRedux";

import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import { redoProject, undoProject } from "app/store";
import { canRedo, canUndo } from "types/Project/ProjectTypes";

const disabledClass = "text-white/50 cursor-default";

const buttonClass = (active: boolean) =>
  classNames(
    "rounded-full transition-all duration-75 border text-2xl size-9",
    active
      ? "bg-indigo-950/90 active:text-indigo-200 border-indigo-500"
      : "bg-indigo-950/50 border-indigo-800/50"
  );

export function NavbarUndo() {
  const disabled = !useAppValue(canUndo);

  return (
    <NavbarTooltipButton
      className={buttonClass(!disabled)}
      onClick={() => !disabled && undoProject()}
      disabled={disabled}
      disabledClass={disabledClass}
      label="Undo Last Action"
    >
      <CiUndo />
    </NavbarTooltipButton>
  );
}

export function NavbarRedo() {
  const disabled = !useAppValue(canRedo);
  return (
    <NavbarTooltipButton
      className={buttonClass(!disabled)}
      onClick={() => !disabled && redoProject()}
      disabled={disabled}
      disabledClass={disabledClass}
      label="Redo Last Action"
    >
      <CiRedo />
    </NavbarTooltipButton>
  );
}
