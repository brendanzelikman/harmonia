import { CiUndo, CiRedo } from "react-icons/ci";
import { useStore } from "hooks/useStore";
import { selectCanRedo, selectCanUndo } from "types/Project/ProjectSelectors";
import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import { redoProject, undoProject } from "app/reducer";

const disabledClass = "text-white/50 cursor-default";
const delay = 200;

const buttonClass = (active: boolean, pulsed?: boolean) =>
  classNames(
    "rounded-full transition-all duration-75 border text-2xl size-9",
    active
      ? "bg-indigo-950/90 active:text-indigo-200 border-indigo-800/80"
      : "bg-indigo-950/50 border-indigo-800/50"
  );

export function NavbarUndo() {
  const canUndo = useStore(selectCanUndo);

  return (
    <NavbarTooltipButton
      className={buttonClass(canUndo)}
      onClick={() => canUndo && undoProject()}
      disabled={!canUndo}
      disabledClass={disabledClass}
      label="Undo Last Action"
    >
      <CiUndo />
    </NavbarTooltipButton>
  );
}

export function NavbarRedo() {
  const canRedo = useStore(selectCanRedo);
  return (
    <NavbarTooltipButton
      className={buttonClass(canRedo)}
      onClick={() => canRedo && redoProject()}
      disabled={!canRedo}
      disabledClass={disabledClass}
      label="Redo Last Action"
    >
      <CiRedo />
    </NavbarTooltipButton>
  );
}
