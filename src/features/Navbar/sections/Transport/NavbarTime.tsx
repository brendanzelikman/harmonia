import { use } from "types/hooks";
import { selectTransportState } from "types/Transport/TransportSelectors";
import { useTransportTick } from "hooks/useTransportTick";

export function NavbarTime() {
  const { tick, string } = useTransportTick();
  const { isStarted, isPaused, isRecording, isIdle } =
    use(selectTransportState);
  return (
    <div className={`relative`}>
      <input
        id="timer"
        data-recording={isRecording}
        data-started={isStarted}
        data-paused={isPaused}
        data-idle={isIdle}
        className="font-light block text-white px-2 py-1.5 xl:w-32 w-24 bg-transparent rounded-lg peer data-[recording=true]:border-red-500 data-[started=true]:border-emerald-400 data-[paused=true]:border-slate-300 data-[idle=true]:border-slate-500 border-slate-400"
        value={string}
        disabled
      />
      <label
        htmlFor="timer"
        className="absolute text-xs transform -translate-y-4 scale-75 top-2 z-10 origin-0 bg-gray-900 rounded px-1 left-1.5"
      >
        Tick: {tick}
      </label>
    </div>
  );
}
