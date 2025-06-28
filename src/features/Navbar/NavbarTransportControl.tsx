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

const buttonColor = "bg-slate-800";
const buttonClass = "p-1.5 text-xl transition-all border border-slate-500";

export function NavbarStopTransport() {
  const state = useTransportState();
  const isStopped = state === "stopped";
  return (
    <NavbarTooltipButton
      label="Stop Playback"
      className={classNames(
        !isStopped ? "bg-rose-700" : buttonColor,
        buttonClass
      )}
      onClick={() => stopTransport()}
    >
      <BsStop className="p-[1px]" />
    </NavbarTooltipButton>
  );
}

export function NavbarToggleTransport() {
  const dispatch = useAppDispatch();
  const state = useTransportState();
  const isStarted = state === "started";
  const isStopped = state === "stopped";
  const action = isStarted ? "Pause" : isStopped ? "Start" : "Resume";

  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      label={`${action} Playback`}
      className={classNames(
        isStarted ? "bg-emerald-600" : buttonColor,
        buttonClass
      )}
      onClick={() => dispatch(toggleTransport())}
    >
      {isStarted ? <BsPause /> : <BsPlay className="pl-[3px] p-[1px]" />}
    </NavbarTooltipButton>
  );
}

export function NavbarRecordTransport() {
  const dispatch = useAppDispatch();
  const isRecording = useToggle(RECORD_TRANSPORT).isOpen;
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      label={isRecording ? "Download Recording" : "Record Playback"}
      className={classNames(
        isRecording ? "bg-red-700/90" : buttonColor,
        buttonClass
      )}
      onClick={() =>
        isRecording
          ? dispatch(stopRecordingTransport())
          : dispatch(startRecordingTransport())
      }
    >
      <BsRecord className="p-[1px]" />
    </NavbarTooltipButton>
  );
}

export function NavbarLoopTransport() {
  const dispatch = useAppDispatch();
  const isLooping = useAppValue(selectTransportLoop);
  return (
    <NavbarTooltipButton
      keepTooltipOnClick
      label={isLooping ? "Unloop Playback" : "Loop Playback"}
      className={classNames(
        isLooping ? "bg-indigo-700 text-slate-20" : buttonColor,
        buttonClass
      )}
      onClick={() => dispatch(setLoop())}
    >
      <BsArrowRepeat className="p-[2px]" />
    </NavbarTooltipButton>
  );
}
