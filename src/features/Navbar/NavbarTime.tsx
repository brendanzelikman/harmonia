import { useAppValue } from "hooks/useRedux";
import { useTick, useTickString } from "types/Transport/TransportTick";
import { useEffect } from "react";
import { selectHasTracks } from "types/Track/TrackSelectors";
import { stopTransport } from "types/Transport/TransportState";
import { useTransportState } from "types/Transport/TransportState";
import { useToggle } from "hooks/useToggle";
import { RECORD_TRANSPORT } from "types/Transport/TransportRecorder";

export function NavbarTime() {
  const tick = useTick();
  const string = useTickString();
  const isRecording = useToggle(RECORD_TRANSPORT).isOpen;
  const state = useTransportState();

  // If there are no tracks, stop the transport
  const hasTracks = useAppValue(selectHasTracks);
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
      <label className="absolute text-xs transform -translate-y-4 scale-75 top-2 z-10 origin-0 bg-gray-900 rounded px-1">
        Time
      </label>
    </div>
  );
}
