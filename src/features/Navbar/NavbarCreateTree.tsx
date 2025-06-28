import { NavbarTooltipButton } from "components/TooltipButton";
import {
  CreateRandomTreeHotkey,
  CreateTreeHotkey,
  CreateTreeIcon,
} from "lib/hotkeys/track";
import { useAppDispatch } from "hooks/useRedux";
import { promptUserForTree } from "lib/prompts/tree";
import { getHotkeyShortcut } from "lib/hotkeys";
import { SampleProject } from "lib/hotkeys/timeline";
import { NavbarTitleForm } from "./components/NavbarForm";

export const NavbarCreateTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      className="bg-radial from-cyan-900/70 to-cyan-500/70 border border-cyan-500 hover:ring-2 hover:ring-slate-300 p-1"
      borderColor="border-cyan-400"
      onClick={() => dispatch(promptUserForTree)}
      hotkey={CreateTreeHotkey}
      label={
        <div className="py-2 min-w-48">
          <NavbarTitleForm className="mb-3" value="Tree - Musical Structure" />
          <div className="text-sky-400 px-2 text-sm">
            Design Families of Tracks
          </div>
          <div className="border-b pt-2 border-slate-500 h-1 w-full mb-2" />
          <div className="flex flex-col gap-1">
            <div className="text-gray-400 text-xs normal-case">
              Press {getHotkeyShortcut(CreateTreeHotkey)} to create a new tree
              by prompt.
            </div>
            <div className="text-gray-400 text-xs normal-case">
              Press {getHotkeyShortcut(CreateRandomTreeHotkey)} to create a
              random tree.
            </div>
            <div className="text-gray-400 text-xs normal-case">
              Press {getHotkeyShortcut(SampleProject)} to sample a project by
              file.
            </div>
          </div>
        </div>
      }
    >
      <CreateTreeIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
