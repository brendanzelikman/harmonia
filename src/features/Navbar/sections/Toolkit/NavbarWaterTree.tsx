import { NavbarTooltipButton } from "components/TooltipButton";
import { TOGGLE_LIVE_PLAY_HOTKEY } from "features/Timeline/hooks/useTimelineHotkeys";
import { useCustomEventListener } from "hooks/useCustomEventListener";
import { useMemo, useState } from "react";
import { GiWateringCan } from "react-icons/gi";
import { useProjectDispatch } from "types/hooks";
import { toggleLivePlay } from "types/Timeline/TimelineThunks";

export const NavbarWaterTree = () => {
  const dispatch = useProjectDispatch();
  const [active, setActive] = useState(false);
  const hotkey = useMemo(() => dispatch(TOGGLE_LIVE_PLAY_HOTKEY), []);
  useCustomEventListener("water-tree", (e) => setActive(e.detail));
  return (
    <NavbarTooltipButton
      active={active}
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
