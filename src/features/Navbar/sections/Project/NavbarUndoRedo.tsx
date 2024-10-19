import { CiUndo, CiRedo } from "react-icons/ci";
import { use, useProjectDispatch } from "types/hooks";
import {
  selectCanRedoProject,
  selectCanUndoProject,
} from "types/Project/ProjectSelectors";
import { REDO_PROJECT, UNDO_PROJECT } from "providers/store";
import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { useRef, useState } from "react";

const disabledClass = "text-white/50 cursor-default";
const delay = 200;

const buttonClass = (active: boolean, pulsed?: boolean) =>
  classNames(
    "rounded-full transition-all duration-75 border text-2xl size-9",
    pulsed
      ? "bg-gradient-radial from-indigo-500/5 via-indigo-500/20 to-indigo-500/50 border-indigo-800/80"
      : active
      ? "bg-indigo-950/90 active:text-indigo-200 border-indigo-800/80"
      : "bg-indigo-950/50 border-indigo-800/50"
  );

export function NavbarUndo() {
  const dispatch = useProjectDispatch();
  const canUndo = use(selectCanUndoProject);
  const [pulsed, setPulsed] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  useCustomEventListener("action", (e) => {
    if (e.detail === UNDO_PROJECT) {
      if (timeout.current) clearTimeout(timeout.current);
      setPulsed(true);
      timeout.current = setTimeout(() => {
        setPulsed(false);
      }, delay);
    }
  });

  return (
    <NavbarTooltipButton
      className={buttonClass(canUndo, pulsed)}
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
  const [pulsed, setPulsed] = useState(false);
  const timeout = useRef<NodeJS.Timeout | null>(null);
  useCustomEventListener("action", (e) => {
    if (e.detail === REDO_PROJECT) {
      if (timeout.current) clearTimeout(timeout.current);
      setPulsed(true);
      timeout.current = setTimeout(() => {
        setPulsed(false);
      }, delay);
    }
  });
  return (
    <NavbarTooltipButton
      className={buttonClass(canRedo, pulsed)}
      onClick={() => canRedo && dispatch({ type: REDO_PROJECT })}
      disabled={!canRedo}
      disabledClass={disabledClass}
      label="Redo Last Action"
    >
      <CiRedo />
    </NavbarTooltipButton>
  );
}
