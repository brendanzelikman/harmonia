import classNames from "classnames";
import { NavbarTooltipButton } from "components/TooltipButton";
import {
  BsStop,
  BsPause,
  BsPlay,
  BsRecord,
  BsArrowRepeat,
} from "react-icons/bs";
import { use, useProjectDispatch } from "types/hooks";
import { selectTransportState } from "types/Transport/TransportSelectors";
import {
  stopTransport,
  toggleTransport,
  toggleTransportRecording,
  toggleTransportLoop,
} from "types/Transport/TransportThunks";

export function NavbarTransportControl() {
  const dispatch = useProjectDispatch();
  const transportState = use(selectTransportState);
  const { isStarted, isStopped, isRecording, isLooping } = transportState;
  const action = isStarted ? "Pause" : isStopped ? "Start" : "Resume";

  return (
    <div className="flex space-x-1.5 text-xl">
      <NavbarTooltipButton
        label="Stop the Timeline"
        className={classNames(
          !isStopped ? "bg-rose-700" : `opacity-50 select-none ${buttonColor}`,
          borderClass
        )}
        disabled={isStopped}
        onClick={() => dispatch(stopTransport())}
      >
        <BsStop className="p-[1px]" />
      </NavbarTooltipButton>
      <NavbarTooltipButton
        label={`${action} the Timeline`}
        className={classNames(
          isStarted ? "bg-emerald-600" : buttonColor,
          borderClass
        )}
        onClick={() => dispatch(toggleTransport())}
      >
        {isStarted ? <BsPause /> : <BsPlay className="pl-[3px] p-[1px]" />}
      </NavbarTooltipButton>
      <NavbarTooltipButton
        label={isRecording ? "Stop Recording to WAV" : "Record to WAV"}
        className={classNames(
          isRecording ? "bg-red-700/90" : buttonColor,
          borderClass
        )}
        onClick={() => dispatch(toggleTransportRecording())}
      >
        <BsRecord className="p-[1px]" />
      </NavbarTooltipButton>
      <NavbarTooltipButton
        label={isLooping ? "Stop Looping the Timeline" : "Loop the Timeline"}
        className={classNames(
          isLooping ? "bg-indigo-700 text-slate-20" : buttonColor,
          borderClass
        )}
        onClick={() => dispatch(toggleTransportLoop())}
      >
        <BsArrowRepeat className="p-[2px]" />
      </NavbarTooltipButton>
    </div>
  );
}

const buttonColor = "bg-slate-800";
const borderClass = "p-1.5 transition-all border border-slate-500";
