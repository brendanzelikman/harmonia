import { NavbarTooltipButton } from "components/TooltipButton";
import { CREATE_DRUM_TRACKS_HOTKEY } from "features/Timeline/hooks/useTimelineHotkeys";
import { GiPlantWatering, GiWateringCan } from "react-icons/gi";
import { useProjectDispatch } from "types/hooks";
import { createDrumTracks } from "types/Track/ScaleTrack/ScaleTrackThunks";

export const NavbarDrumTree = () => {
  const dispatch = useProjectDispatch();
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      className="cursor-pointer select-none bg-gradient-radial from-emerald-700/70 to-emerald-500/70 border border-emerald-500 hover:ring-2 hover:ring-slate-300 size-9 p-1"
      borderColor="border-emerald-400/80"
      onClick={() => dispatch(createDrumTracks())}
      hotkey={dispatch(CREATE_DRUM_TRACKS_HOTKEY)}
    >
      <GiPlantWatering className="text-2xl" />
    </NavbarTooltipButton>
  );
};
