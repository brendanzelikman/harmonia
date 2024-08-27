import { CiUndo, CiRedo } from "react-icons/ci";
import { NavbarTooltipButton } from "../../components";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import {
  selectCanRedoProject,
  selectCanUndoProject,
} from "types/Meta/MetaSelectors";
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
          ? "bg-slate-900 active:text-indigo-200 border-indigo-700"
          : "bg-slate-800 border-indigo-700/50"
      }`}
      onClick={() => canUndo && dispatch({ type: UNDO_PROJECT })}
      disabled={!canUndo}
      disabledClass="text-white/50 cursor-default"
      label="Undo the Last Timeline Action"
    >
      <CiUndo className="p-[2px] text-3xl" />
    </NavbarTooltipButton>
  );

  /** The redo button allows the user to redo the arrangement. */
  const RedoButton = () => (
    <NavbarTooltipButton
      className={`rounded-full border border-indigo-700 ${
        canRedo
          ? "bg-slate-900 active:text-indigo-200 border-indigo-700"
          : "bg-slate-800 border-indigo-700/50"
      }`}
      onClick={() => canRedo && dispatch({ type: "project/redo" })}
      disabled={!canRedo}
      disabledClass="text-white/50 cursor-default"
      label="Redo the Last Timeline Action"
    >
      <CiRedo className="p-[2px] text-3xl" />
    </NavbarTooltipButton>
  );

  return (
    <>
      <UndoButton />
      <RedoButton />
    </>
  );
}
