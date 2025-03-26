import { NavbarTooltipButton } from "components/TooltipButton";
import { CREATE_NEW_TREE_HOTKEY } from "features/Timeline/hooks/useTimelineHotkeys";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { useState } from "react";
import { GiPineTree } from "react-icons/gi";
import { useProjectDispatch } from "types/hooks";
import { createNewTree } from "utils/tree";

export const NavbarDesignTree = () => {
  const dispatch = useProjectDispatch();
  const [active, setActive] = useState(false);
  useCustomEventListener("design-tree", (e) => setActive(e.detail));
  return (
    <NavbarTooltipButton
      active={active}
      className="bg-gradient-radial from-indigo-700/70 to-indigo-500/70 border border-indigo-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      borderColor="border-indigo-400"
      onClick={() => dispatch(createNewTree)}
      hotkey={dispatch(CREATE_NEW_TREE_HOTKEY)}
    >
      <GiPineTree className="text-2xl" />
    </NavbarTooltipButton>
  );
};
