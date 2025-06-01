import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import { useToggle } from "hooks/useToggle";
import { useTransportState } from "types/Transport/TransportState";
import {
  BsStop,
  BsPause,
  BsPlay,
  BsRecord,
  BsArrowRepeat,
  BsDisc,
  BsPower,
} from "react-icons/bs";
import { useAppValue, useAppDispatch } from "hooks/useRedux";
import { selectTransportLoop } from "types/Transport/TransportSelectors";
import { setLoop } from "types/Transport/TransportSlice";
import { stopTransport, toggleTransport } from "types/Transport/TransportState";
import {
  startRecordingTransport,
  stopRecordingTransport,
} from "types/Transport/TransportRecorder";
import { RECORD_TRANSPORT } from "types/Transport/TransportRecorder";
import { getContext } from "tone";
import { useEffect, useState } from "react";

export function NavbarTransportControl() {
  const dispatch = useAppDispatch();
  const state = useTransportState();
  const isRecording = useToggle(RECORD_TRANSPORT).isOpen;
  const isLooping = useAppValue(selectTransportLoop);
  const [isLoaded, setIsLoaded] = useState(false);
  useEffect(() => {
    if (getContext().state === "running") setIsLoaded(true);
  }, []);
  const isStarted = state === "started";
  const isStopped = state === "stopped";
  const action = isStarted ? "Pause" : isStopped ? "Start" : "Resume";

  return (
    <div className="flex space-x-1.5 text-xl">
      <NavbarTooltipButton
        label="Stop Playback"
        className={classNames(
          !isStopped ? "bg-rose-700" : buttonColor,
          borderClass
        )}
        onClick={() => stopTransport()}
      >
        <BsStop className="p-[1px]" />
      </NavbarTooltipButton>
      <NavbarTooltipButton
        keepTooltipOnClick
        label={!isLoaded ? "Start Transport" : `${action} Playback`}
        className={classNames(
          isStarted
            ? "bg-emerald-600"
            : !isLoaded
            ? "bg-emerald-500/40"
            : buttonColor,
          borderClass
        )}
        onClick={() =>
          !isLoaded ? setIsLoaded(true) : dispatch(toggleTransport())
        }
      >
        {isStarted ? (
          <BsPause />
        ) : isLoaded ? (
          <BsPlay className="pl-[3px] p-[1px]" />
        ) : (
          <BsPower />
        )}
      </NavbarTooltipButton>
      <NavbarTooltipButton
        keepTooltipOnClick
        label={isRecording ? "Download Recording" : "Record Playback"}
        className={classNames(
          isRecording ? "bg-red-700/90" : buttonColor,
          borderClass
        )}
        onClick={(e) =>
          isRecording
            ? dispatch(stopRecordingTransport())
            : dispatch(startRecordingTransport())
        }
      >
        <BsRecord className="p-[1px]" />
      </NavbarTooltipButton>
      <NavbarTooltipButton
        keepTooltipOnClick
        label={isLooping ? "Unloop Playback" : "Loop Playback"}
        className={classNames(
          isLooping ? "bg-indigo-700 text-slate-20" : buttonColor,
          borderClass
        )}
        onClick={() => dispatch(setLoop())}
      >
        <BsArrowRepeat className="p-[2px]" />
      </NavbarTooltipButton>
    </div>
  );
}

const buttonColor = "bg-slate-800";
const borderClass = "p-1.5 transition-all border border-slate-500";
