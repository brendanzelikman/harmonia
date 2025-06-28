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
import { NavbarFormGroup, NavbarTitleForm } from "./components/NavbarForm";
import { GiDiceSixFacesFive, GiFiles, GiKeyboard } from "react-icons/gi";

export const NavbarCreateTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      className="bg-radial from-cyan-900/70 to-cyan-500/70 border border-cyan-500 hover:ring-2 hover:ring-slate-300 p-1"
      borderColor="border-cyan-400"
      onClick={() => dispatch(promptUserForTree)}
      hotkey={CreateTreeHotkey}
      label={
        <div className="py-2 min-w-60">
          <NavbarTitleForm className="mb-3" value="Tree - Musical Structure" />
          <div className="text-sky-400 px-2 text-sm">
            Design Families of Tracks
          </div>
          <div className="flex flex-col gap-2 mt-3">
            <div className="border border-slate-500 rounded">
              <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-sky-500">
                <div>Create Tree</div>
                <GiKeyboard className="ml-auto text-2xl" />
              </NavbarFormGroup>
              <div className="text-xs p-1.5 normal-case text-slate-400">
                Press {getHotkeyShortcut(CreateTreeHotkey)} to create a new tree
                by prompt.
              </div>
            </div>
            <div className="border border-slate-500 rounded">
              <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-emerald-500">
                <div>Randomize Tree</div>
                <GiDiceSixFacesFive className="ml-auto text-2xl" />
              </NavbarFormGroup>
              <div className="text-xs p-1.5 normal-case text-slate-400">
                Press {getHotkeyShortcut(CreateRandomTreeHotkey)} to create a
                random tree.
              </div>
            </div>
            <div className="border border-slate-500 rounded">
              <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-fuchsia-500">
                <div>Encapsulate Tree</div>
                <GiFiles className="ml-auto text-2xl" />
              </NavbarFormGroup>
              <div className="text-xs p-1.5 normal-case text-slate-400">
                Press {getHotkeyShortcut(SampleProject)} to load a project in a
                tree.
              </div>
            </div>
          </div>
        </div>
      }
    >
      <CreateTreeIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
