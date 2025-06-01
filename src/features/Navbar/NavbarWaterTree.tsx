import { NavbarTooltipButton } from "components/TooltipButton";
import { WaterTreeHotkey, WaterTreeIcon } from "lib/hotkeys/timeline";
import { useAppDispatch } from "hooks/useRedux";
import { toggleLivePlay } from "types/Timeline/TimelineThunks";
import classNames from "classnames";

export const NavbarWaterTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className={classNames(
        "select-none bg-radial from-sky-900/70 to-sky-500/70 border border-sky-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      )}
      borderColor="border-sky-400/80"
      onClick={() => dispatch(toggleLivePlay())}
      hotkey={WaterTreeHotkey}
    >
      <WaterTreeIcon className="text-2xl" />
    </NavbarTooltipButton>
  );
};
