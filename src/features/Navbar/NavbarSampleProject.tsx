import { NavbarTooltipButton } from "components/TooltipButton";
import { SampleProjectHotkey, SampleProjectIcon } from "lib/hotkeys/timeline";
import { useAppDispatch } from "hooks/useRedux";
import { sampleProject } from "types/Timeline/TimelineThunks";

export const NavbarSampleProject = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className="select-none bg-radial from-cyan-700/70 to-cyan-500/70 border border-cyan-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      borderColor="border-cyan-400"
      onClick={() => dispatch(sampleProject())}
      hotkey={SampleProjectHotkey}
    >
      <SampleProjectIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
