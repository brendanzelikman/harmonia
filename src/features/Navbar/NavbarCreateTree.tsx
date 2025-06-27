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

export const NavbarCreateTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      className="bg-radial from-cyan-900/70 to-cyan-500/70 border border-cyan-500 hover:ring-2 hover:ring-slate-300 p-1"
      borderColor="border-cyan-400"
      onClick={() => dispatch(promptUserForTree)}
      hotkey={CreateTreeHotkey}
      label={
        <>
          Tree (Musical Structure)
          <br />
          <span className="text-gray-400 text-xs normal-case">
            Press {getHotkeyShortcut(CreateTreeHotkey)} to create a tree of
            tracks by prompt.
          </span>
          <br />
          <span className="text-gray-400 text-xs normal-case">
            Press {getHotkeyShortcut(CreateRandomTreeHotkey)} to create a random
            tree of tracks.
          </span>
          <br />
          <span className="text-gray-400 text-xs normal-case">
            Press {getHotkeyShortcut(SampleProject)} to encapsulate a project by
            file.
          </span>
        </>
      }
    >
      <CreateTreeIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
