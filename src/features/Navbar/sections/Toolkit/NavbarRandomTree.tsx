import { NavbarTooltipButton } from "components/TooltipButton";
import { CREATE_RANDOM_TRACKS_HOTKEY } from "pages/Playground/hotkeys/useTimelineHotkeys";
import {
  GiPerspectiveDiceFive,
  GiPerspectiveDiceSixFacesRandom,
  GiWateringCan,
} from "react-icons/gi";
import { useDispatch } from "types/hooks";
import { createRandomHierarchy } from "types/Track/ScaleTrack/ScaleTrackThunks";

export const NavbarRandomTree = () => {
  const dispatch = useDispatch();
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className="cursor-pointer select-none bg-gradient-radial from-fuchsia-700/70 to-fuchsia-500/70 border border-fuchsia-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      borderColor="border-fuchsia-400/80"
      onClick={() => dispatch(createRandomHierarchy())}
      hotkey={dispatch(CREATE_RANDOM_TRACKS_HOTKEY)}
    >
      <GiPerspectiveDiceSixFacesRandom className="text-2xl" />
    </NavbarTooltipButton>
  );
};
