import {
  CreateRandomTreeHotkey,
  CreateTreeHotkey,
  CreateTreeIcon,
} from "lib/hotkeys/track";
import { useAppDispatch } from "hooks/useRedux";
import { promptUserForTree } from "lib/prompts/tree";
import { getHotkeyShortcut } from "lib/hotkeys";
import { SampleProject } from "lib/hotkeys/timeline";
import { GiDiceSixFacesFive, GiFiles } from "react-icons/gi";
import {
  NavbarActionButton,
  NavbarActionButtonOption,
} from "./components/NavbarAction";
import { createRandomTree } from "types/Track/ScaleTrack/ScaleTrackThunks";
import { sampleProject } from "types/Timeline/TimelineThunks";

export const NavbarCreateTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarActionButton
      title="Tree (Musical Structure)"
      subtitle="Design Families of Tracks"
      subtitleClass="text-sky-400"
      Icon={<CreateTreeIcon className="text-2xl" />}
      background="bg-radial from-cyan-900/70 to-cyan-500/70"
      borderColor="border-cyan-500"
      onClick={() => dispatch(promptUserForTree)}
    >
      <NavbarActionButtonOption
        title="Create New Tree"
        Icon={<CreateTreeIcon className="ml-auto text-2xl" />}
        subtitle={`Press ${getHotkeyShortcut(
          CreateTreeHotkey
        )} to create a new tree by prompt.`}
        onClick={() => dispatch(promptUserForTree)}
        stripe="border-b-sky-500"
      />
      <NavbarActionButtonOption
        title="Create Random Tree"
        Icon={<GiDiceSixFacesFive className="ml-auto text-2xl" />}
        subtitle={`Press ${getHotkeyShortcut(
          CreateRandomTreeHotkey
        )} to create a random tree.`}
        stripe="border-b-emerald-500"
        onClick={() => dispatch(createRandomTree())}
      />
      <NavbarActionButtonOption
        title="Import Project To Tree"
        Icon={<GiFiles className="ml-auto text-2xl" />}
        subtitle={`Press ${getHotkeyShortcut(
          SampleProject
        )} to load a project in a tree.`}
        stripe="border-b-fuchsia-500"
        onClick={() => dispatch(sampleProject())}
      />
    </NavbarActionButton>
  );
};
