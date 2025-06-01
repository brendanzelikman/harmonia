import { NavbarTooltipButton } from "components/TooltipButton";
import { CreateTreeHotkey, CreateTreeIcon } from "lib/hotkeys/track";
import { useAppDispatch } from "hooks/useRedux";
import { promptUserForTree } from "lib/prompts/tree";

export const NavbarCreateTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      className="bg-radial from-teal-900/70 to-teal-500/70 border border-teal-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      borderColor="border-teal-400"
      onClick={() => dispatch(promptUserForTree)}
      hotkey={CreateTreeHotkey}
    >
      <CreateTreeIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
