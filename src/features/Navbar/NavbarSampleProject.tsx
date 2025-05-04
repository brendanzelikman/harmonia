import { NavbarTooltipButton } from "components/TooltipButton";
import { SampleProjectHotkey } from "lib/hotkeys/timeline";
import { GiTreeDoor } from "react-icons/gi";
import { useAppDispatch } from "hooks/useRedux";
import { sampleProject } from "types/Timeline/TimelineThunks";

export const NavbarSampleProject = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className="select-none bg-radial from-indigo-700/70 to-indigo-500/70 border border-indigo-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      borderColor="border-indigo-400/80"
      onClick={() => dispatch(sampleProject())}
      hotkey={SampleProjectHotkey}
    >
      <GiTreeDoor className="text-2xl" />
    </NavbarTooltipButton>
  );
};
