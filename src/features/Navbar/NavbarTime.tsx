import { useSelect } from "hooks/useStore";
import { useTick } from "hooks/useTick";
import { useEffect } from "react";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { stopTransport } from "types/Transport/TransportThunks";
import { useTransport } from "hooks/useTransport";
import { useToggle } from "hooks/useToggle";
import { RECORD_TRANSPORT } from "types/Transport/TransportTypes";

export function NavbarTime() {
  const { tick, string } = useTick();
  const isRecording = useToggle(RECORD_TRANSPORT).isOpen;
  const state = useTransport();

  // If there are no tracks, stop the transport
  const hasTracks = useSelect(selectHasTracks);
  useEffect(() => {
    if (!hasTracks) stopTransport();
  }, [hasTracks]);
  return (
    <div className={`relative`}>
      <input
        id="timer"
        data-recording={isRecording}
        data-started={state === "started"}
        data-paused={state === "paused"}
        data-idle={state === "stopped"}
        className="font-light block text-white px-2 py-1.5 w-28 bg-transparent rounded-lg peer data-[recording=true]:border-red-500 data-[started=true]:border-emerald-400 data-[paused=true]:border-slate-300 data-[idle=true]:border-slate-500 border-slate-400"
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
