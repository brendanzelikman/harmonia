import { NavbarTooltipButton } from "components/TooltipButton";
import { CREATE_NEW_TREE_HOTKEY } from "pages/Playground/hotkeys/useTimelineHotkeys";
import { GiPineTree } from "react-icons/gi";
import { useDispatch } from "types/hooks";
import { promptUserForTree } from "utils/tree";

export const NavbarDesignTree = () => {
  const dispatch = useDispatch();
  return (
    <NavbarTooltipButton
      className="bg-gradient-radial from-indigo-700/70 to-indigo-500/70 border border-indigo-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      borderColor="border-indigo-400"
      onClick={() => dispatch(promptUserForTree)}
      hotkey={dispatch(CREATE_NEW_TREE_HOTKEY)}
    >
      <GiPineTree className="text-2xl" />
    </NavbarTooltipButton>
  );
};
