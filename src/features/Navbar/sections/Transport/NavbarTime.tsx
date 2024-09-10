import classNames from "classnames";
import { useEffect, useState } from "react";
import { use } from "types/hooks";
import { getTransport } from "tone";
import { selectTransportState } from "types/Transport/TransportSelectors";
import { useTransportTick } from "hooks/useTransportTick";

export function NavbarTime() {
  const tick = useTransportTick();
  const transportState = use(selectTransportState);
  const { isStarted, isPaused, isRecording, isIdle } = transportState;

  // Set the displayed time when the tick changes
  const [displayedTime, setDisplayedTime] = useState("0:0:0");
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    setDisplayedTime(getTransport().position.toString());
    setTicks(getTransport().ticks);
  }, [tick]);

  return (
    <div className={`relative transition-all duration-300`}>
      <input
        id="timer"
        className={classNames(
          "font-light block px-2 py-1.5 xl:w-32 w-24 bg-transparent rounded-lg peer transition-all",
          "border appearance-none focus:border-fuchsia-500 focus:outline-none focus:ring-0",
          { "text-red-50 border-red-500": isRecording },
          { "text-gray-50 border-emerald-400": isStarted },
          { "text-gray-100 border-slate-300": isPaused },
          { "text-gray-300 border-slate-500": isIdle }
        )}
        value={displayedTime}
        disabled
      />
      <label
        htmlFor="timer"
        className={`absolute text-xs duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-0 bg-gray-900 rounded px-1 left-1.5`}
      >
        Tick: {ticks}
      </label>
    </div>
  );
}
