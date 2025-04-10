import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import { useState } from "react";
import {
  BsVolumeMuteFill,
  BsVolumeUpFill,
  BsVolumeDownFill,
  BsVolumeOffFill,
} from "react-icons/bs";
import { useSelect, useDispatch } from "hooks/useStore";
import {
  selectTransportMute,
  selectTransportVolume,
  selectTransportVolumePercent,
} from "types/Transport/TransportSelectors";
import { setMute, setVolume } from "types/Transport/TransportSlice";
import { MIN_VOLUME, MAX_VOLUME } from "utils/constants";

export function NavbarVolume() {
  const dispatch = useDispatch();
  const [hovering, setHovering] = useState(false);
  const volume = useSelect(selectTransportVolume);
  const mute = useSelect(selectTransportMute);
  const volumePercent = useSelect(selectTransportVolumePercent);

  return (
    <div className="relative group">
      <NavbarTooltipButton
        className="p-0.5 border border-white/20 hover:ring-1 hover:ring-slate-200 transition-all cursor-pointer relative flex total-center xl:text-3xl text-xl"
        onClick={() => dispatch(setMute())}
        keepTooltipOnClick
        marginLeft={50}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
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
      <div className="animate-in fade-in absolute hidden group-hover:block -left-8 p-4 top-8 w-32 h-48">
        <div
          className={classNames(
            "bg-slate-900 backdrop-blur flex flex-col rounded size-full transition-all duration-300 relative border-2 border-emerald-500/80"
          )}
        >
          <input
            className="-rotate-90 w-24 -ml-4 mt-12 cursor-pointer accent-white caret-slate-50"
            type="range"
            value={mute ? MIN_VOLUME : volume}
            min={MIN_VOLUME}
            max={MAX_VOLUME}
            onChange={(e) => dispatch(setVolume(parseInt(e.target.value)))}
            disabled={mute}
          />
          <div className="mt-12 flex flex-col text-xs text-center">
            {hovering ? (
              <>
                <>Click to</>
                <span
                  className={mute ? "text-emerald-400" : "text-emerald-200"}
                >
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
          style={{
            top: -sliderHeight * (volumePercent / 100) + sliderHeight + 15,
          }}
        >
          {mute ? "-∞" : volume}dB
        </div>
      </div>
    </div>
  );
}

const sliderHeight = 80;
