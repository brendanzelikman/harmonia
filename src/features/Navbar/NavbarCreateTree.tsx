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
  // return (
  //   <NavbarTooltipButton
  //     className="bg-radial from-cyan-900/70 to-cyan-500/70 border border-cyan-500 hover:ring-2 hover:ring-slate-300 p-1"
  //     borderColor="border-cyan-400"
  //     onClick={() => dispatch(promptUserForTree)}
  //     hotkey={CreateTreeHotkey}
  //     label={
  //       <div className="py-2 min-w-60">
  //         <NavbarTitleForm className="mb-3" value="Tree - Musical Structure" />
  //         <div className="text-sky-400 px-2 text-sm">
  //           Design Families of Tracks
  //         </div>
  //         <div className="flex flex-col gap-2 mt-3">
  //           <div className="border border-slate-500 rounded">
  //             <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-sky-500">
  //               <div>Create Tree</div>
  //               <GiKeyboard className="ml-auto text-2xl" />
  //             </NavbarFormGroup>
  //             <div className="text-xs p-1.5 normal-case text-slate-400">
  //               Press {getHotkeyShortcut(CreateTreeHotkey)} to create a new tree
  //               by prompt.
  //             </div>
  //           </div>
  //           <div className="border border-slate-500 rounded">
  //             <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-emerald-500">
  //               <div>Randomize Tree</div>
  //               <GiDiceSixFacesFive className="ml-auto text-2xl" />
  //             </NavbarFormGroup>
  //             <div className="text-xs p-1.5 normal-case text-slate-400">
  //               Press {getHotkeyShortcut(CreateRandomTreeHotkey)} to create a
  //               random tree.
  //             </div>
  //           </div>
  //           <div className="border border-slate-500 rounded">
  //             <NavbarFormGroup className="px-2 h-8 space-x-4 rounded-b-none bg-slate-950/10 border-b border-b-fuchsia-500">
  //               <div>Encapsulate Tree</div>
  //               <GiFiles className="ml-auto text-2xl" />
  //             </NavbarFormGroup>
  //             <div className="text-xs p-1.5 normal-case text-slate-400">
  //               Press {getHotkeyShortcut(SampleProject)} to load a project in a
  //               tree.
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     }
  //   >
  //     <CreateTreeIcon className="text-2xl" />
  //   </NavbarTooltipButton>
  // );
};
