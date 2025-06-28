import { CiUndo, CiRedo } from "react-icons/ci";
import { useAppValue } from "hooks/useRedux";

import classNames from "classnames";
import { NavbarTooltipButton, TooltipButton } from "components/TooltipButton";
import { redoProject, undoProject } from "app/store";
import { canRedo, canUndo } from "types/Project/ProjectTypes";

const disabledClass = "text-white/50 cursor-default";

const buttonClass = (active: boolean) =>
  classNames(
    "rounded-full transition-all duration-75 text-2xl size-9",
    active ? "active:text-indigo-200" : ""
  );

export function NavbarUndo() {
  const disabled = !useAppValue(canUndo);
  return (
    <TooltipButton
      className={buttonClass(!disabled)}
      onClick={() => !disabled && undoProject()}
      disabled={disabled}
      disabledClass={disabledClass}
      label="Undo Last Action"
      direction="vertical"
    >
      <CiUndo />
    </TooltipButton>
  );
}

export function NavbarRedo() {
  const disabled = !useAppValue(canRedo);
  return (
    <TooltipButton
      className={buttonClass(!disabled)}
      onClick={() => !disabled && redoProject()}
      disabled={disabled}
      disabledClass={disabledClass}
      label="Redo Last Action"
      direction="vertical"
    >
      <CiRedo />
    </TooltipButton>
  );
}
