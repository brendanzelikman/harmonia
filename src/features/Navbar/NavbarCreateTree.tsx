import { NavbarTooltipButton } from "components/TooltipButton";
import { CreateTreeHotkey, CreateTreeIcon } from "lib/hotkeys/track";
import { useAppDispatch } from "hooks/useRedux";
import { promptUserForTree } from "lib/prompts/tree";

export const NavbarCreateTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      className="bg-radial from-indigo-700/70 to-indigo-500/70 border border-indigo-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      borderColor="border-indigo-400"
      onClick={() => dispatch(promptUserForTree)}
      hotkey={CreateTreeHotkey}
    >
      <CreateTreeIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
