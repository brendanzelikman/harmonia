import classNames from "classnames";
import { useTransportTick } from "hooks";
import { useEffect, useMemo, useState } from "react";
import { useProjectSelector } from "types/hooks";
import { getTransport } from "tone";
import { getTransportState } from "types/Transport/TransportFunctions";
import { selectTransport } from "types/Transport/TransportSelectors";

export function NavbarTimer() {
  const tick = useTransportTick();

  // Get the transport state
  const transport = useProjectSelector(selectTransport);
  const transportState = getTransportState(transport);
  const { isStarted, isPaused, isRecording, isIdle } = transportState;

  // Set the displayed time when the tick changes
  const [displayedTime, setDisplayedTime] = useState("0:0:0");
  useEffect(() => {
    setDisplayedTime(getTransport().position.toString());
  }, [tick]);

  // Get the appropriate class for the time input
  const timerClass = useMemo(() => {
    return classNames(
      "font-light block px-2 py-1.5 xl:w-32 w-24 bg-transparent rounded-lg peer transition-all",
      "border appearance-none focus:border-fuchsia-500 focus:outline-none focus:ring-0",
      { "text-red-50 border-red-500": isRecording },
      { "text-gray-50 border-emerald-400": isStarted },
      { "text-gray-100 border-slate-300": isPaused },
      { "text-gray-300 border-slate-500": isIdle }
    );
  }, [isStarted, isPaused, isRecording, isIdle]);

  return (
    <div className="relative">
      <input id="timer" className={timerClass} value={displayedTime} disabled />
      <label
        htmlFor="timer"
        className={`absolute text-xs duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-0 bg-gray-900 rounded px-1 left-1.5`}
      >
        Tick: {tick}
      </label>
    </div>
  );
}
