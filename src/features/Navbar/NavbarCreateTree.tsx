import { NavbarTooltipButton } from "components/TooltipButton";
import { CreateTreeHotkey, CreateTreeIcon } from "lib/hotkeys/track";
import { useAppDispatch } from "hooks/useRedux";
import { promptUserForTree } from "lib/prompts/tree";

export const NavbarCreateTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      className="bg-radial from-cyan-900/70 to-cyan-500/70 border border-cyan-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      borderColor="border-cyan-400"
      onClick={() => dispatch(promptUserForTree)}
      hotkey={CreateTreeHotkey}
    >
      <CreateTreeIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
