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
      className="select-none bg-radial from-teal-700/70 to-teal-500/70 border border-teal-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      borderColor="border-teal-400"
      onClick={() => dispatch(sampleProject())}
      hotkey={SampleProjectHotkey}
    >
      <GiTreeDoor className="text-2xl" />
    </NavbarTooltipButton>
  );
};
