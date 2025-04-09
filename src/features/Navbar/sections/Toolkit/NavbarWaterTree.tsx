import { NavbarTooltipButton } from "components/TooltipButton";
import { TOGGLE_LIVE_PLAY_HOTKEY } from "features/Playground/useTimelineHotkeys";
import { useMemo } from "react";
import { GiWateringCan } from "react-icons/gi";
import { useDispatch } from "hooks/useStore";
import { toggleLivePlay } from "types/Timeline/TimelineThunks";

export const NavbarWaterTree = () => {
  const dispatch = useDispatch();
  const hotkey = useMemo(() => dispatch(TOGGLE_LIVE_PLAY_HOTKEY), []);
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className="cursor-pointer select-none bg-gradient-radial from-sky-700/70 to-sky-500/70 border border-sky-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      borderColor="border-sky-400/80"
      onClick={() => dispatch(toggleLivePlay())}
      hotkey={hotkey}
    >
      <GiWateringCan className="text-2xl" />
    </NavbarTooltipButton>
  );
};
