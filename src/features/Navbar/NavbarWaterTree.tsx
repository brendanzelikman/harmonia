import { NavbarTooltipButton } from "components/TooltipButton";
import { WaterTreeHotkey } from "lib/hotkeys/timeline";
import { GiPineTree } from "react-icons/gi";
import { useAppDispatch } from "hooks/useRedux";
import { toggleLivePlay } from "types/Timeline/TimelineThunks";
import classNames from "classnames";

export const NavbarWaterTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className={classNames(
        "select-none bg-radial from-emerald-700/70 to-emerald-500/70 border border-emerald-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      )}
      borderColor="border-emerald-400/80"
      onClick={() => dispatch(toggleLivePlay())}
      hotkey={WaterTreeHotkey}
    >
      <GiPineTree className="text-2xl" />
    </NavbarTooltipButton>
  );
};
