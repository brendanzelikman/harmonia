import { NavbarTooltipButton } from "components/TooltipButton";
import { WaterTreeHotkey } from "lib/hotkeys/timeline";
import { GiWateringCan } from "react-icons/gi";
import { useAppDispatch } from "hooks/useRedux";
import { toggleLivePlay } from "types/Timeline/TimelineThunks";
import classNames from "classnames";

export const NavbarWaterTree = () => {
  const dispatch = useAppDispatch();
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className={classNames(
        "select-none bg-radial from-sky-700/70 to-sky-500/70 border border-sky-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      )}
      borderColor="border-sky-400/80"
      onClick={() => dispatch(toggleLivePlay())}
      hotkey={WaterTreeHotkey}
    >
      <GiWateringCan className="text-2xl" />
    </NavbarTooltipButton>
  );
};
