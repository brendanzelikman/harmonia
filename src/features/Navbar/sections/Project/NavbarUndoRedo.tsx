import { CiUndo, CiRedo } from "react-icons/ci";
import { use, useProjectDispatch } from "types/hooks";
import {
  selectCanRedoProject,
  selectCanUndoProject,
} from "types/Project/ProjectSelectors";
import { REDO_PROJECT, UNDO_PROJECT } from "providers/store";
import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";

export function NavbarUndo() {
  const dispatch = useProjectDispatch();
  const canUndo = use(selectCanUndoProject);
  return (
    <NavbarTooltipButton
      className={buttonClass(canUndo)}
      onClick={() => canUndo && dispatch({ type: UNDO_PROJECT })}
      disabled={!canUndo}
      disabledClass={disabledClass}
      label="Undo Last Action"
    >
      <CiUndo />
    </NavbarTooltipButton>
  );
}

export function NavbarRedo() {
  const dispatch = useProjectDispatch();
  const canRedo = use(selectCanRedoProject);
  return (
    <NavbarTooltipButton
      className={buttonClass(canRedo)}
      onClick={() => canRedo && dispatch({ type: REDO_PROJECT })}
      disabled={!canRedo}
      disabledClass={disabledClass}
      label="Redo Last Action"
    >
      <CiRedo />
    </NavbarTooltipButton>
  );
}
const disabledClass = "text-white/50 cursor-default";

const buttonClass = (active: boolean) =>
  classNames(
    "rounded-full border text-2xl",
    active
      ? "bg-zinc-950/50 active:text-indigo-200 border-indigo-800/80"
      : "bg-zinc-900/50 border-indigo-800/50"
  );
