import { NavbarTooltipButton } from "components/TooltipButton";
import { SampleProjectHotkey, SampleProjectIcon } from "lib/hotkeys/timeline";
import { useAppDispatch } from "hooks/useRedux";
import { sampleProject } from "types/Timeline/TimelineThunks";

export const NavbarSampleProject = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className="select-none bg-radial from-emerald-700/70 to-emerald-500/70 border border-emerald-500 hover:ring-2 hover:ring-slate-300 p-1"
      borderColor="border-emerald-400"
      onClick={() => dispatch(sampleProject())}
      hotkey={SampleProjectHotkey}
    >
      <SampleProjectIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
