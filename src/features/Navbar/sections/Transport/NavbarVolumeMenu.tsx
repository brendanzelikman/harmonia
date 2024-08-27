import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import { useState } from "react";
import {
  BsVolumeMuteFill,
  BsVolumeUpFill,
  BsVolumeDownFill,
  BsVolumeOffFill,
} from "react-icons/bs";
import { useProjectDispatch, useProjectSelector } from "types/hooks";
import { selectTransport } from "types/Transport/TransportSelectors";
import {
  toggleTransportMute,
  setTransportVolume,
} from "types/Transport/TransportThunks";
import { MIN_TRANSPORT_VOLUME, MAX_TRANSPORT_VOLUME } from "utils/constants";
import { percent } from "utils/math";

export function NavbarVolumeMenu() {
  const dispatch = useProjectDispatch();
  const { volume, mute } = useProjectSelector(selectTransport);
  const [hoveringVolume, setHoveringVolume] = useState(false);

  // The volume icon dynamically changes based on the volume.
  const VolumeButton = (
    <NavbarTooltipButton
      className="bg-slate-800 border border-slate-500 hover:ring-1 hover:ring-slate-200 transition-all cursor-pointer relative flex total-center xl:text-3xl text-xl"
      onClick={() => dispatch(toggleTransportMute())}
      keepTooltipOnClick
      marginLeft={50}
      onMouseEnter={() => setHoveringVolume(true)}
      onMouseLeave={() => setHoveringVolume(false)}
    >
      {mute ? (
        <BsVolumeMuteFill className="p-[2px]" />
      ) : volume > -20 ? (
        <BsVolumeUpFill className="p-[2px]" />
      ) : volume > -40 ? (
        <BsVolumeDownFill className="p-[2px]" />
      ) : (
        <BsVolumeOffFill className="p-[2px]" />
      )}
    </NavbarTooltipButton>
  );

  const sliderHeight = 80;
  const volumePercent = percent(
    mute ? MIN_TRANSPORT_VOLUME : volume,
    MIN_TRANSPORT_VOLUME,
    MAX_TRANSPORT_VOLUME
  );
  const sliderTop = -sliderHeight * (volumePercent / 100) + sliderHeight + 15;

  // /** The transport volume slider is rendered as a range slider. */
  const VolumeTooltip = (
    <div className="animate-in fade-in absolute hidden group-hover:block -left-8 p-4 top-8 w-32 h-48">
      <div className="bg-slate-800 flex flex-col rounded size-full relative border-2 border-indigo-500">
        <input
          className="-rotate-90 w-24 -ml-4 mt-12 cursor-pointer accent-white caret-slate-50"
          type="range"
          value={mute ? MIN_TRANSPORT_VOLUME : volume}
          min={MIN_TRANSPORT_VOLUME}
          max={MAX_TRANSPORT_VOLUME}
          onChange={(e) =>
            dispatch(setTransportVolume(parseInt(e.target.value)))
          }
          disabled={mute}
        />
        <div className="mt-12 flex flex-col text-xs text-center">
          {hoveringVolume ? (
            <>
              <>Click to</>
              <span className={mute ? "text-emerald-400" : "text-emerald-200"}>
                {mute ? "Unmute" : "Mute"} Audio
              </span>
            </>
          ) : (
            <>
              {mute ? "Unmute" : "Drag"} to{" "}
              <span className="text-emerald-400">Adjust Gain</span>
            </>
          )}
        </div>
      </div>
      <div
        className={classNames(
          "absolute right-7 mt-3 text-xs font-light",
          mute ? "text-emerald-200" : "text-emerald-400"
        )}
        style={{ top: sliderTop }}
      >
        {mute ? "-∞" : volume}dB
      </div>
    </div>
  );

  /** The transport volume field consists of the volume icon and slider. */
  return (
    <div className="relative group">
      {VolumeButton}
      {VolumeTooltip}
    </div>
  );
}
