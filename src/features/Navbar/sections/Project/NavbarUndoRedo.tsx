import { CiUndo, CiRedo } from "react-icons/ci";
import { NavbarTooltipButton } from "../../components";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import {
  selectCanRedoProject,
  selectCanUndoProject,
} from "types/Project/ProjectSelectors";
import { UNDO_PROJECT } from "providers/store";

export function NavbarUndoRedo() {
  const dispatch = useProjectDispatch();
  const canUndo = useProjectSelector(selectCanUndoProject);
  const canRedo = useProjectSelector(selectCanRedoProject);

  /** The undo button allows the user to undo the arrangement. */
  const UndoButton = () => (
    <NavbarTooltipButton
      className={`rounded-full border ${
        canUndo
          ? "bg-zinc-950/50 active:text-indigo-200 border-indigo-800/80"
          : "bg-zinc-900/50 border-indigo-800/50"
      }`}
      onClick={() => canUndo && dispatch({ type: UNDO_PROJECT })}
      disabled={!canUndo}
      disabledClass="text-white/50 cursor-default"
      label="Undo Last Project Change"
    >
      <CiUndo className="text-2xl" />
    </NavbarTooltipButton>
  );

  /** The redo button allows the user to redo the arrangement. */
  const RedoButton = () => (
    <NavbarTooltipButton
      className={`rounded-full border ${
        canRedo
          ? "bg-zinc-950/50 active:text-indigo-200 border-indigo-800/80"
          : "bg-zinc-900/50 border-indigo-800/50"
      }`}
      onClick={() => canRedo && dispatch({ type: "project/redo" })}
      disabled={!canRedo}
      disabledClass="text-white/50 cursor-default"
      label="Redo Last Project Change"
    >
      <CiRedo className="text-xl" />
    </NavbarTooltipButton>
  );

  return (
    <div className="flex gap-2 px-1">
      <UndoButton />
      <RedoButton />
    </div>
  );
}
