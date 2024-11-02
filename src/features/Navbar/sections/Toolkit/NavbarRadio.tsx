import { NavbarTooltipButton } from "components/TooltipButton";
import { GiPocketRadio } from "react-icons/gi";
import { use, useProjectDispatch } from "types/hooks";
import { selectSelectedTrackId } from "types/Timeline/TimelineSelectors";
import {
  createNestedTracks,
  updateTrackByString,
} from "types/Track/ScaleTrack/ScaleTrackThunks";
import { isScaleTrackId } from "types/Track/ScaleTrack/ScaleTrackTypes";

export const NavbarRadio = () => {
  const dispatch = useProjectDispatch();
  const selectedTrackId = use(selectSelectedTrackId);
  return (
    <NavbarTooltipButton
      label={
        <span>
          Equip Radio{" "}
          <span className="font-light text-slate-400">
            (Create Scale Tracks)
          </span>
        </span>
      }
      className="bg-gradient-radial from-emerald-500/20 via-sky-600/50 to-sky-500/90 size-9 p-2"
      borderColor="border-sky-400"
      onClick={() => {
        if (isScaleTrackId(selectedTrackId)) {
          dispatch(updateTrackByString(selectedTrackId));
        } else {
          dispatch(createNestedTracks);
        }
      }}
    >
      <GiPocketRadio />
    </NavbarTooltipButton>
  );
};
